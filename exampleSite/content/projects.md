+++
title = "Projects"
description = "Technical projects and research work"
date = "2025-01-28"
author = "Subha Vadlamannati"
+++

# Projects

---

## Multi-resolution Satellite Fusion for Canopy Height Prediction
**Python, PyTorch, CUDA, AWS** | December 2025

A deep learning system for predicting global forest canopy height from satellite imagery.

### Key Achievements
- Developed a multi-resolution fusion CNN (3.6M parameters) to predict global forest canopy height from optical satellite imagery
- Architected distributed training infrastructure across 8 GPUs using PyTorch DDP with NCCL backend, implementing GPU-resident data loading (14GB dataset on-GPU), mixed precision training, and automatic batch scaling with linear learning rate rules
- Built end-to-end data curation pipeline processing 3TB+ of raw satellite imagery from AWS, implementing quality filtering on GEDI LiDAR measurements, forest masking via ESA WorldCover, and spatial GroupKFold splitting to prevent data leakage

---

## HILITE: Human-in-the-loop Interactive Tool for Image Editing
**Next.js, FastAPI, PyTorch, RunPod** | 2024-2025

An open-source interactive image-editing platform integrating multiple state-of-the-art diffusion models.

### Key Features
- Integrates six diffusion models including InstructPix2Pix, AnyDoor, and others
- Human-in-the-loop workflow for iterative feedback collection
- Serverless GPU infrastructure for scalable inference
- Published at EMNLP 2025 HCI + NLP workshop

---

## Edulang
**Fullstack Web Application** | OpenNLP Labs

An educational language learning platform designed for refugees and underserved communities.

### Impact
- Serving 1000+ users across 108+ languages
- Built in collaboration with CMU's Neulab & Stanford SAIL
- Part of the suite that earned NASDAQ Times Square feature

---

## Polyglo
**Fullstack Web Application** | OpenNLP Labs

A multilingual resource platform connecting refugees with essential services in their native languages.

---

## HeritageHub
**Fullstack Web Application** | OpenNLP Labs

A platform for preserving and sharing cultural heritage through language and storytelling.

---

## Partially Tensorized Transformers (PTNN)
**PyTorch, Tensor Decomposition** | 2023

A novel approach to model compression for vision-language models.

### Results
- Compressed BERT and ViT models by 53%
- Improved accuracy by up to 5% without post-training adjustments
- Published at ICAART 2023
