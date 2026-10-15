# SeedIQ Datasets

This directory contains the training and testing datasets utilized across the SeedIQ machine learning and quantum-classical hybrid pipeline.

## Directory Structure

```
datasets/
├── Train Dataset.csv                  # Full consolidated training dataset (18,081 records)
├── Test Dataset.csv                   # Full consolidated testing dataset (18,081 records)
├── train/                             # Training datasets for individual models
│   ├── Train Dataset.csv              # Primary training split
│   ├── Crop_recommendation.csv        # Crop Recommendation training dataset
│   ├── Crop Yiled with Soil and Weather.csv # Yield Prediction training dataset
│   ├── Seed_Data.csv                  # Seed Viability training dataset
│   ├── crop_production_karnataka.csv  # Historical Karnataka crop yield dataset
│   ├── seed_viability_data.csv        # Seed viability benchmark dataset
│   └── merged_ml_dataset.csv          # Merged multi-parameter ML training dataset
└── test/                              # Testing datasets
    └── Test Dataset.csv               # Primary testing split
```

## Model Tasks & Data Sources

| Task | Primary Training Dataset | Target Column | Key Features |
| :--- | :--- | :--- | :--- |
| **Crop Recommendation** | `Crop_recommendation.csv` / `Train Dataset.csv` | `Crop` / `label` | Nitrogen, Phosphorus, Potassium, Temperature, Humidity, pH, Rainfall |
| **Yield Prediction** | `Crop Yiled with Soil and Weather.csv` | `Yield_Tonnes` | Fertilizer, Temperature, N, P, K, Area |
| **Seed Viability** | `Seed_Data.csv` / `seed_viability_data.csv` | `Viable` / `target` | Area, Perimeter, Compactness, Kernel Length, Kernel Width, Asymmetry |
