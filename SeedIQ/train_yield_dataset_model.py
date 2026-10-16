import os
import sys
import pickle
import json
import datetime
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
from xgboost import XGBRegressor
from sklearn.ensemble import RandomForestRegressor

# Ensure local imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from qml_model import SimulatedQuantumRegressor

REGISTRY_FILE = "training_registry.json"

def safe_pickle_save(obj, filename):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'wb') as f:
        pickle.dump(obj, f)
    print("[*] Saved " + filename)

def train_and_export_yield_models():
    print("=" * 60)
    print("Training Real Dataset Yield Models for SeedIQ")
    print("=" * 60)

    # 1. Load Crop_Yield_Prediction.csv
    base_dir = os.path.dirname(os.path.abspath(__file__))
    df1_path = os.path.join(base_dir, 'data', 'Crop_Yield_Prediction.csv')
    df1 = pd.read_csv(df1_path).rename(columns={'pH_Value': 'pH', 'Yield': 'yield_kg'})
    df1['yield_ton_per_ha'] = df1['yield_kg'] / 1000.0
    # Clip extreme statistical outliers (> 98th percentile per crop)
    p98 = df1.groupby('Crop')['yield_ton_per_ha'].transform(lambda s: s.clip(upper=s.quantile(0.98)))
    df1['yield_ton_per_ha'] = p98
    df1_std = df1[['Crop', 'Nitrogen', 'Phosphorus', 'Potassium', 'Temperature', 'Humidity', 'pH', 'Rainfall', 'yield_ton_per_ha']]

    # 2. Load crop-yield.csv
    df2_path = os.path.join(base_dir, 'data', 'crop-yield.csv')
    df2 = pd.read_csv(df2_path).rename(columns={
        'Crop_Type': 'Crop', 'N': 'Nitrogen', 'P': 'Phosphorus', 'K': 'Potassium',
        'Soil_pH': 'pH', 'Crop_Yield_ton_per_hectare': 'yield_ton_per_ha'
    })
    df2_std = df2[['Crop', 'Nitrogen', 'Phosphorus', 'Potassium', 'Temperature', 'Humidity', 'pH', 'Rainfall', 'yield_ton_per_ha']]

    # Combine datasets
    merged = pd.concat([df1_std, df2_std], ignore_index=True).dropna()
    print(f"Total authentic training records: {len(merged)}")
    
    crops = sorted(list(merged['Crop'].unique()))
    print(f"Supported crops ({len(crops)}): {crops}")

    # Encode crop
    crop_encoder = LabelEncoder()
    merged['crop_code'] = crop_encoder.fit_transform(merged['Crop'])

    feature_cols = ['crop_code', 'Nitrogen', 'Phosphorus', 'Potassium', 'Temperature', 'Humidity', 'pH', 'Rainfall']
    X = merged[feature_cols].copy()
    y = merged['yield_ton_per_ha'].copy()

    # Split train/test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

    # Scale the continuous features
    scaler = StandardScaler()
    num_cols = ['Nitrogen', 'Phosphorus', 'Potassium', 'Temperature', 'Humidity', 'pH', 'Rainfall']
    scaler.fit(X[num_cols])

    # 1. Classical XGBoost
    print("Training XGBoost Regressor...")
    xgb_model = XGBRegressor(n_estimators=130, max_depth=6, learning_rate=0.08, random_state=42, n_jobs=-1)
    xgb_model.fit(X_train, y_train)
    xgb_preds = xgb_model.predict(X_test)
    xgb_r2 = r2_score(y_test, xgb_preds)
    xgb_mae = mean_absolute_error(y_test, xgb_preds)
    print(f"  -> XGBoost R2: {xgb_r2:.4f}, MAE: {xgb_mae:.4f} t/ha")

    # 2. Classical Random Forest
    print("Training Random Forest Regressor...")
    rf_model = RandomForestRegressor(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)
    rf_preds = rf_model.predict(X_test)
    rf_r2 = r2_score(y_test, rf_preds)
    print(f"  -> Random Forest R2: {rf_r2:.4f}")

    # 3. Quantum Regressor (QML Hilbert Map)
    print("Training Simulated Quantum Regressor (VQR)...")
    vqc_model = SimulatedQuantumRegressor(n_components=8, epochs=50)
    # Fit with subset of X_train for fast quantum Hilbert feature mapping
    sample_idx = np.random.RandomState(42).choice(len(X_train), min(len(X_train), 3000), replace=False)
    vqc_model.fit(X_train.iloc[sample_idx], y_train.iloc[sample_idx])
    vqc_preds = vqc_model.predict(X_test)
    vqc_r2 = r2_score(y_test, vqc_preds)
    print(f"  -> Quantum Regressor R2: {vqc_r2:.4f}")

    # Ensemble evaluation
    ensemble_preds = 0.55 * xgb_preds + 0.35 * rf_preds + 0.10 * vqc_preds
    ens_r2 = r2_score(y_test, ensemble_preds)
    print(f"  -> [OK] Stacking Meta Ensemble R2: {ens_r2:.4f}")

    # Save artifacts
    models_dir = os.path.join(base_dir, 'models')
    safe_pickle_save(crop_encoder, os.path.join(models_dir, 'yield_crop_encoder.pkl'))
    safe_pickle_save(scaler, os.path.join(models_dir, 'yield_scaler.pkl'))
    safe_pickle_save(xgb_model, os.path.join(models_dir, 'xgb_model.pkl'))
    safe_pickle_save(rf_model, os.path.join(models_dir, 'rf_yield_model.pkl'))
    safe_pickle_save(vqc_model, os.path.join(models_dir, 'vqc_yield_model.pkl'))

    # Update training_registry.json
    try:
        reg_path = os.path.join(base_dir, REGISTRY_FILE)
        registry = []
        if os.path.exists(reg_path):
            with open(reg_path, 'r', encoding='utf-8') as f:
                registry = json.load(f)
        
        registry.append({
            "timestamp": datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "model_name": "xgb_model.pkl",
            "dataset_path": "data/Crop_Yield_Prediction.csv + data/crop-yield.csv",
            "algorithm": "XGBoost Regressor + Quantum Ensemble",
            "features": feature_cols,
            "target": "Crop_Yield_ton_per_hectare",
            "metrics": {"R2_Score": f"{ens_r2:.4f}", "MAE": f"{xgb_mae:.4f}"},
            "output_path": "models/xgb_model.pkl",
            "status": "Trained & Saved"
        })
        with open(reg_path, 'w', encoding='utf-8') as f:
            json.dump(registry, f, indent=4)
        print("[OK] training_registry.json updated successfully.")
    except Exception as e:
        print(f"Error updating registry: {e}")

if __name__ == '__main__':
    train_and_export_yield_models()
