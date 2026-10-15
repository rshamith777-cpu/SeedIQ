# SeedIQ Datasets

This repository directory contains all training, testing, benchmarking, and environmental datasets utilized to train, cross-validate, and evaluate the SeedIQ multi-model machine learning architecture.

## Structure

```
datasets/
├── Train Dataset.csv                       # Consolidated training dataset
├── Test Dataset.csv                        # Consolidated testing dataset
├── README.md                               # Dataset inventory & documentation
└── train/                                  # Complete training and model data collection
    ├── Train Dataset.csv                   # Main multi-feature training dataset
    ├── Crop_recommendation.csv             # Crop Recommendation dataset
    ├── Crop_recommendation (1).csv         # Secondary crop dataset
    ├── Crop Yiled with Soil and Weather.csv# Soil & weather yield dataset
    ├── crop-yield.csv                      # Primary yield dataset
    ├── Crop_Yield_Prediction.csv           # Model validation yield dataset
    ├── crop_production_karnataka.csv       # Karnataka regional yield dataset
    ├── Seed_Data.csv                       # Seed viability dataset
    ├── seed_viability_data.csv             # Seed viability laboratory test dataset
    ├── merged_ml_dataset.csv               # Multi-parameter ML merged training dataset
    ├── karnataka_crop_dataset_V2.csv       # Karnataka crop dataset v2
    ├── Soil-Climate-data.csv               # Combined soil & climate readings
    ├── climate_change_impact_on_agriculture_2024.csv # Climate agriculture data
    ├── climate_nasa.csv                    # NASA climate metrics
    ├── dataset_From_Nasa.csv               # NASA weather & solar radiation dataset
    ├── historical_weather_data.csv         # Weather time-series
    ├── Weather Data.csv                    # Regional weather parameters
    ├── rainfall in india 1901-2015.csv     # Historical rainfall data
    ├── district wise rainfall normal.csv   # District rainfall normals
    ├── soil_data_karnataka.csv             # Karnataka soil analysis
    ├── climate_data_karnataka.csv          # Karnataka climate measurements
    ├── karnataka.csv                       # Karnataka state agricultural metrics
    ├── ICRISAT-District Level Data.csv     # ICRISAT agricultural statistics
    ├── pesticides.csv                      # Pesticide usage records
    ├── produce.csv                         # Agricultural market output records
    ├── data_season.csv                     # Seasonal crop mapping
    ├── storage_recommendations.csv         # Post-harvest storage rules
    ├── datafile.csv, datafile (1-3).csv    # Regional raw agro-climatic datasets
    ├── Bangalore.xlsx                      # Bangalore regional data
    ├── Copy of data2(1).xlsx               # Supplemental agro-meteorological records
    └── dataset_soilph_soilmoisture_temperature.xlsx # Soil sensor readings
```
