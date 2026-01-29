
Hi everyone! Today we'll be looking into how to build a performant matmul kernel using the B200 :)

I'll be going over the code that I wrote step by step and explaining how we're able to come up with this.

First, if we think about matrix multiplication, we essentially want to solve the problem of having two large matrices, $A$ and $B$ and finding $C = AB$ where $A = M \times K, B = K \times N, C = M \times N$. 

## Setup
We use a persistent kernel approach in which we have 148 blocks running at the same time, such that there's one block running on each SM throughout the execution. Within each block, we have 256 threads which are split up as following: 
	We have 2 warpgroups (consumer + producer warpgroups), and within each warpgroups we have 4 warps which each have 32 threads. 

![[B200 Matmul Implementation.jpeg]]

### Understanding Persistent Kernels
Standard approach - typically, we would define a grid of blocks that match the total size of the problemk like launching 10,000 blocks. The GPU scheduler would manage these blocks and assign some number of them to each of the SMs on the B200 (148). When a block finishes, the SM retires it and the scheduler fetches a new one from the queue. 

Problems: Every time a new block starts, it has to pull data from global memory to SMEM, which is slow. Additionally, there is some small cost to scheduling. 

Solution: Persistent kernels. Instead of launchign a block for each piece of data we have (e.g. all the broken down tiles we have to multiply), we launch exactly enough blocks to fill the hardware, like launching 148 blocks for the 148 SMs on the B200. These blocks never actually finish, but rather tun a `while` loop, which grabs a random tile of the matrix that isn't done and then immediately moves onto the next tile when it's done processing. 

![Cornell Virtual Workshop > Understanding GPU Architecture > GPU Memory >  Memory Levels | 300](https://cvw.cac.cornell.edu/gpu-architecture/gpu-memory/GPUMemLevels.png)

Why is this good: Multiple blocks often need the same tiles of the input matrices. In a standard kernel, when a block finishes, its cache is replaced/zerod out. However, in a persistent kernel, it can reuse any data already sitting in the L2 cache or register files. 
- However in practice in my implementation, I haven't implemented any sort of software scheduler that would grab tiles that are near eachother so this wouldn't really help

Main speedups of Persistent Kernels in my work:
- In each SM, we're allocating TMEM with tcgen05.alloc and setting up TMA descriptors and by using a persistent kernel we don't have to keep doing these steps over and over again

### Understanding Pipelining
To make this efficient, we use a technique called pipelining. This means that we have s ring buffer which has `PIPE_DEPTH = 4` slots in it. While the consumer computes on slot $X$, the producer would load into slot $(X+3) \mod 4$. 

### Understanding TMA
**TMA** (Tensor Memory Accelerator) helps us move data from global to shared memory

### Understanding TMEM
**TMEM** (Tensor Memory) is a new type of memory in the Blackwell architecture which acts as a dedicated accumulator memory for tensor core operations being done. 

- TMEM can be shared across multiple SMs 
- TMEM only stores the *results* of matrix multiplication operations, not the actual A and B tiles

What happened in the past? 
- In older architectures, tensor cores took data from SMEM and then stored the result in the registers 
- TMEM essentially replaces the register file as the destination for tensor core outputs
- SMEM is still used for the input tiles themselves (A, B) but TMEM is used for the accumulator (C and D)

```c++
// Example of TMEM allocation!
// (doesn't matter what warp u use to allocate TMEM, here we're using warp 1)

if (threadIdx.x >= 32 && threadIdx.x < 64) { // warp 1
const int addr = static_cast<int>(__cvta_generic_to_shared(tmem_base)); // Converting memory address to shared memory of tmem_base in slot 1

// PTX code starting 
asm volatile(

"tcgen05.alloc.cta_group::1.sync.aligned.shared::cta.b32 [%0], %1;"
:: "r"(addr), "r"(num_cols)
: "memory"
);
}

__syncthreads(); // Ensure everyone got tmem base!
```


## Iterating Through Blocks
`for (int tile_id = blockIdx.x; tile_id < total_tiles; tile_id += gridDim.x)`
This means that block 0 would take Tile 0, Tile 148, Tile 296
Block 1 would take Tile 1, Tile 149, Tile 297, etc.

Note: How do I figure out what are the (x,y) coordinates of Tile 148 or something? 
- `int tile_row = tile_id / num_tiles_n;` 
- `int tile_col = tile_id % num_tiles_n;`
- This means that to iterate throughout the matrix, we go on a particular row and then go through that entire row, then onto the next row, etc.

## Producer Threads
Our kernel processes the output matrix $C$ in tiles of $128 \times 256$ elements. For each output tile, each thread will own its own $8 \times 16$ sub-block of the output tile, which means that each thread needs to sum $\sum_{k=0}^{K-1} A[i,k] \cdot B[k,j]$. This is because each row and column of $A$ and $B$ are too large to store in the shared memory, so we process it in chunks of size `TILE_K=64`. 

Only a single thread is needed to launch the `MMA` operation, however all threads in the warp need to cooperate on this operation to provide matrix fragments. 

The B200 now has FP4 tensor cores (which we don't use here, but we use other tensor cores) as well as the TMA (Tensor Memory Accelerator) which allows us to accelerate the movement of GMEM to SMEM in the project during the producer thread's lifecycle. 

Aside on the inputs and what these mean - we use BF16 inputs with FP32 accumulation. 

BF16 is a 16 bit floating point format which takes in 1 sign bit, 8 exponent bits, and then 7 mantissa bits. It has a precision of about ~3 decimal digits  but it has a dynamic range of around $3.4 * 10^{38}$. 
- In comparison to FP16, that gives us more precision but has a very narrow range which lets us express numbers up to approximately 65,000

Now, because we have these things called tensor cores, they compute MMA (matrix-multiply-accumulate) operations in a single instruction. This means we can essentially have a massive speedup by decomposing our large matrix multiplication into a series of smaller MMs and then combining them all together. 

## Consumer Threads

### Barriers
- Barrier is a piece of shared memory with some state
- `__shared__ alignas(8) uint84_t mma_mbar[1]`
- This means we have 8 bytes of some sort of state
- When Initialized, it looks like something like this

```
arrival_count: 0 (waiting to turn to 1)
phase: 0
completed: false
```

Once the MMA finishes it signals the barrier and this changes
```
arrival_count: 1
phase: 1
completed: true
```

However, this is a **persistent state.** When a new iteration starts (e.g. we move onto the next k_tile at the start of the loop, it might say `completed=true` from a previous iteration). We could fix this by re-initializing the barrier at the start of each loop for `k_tile`, but that is very costly to do `mbarrier.init` operations, so rather we can just define a phase bit to distinguish between cycles of the for loop!

### Lifecycle of a Consumer

1. Consumer waits for TMA data from the `k_tile` it's supposed to compute
2. Thread 0 issues MMA operations by looping through k2 values 
3. Commit - tell barrier to signal with MMA is done
4. Wait for MMA completion 
	1. This is where mma_phase is used, helps us tell whether MMA is done
5. Flip phase for next iteration


Right now, essentially one thread per consumer is issuing the `tcgen05.mma` instructions, but it performs at a warp level (e.g. 32 threads load in their A chunks and B chunks from SMEM). 

Now, each block wants to compute its $256 \times 128$ tile of $C$. These tiles are then further broken up by `TILE_K=64`, since clearly we can't load an entire row of $A$ and an entire row of $B$ into the SMEM in order to perform computation of one output element of $C$.

Therefore, we use a strategy where we break $A$ down into $128 \times 64$ chunks and then $B$ into $64 \times 256$ chunks and then further we break those chunks down into $4$ parts, because based on [this documentation here](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html) it's actually not possible to do the entire MMA on the $64$ dimension chunks for fp32, so we need to break it down into $16$ dimension chunks and run our for loop, as described below:

```c++
constexpr int MMA_K = 16; // this means we process 16 K elements per MMA

#pragma unroll

for (int k2 = 0; k2 < TILE_K / MMA_K; k2++) {

// Each k2 iteration processes 16 K elements (32 bytes)

uint64_t a_desc = make_desc(a_addr + k2 * 32);
uint64_t b_desc = make_desc(b_addr + k2 * 32);

// First iteration zeros accumulator, the rest accumulate

if (k_tile == 0 && k2 == 0) {
// D = A*B (enable_d = false, no accumulation)

asm volatile(

"{\n\t"
".reg .pred p;\n\t"
"setp.eq.u32 p, 0, 1;\n\t" // p = false
"tcgen05.mma.cta_group::1.kind::f16 [%0], %1, %2, %3, {%4, %4, %4, %4}, p;\n\t"
"}"
:
: "r"(tmem_base[0]), "l"(a_desc), "l"(b_desc), "r"(idesc), "r"(0)
: "memory"
);
} else {

// D = A*B + D (enable_d = true, accumulate)

asm volatile(

"{\n\t"
".reg .pred p;\n\t"
"setp.eq.u32 p, 1, 1;\n\t" // p = true
"tcgen05.mma.cta_group::1.kind::f16 [%0], %1, %2, %3, {%4, %4, %4, %4}, p;\n\t"
"}"
:
: "r"(tmem_base[0]), "l"(a_desc), "l"(b_desc), "r"(idesc), "r"(0)
: "memory"
);}}
```

Then, after we've sent off the MMA command, we can simply use tcgen05.commit commands to help us signal the mbarrier when MMA finishes, and free up this thread to do other work.

```C++
asm volatile(
"tcgen05.commit.cta_group::1.mbarrier::arrive::one.shared::cluster.b64 [%0];"
:: "r"(mma_mbar_addr) : "memory"
);
```

See diagram for explanation:

![[B200 Matmul Implementation 2.jpeg]]


## Slowness -> Fastness
How do we optimize from 800 TFLOPs now? 

Well, there was a problem with my code (Date 1/24 code). Essentially what I did was in each `k_tile`, I waited for the TMA file arrival, issued 4 MMAs based on the k2 values, committed to mma_mbar and then immediately waited on mma_mbar, *then* moved to the next k_tile.

What this meant was that I was performing a synchronous pipeline at the `k_tile` level, not letting the threads move onto the next `k_tile` until all the MMAs on the current `k_tile` finished, which doesn't make sense because MMA happens asynchronously. 

Instead of waiting on each `k_tile`, we just need to instead make sure that before the TMA loads new data into stage S, wait until the MMA work that used some stage S is complete. Therefore the TMA warp doesn't overwrite anything too early. 

This is called **multi-stage pipelining** using a circular buffer. A **stage** is formally defined as one slot in our ring buffer that holds the $A$ and $B$ tiles for one `k_tile` iteration that's going to be consumed by the MMA operation. In practice, each stage is around $48 KB$ since $A = 16 KB$ and $B = 32 KB$. Therefore, with `PIPE_DEPTH=4` our total staging is around $192 KB$ which is pretty big

They should separate responsibilities:

- **Consumer/MMA warp:** “I submitted MMA for stage s; I’ll `commit` to `mma_mbar[s]` and keep going.”
- **Producer/TMA warp:** “Before I overwrite stage s, I will wait on `mma_mbar[s]`.”

Therefore, instead of having `mma_mbar[1]` we should define `mma_mbar[NUM_STAGES]` where on the producer side, we wait on `mma_mbar[stage]` before reusing that slot and the consumer never waits on MMA, just issues, commits, and moves on. 

Yay! After fixing that bug, we got to around  $\approx 1200$ TFLOPs which is good enough for me!
