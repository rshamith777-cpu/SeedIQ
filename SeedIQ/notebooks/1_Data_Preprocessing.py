import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import os

# Create dummy datasets for demonstration
os.makedirs('data', exist_ok=True)

print("Generating dummy datasets for SeedIQ...")

# 1. merged_ml_dataset.csv (General crop & soil data)
df_merged = pd.DataFrame({
    'Nitrogen': np.random.randint(50, 150, 100),
    'Phosphorus': np.random.randint(20, 80, 100),
    'Potassium': np.random.randint(20, 80, 100),
    'Temperature': np.random.uniform(15, 35, 100),
    'Humidity': np.random.uniform(40, 90, 100),
    'pH': np.random.uniform(5.5, 7.5, 100),
    'Rainfall': np.random.uniform(50, 300, 100),
    'Crop': np.random.choice(['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton'], 100)
})
df_merged.to_csv('data/merged_ml_dataset.csv', index=False)

# 2. crop_production_karnataka.csv
df_yield = pd.DataFrame({
    'Crop': np.random.choice(['Rice', 'Wheat', 'Maize'], 100),
    'Season': np.random.choice(['Kharif', 'Rabi', 'Zaid'], 100),
    'Area_Hectares': np.random.uniform(1, 10, 100),
    'Yield_Tonnes': np.random.uniform(2, 20, 100)
})
df_yield.to_csv('data/crop_production_karnataka.csv', index=False)

# 3. seed_viability_data.csv
df_seed = pd.DataFrame({
    'Moisture_Level': np.random.uniform(8, 15, 100),
    'Weight_g': np.random.uniform(30, 70, 100),
    'Viable': np.random.choice([0, 1], 100)
})
df_seed.to_csv('data/seed_viability_data.csv', index=False)

print("Dummy data generated.")

# --- Preprocessing Pipeline ---

def preprocess_crop_data():
    df = pd.read_csv('data/merged_ml_dataset.csv')
    # Handle missing values
    df.fillna(df.mean(numeric_only=True), inplace=True)
    
    # Feature Scaling
    scaler = StandardScaler()
    X = df.drop('Crop', axis=1)
    X_scaled = scaler.fit_transform(X)
    
    # Encoding
    le = LabelEncoder()
    y = le.fit_transform(df['Crop'])
    
    return train_test_split(X_scaled, y, test_size=0.2, random_state=42)

print("Preprocessing complete. Data ready for training.")
