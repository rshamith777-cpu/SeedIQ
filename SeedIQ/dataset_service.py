"""
SeedIQ Dataset Service
Automates dataset ingestion, schema-based type detection, Supabase Storage uploads,
automatic preprocessing, feature extraction, auditing, and dataset versioning.
Strictly does NOT retrain ML/QML models automatically.
"""

import os
import io
import json
import hashlib
import datetime
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, Optional

from data_preprocessing import (
    detect_dataset_type,
    preprocess_crop_data,
    preprocess_yield_data,
    preprocess_seed_data
)
from data_validator import run_data_quality_checks
from activity_logger import log_activity
from supabase_client import supabase

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

def compute_checksum(content: bytes) -> str:
    sha256 = hashlib.sha256()
    sha256.update(content)
    return sha256.hexdigest()

def validate_csv(file_bytes: bytes, filename: str) -> Tuple[bool, str, Optional[pd.DataFrame]]:
    """
    Validates CSV file size, encoding, readability, and tabular content.
    """
    if not filename.lower().endswith('.csv'):
        return False, "File must have a .csv extension.", None

    if len(file_bytes) == 0:
        return False, "Uploaded file is empty.", None

    # Max 16MB
    if len(file_bytes) > 16 * 1024 * 1024:
        return False, "File exceeds maximum size limit of 16MB.", None

    # Encoding & parsing check
    df = None
    for enc in ['utf-8', 'latin-1', 'cp1252']:
        try:
            df = pd.read_csv(io.BytesIO(file_bytes), encoding=enc)
            break
        except Exception:
            continue

    if df is None or df.empty:
        return False, "Unable to parse valid tabular CSV data.", None

    if df.shape[0] < 2 or df.shape[1] < 2:
        return False, "Dataset must contain at least 2 rows and 2 columns.", None

    return True, "Valid CSV dataset.", df

def get_next_dataset_version(dataset_name: str) -> str:
    """
    Queries dataset_versions in Supabase/SQLite to determine next sequential version string (v001, v002...).
    """
    count = 0
    # Try Supabase first
    success, rows = supabase.select_rows("dataset_versions", f"dataset_name=eq.{dataset_name}&select=id")
    if success and rows:
        count = len(rows)
    else:
        # Fallback to local SQLite
        try:
            import sqlite3
            conn = sqlite3.connect(os.path.join(os.path.dirname(__file__), 'seediq.db'))
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM dataset_versions WHERE dataset_name = ?", (dataset_name,))
            res = cur.fetchone()
            if res:
                count = res[0]
            conn.close()
        except Exception:
            pass
    return f"v{count + 1:03d}"

def process_and_store_dataset(
    file_bytes: bytes,
    filename: str,
    user_id: Optional[str] = None,
    user_role: str = "Admin",
    auth_token: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes the complete SeedIQ Dataset Pipeline:
    1. Validation
    2. Schema-based detection
    3. Supabase Storage (Original CSV)
    4. Database Metadata Record
    5. Automatic Preprocessing
    6. Feature Extraction & Selection
    7. Dataset Auditing
    8. Supabase Storage (Processed CSV)
    9. Versioning (v001, v002...)
    10. Activity Logging
    """
    # 1. Validation
    is_valid, val_msg, df = validate_csv(file_bytes, filename)
    if not is_valid:
        log_activity(
            "DATASET_PROCESSING_FAILED",
            user_id=user_id,
            details={"filename": filename, "error": val_msg},
            status="FAILED"
        )
        return {"status": "error", "message": val_msg}

    file_hash = compute_checksum(file_bytes)
    row_count, col_count = df.shape
    file_size = len(file_bytes)

    # 2. Schema-Based Type Detection
    detected_type = detect_dataset_type(df)
    type_labels = {
        'crop': "Crop Recommendation",
        'yield': "Yield Prediction",
        'seed': "Seed Viability",
        'other': "Other Agriculture Dataset",
        'unknown': "General Agriculture CSV"
    }
    dataset_label = type_labels.get(detected_type, "General Agriculture CSV")
    clean_type = detected_type if detected_type in ['crop', 'yield', 'seed'] else 'other'

    # 3. Storage Paths
    timestamp_slug = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    original_storage_path = f"datasets/{clean_type}/{timestamp_slug}_{file_hash[:8]}_{filename}"
    processed_storage_path = f"processed/{clean_type}/{timestamp_slug}_{file_hash[:8]}_processed.csv"

    # Save original locally in SeedIQ/data/
    local_original_path = os.path.join(DATA_DIR, f"{timestamp_slug}_{filename}")
    with open(local_original_path, 'wb') as f:
        f.write(file_bytes)

    # Upload original to Supabase Storage
    supabase.upload_file("seediq-datasets", original_storage_path, file_bytes, content_type="text/csv", token=auth_token)

    log_activity(
        "DATASET_UPLOADED",
        user_id=user_id,
        details={
            "filename": filename,
            "detected_type": dataset_label,
            "storage_path": original_storage_path,
            "size_bytes": file_size
        }
    )

    # Target Column Identification
    target_column = None
    cols_lower = {c.lower(): c for c in df.columns}
    if clean_type == 'crop':
        target_column = cols_lower.get('crop') or cols_lower.get('label') or 'Crop'
    elif clean_type == 'yield':
        target_column = cols_lower.get('yield_tonnes') or cols_lower.get('yield') or df.columns[-1]
    elif clean_type == 'seed':
        target_column = cols_lower.get('viable') or cols_lower.get('viability') or 'Viable'
    else:
        target_column = df.columns[-1]

    original_features = [c for c in df.columns if c != target_column]

    # 4. Automated Preprocessing & Feature Extraction
    processed_features = []
    preprocessing_meta = {}
    processed_df = df.copy()

    try:
        if clean_type == 'crop':
            X_scaled, y, scaler, crop_encoder = preprocess_crop_data(local_original_path)
            processed_features = ['Nitrogen', 'Phosphorus', 'Potassium', 'Temperature', 'Humidity', 'pH', 'Rainfall']
            preprocessing_meta = {
                "preprocessor": "StandardScaler + LabelEncoder",
                "classes_count": len(crop_encoder.classes_) if hasattr(crop_encoder, 'classes_') else 0,
                "features_scaled": len(processed_features)
            }
            processed_df = pd.DataFrame(X_scaled, columns=processed_features)
            processed_df['Target_Encoded'] = y
            
            # Also update canonical merged dataset for classical/quantum local model consumers
            canonical_path = os.path.join(DATA_DIR, "merged_ml_dataset.csv")
            try:
                df.to_csv(canonical_path, index=False)
            except Exception:
                pass

        elif clean_type == 'yield':
            X_scaled, y, scaler, crop_enc, season_enc = preprocess_yield_data(local_original_path)
            processed_features = ['Crop', 'Season', 'Area_Hectares', 'Area_Sq', 'Crop_Season']
            preprocessing_meta = {
                "preprocessor": "StandardScaler + Multi-LabelEncoder",
                "features_scaled": len(processed_features)
            }
            processed_df = pd.DataFrame(X_scaled, columns=processed_features)
            processed_df['Yield_Tonnes'] = list(y)
            
            canonical_path = os.path.join(DATA_DIR, "crop_production_karnataka.csv")
            try:
                df.to_csv(canonical_path, index=False)
            except Exception:
                pass

        elif clean_type == 'seed':
            X_scaled, y, scaler = preprocess_seed_data(local_original_path)
            processed_features = ['Moisture_Level', 'Weight_g']
            preprocessing_meta = {
                "preprocessor": "StandardScaler",
                "features_scaled": len(processed_features)
            }
            processed_df = pd.DataFrame(X_scaled, columns=processed_features)
            processed_df['Viable'] = list(y)
            
            canonical_path = os.path.join(DATA_DIR, "seed_viability_data.csv")
            try:
                df.to_csv(canonical_path, index=False)
            except Exception:
                pass
        else:
            # Generic normalization for numeric features
            num_cols = df.select_dtypes(include=np.number).columns.tolist()
            processed_features = num_cols
            preprocessing_meta = {"preprocessor": "Standard numerical extraction"}

    except Exception as e:
        print(f"[DATASET_PIPELINE] Preprocessing note: {e}")
        preprocessing_meta = {"note": f"Fallback preprocessing: {e}"}

    # Save Processed CSV locally and upload to Supabase Storage
    local_processed_path = os.path.join(DATA_DIR, f"{timestamp_slug}_{file_hash[:8]}_processed.csv")
    processed_df.to_csv(local_processed_path, index=False)
    with open(local_processed_path, 'rb') as pf:
        processed_bytes = pf.read()
    supabase.upload_file("seediq-datasets", processed_storage_path, processed_bytes, content_type="text/csv", token=auth_token)

    # 5. Data Quality & Audit Checks
    quality_report = run_data_quality_checks(local_original_path, target_column)
    missing_count = int(df.isnull().sum().sum())
    duplicate_count = int(df.duplicated().sum())

    # 6. Versioning
    version_str = get_next_dataset_version(dataset_label)

    # 7. Record in Supabase & SQLite
    # Master dataset entry
    dataset_entry = {
        "name": dataset_label,
        "original_filename": filename,
        "stored_path": original_storage_path,
        "dataset_type": clean_type,
        "file_size": file_size,
        "row_count": row_count,
        "column_count": col_count,
        "features_list": original_features,
        "target_column": target_column,
        "status": "ready",
        "checksum": file_hash,
        "uploaded_by": user_id if (isinstance(user_id, str) and len(user_id) == 36 and '-' in user_id) else None
    }
    
    # Version entry
    version_entry = {
        "dataset_name": dataset_label,
        "version": version_str,
        "file_hash": file_hash,
        "stored_path": original_storage_path,
        "processed_path": processed_storage_path,
        "row_count": row_count,
        "column_count": col_count,
        "features_json": processed_features or original_features,
        "target_column": target_column,
        "missing_values": missing_count,
        "duplicate_rows": duplicate_count,
        "preprocessing_metadata": preprocessing_meta,
        "feature_metadata": {
            "original_features": original_features,
            "processed_features": processed_features,
            "target_column": target_column
        },
        "created_by": user_id if (isinstance(user_id, str) and len(user_id) == 36 and '-' in user_id) else None
    }

    # Audit entry
    audit_entry = {
        "dataset_name": dataset_label,
        "file_hash": file_hash,
        "shape": f"{row_count}x{col_count}",
        "target_column": target_column,
        "missing_values": missing_count,
        "duplicate_rows": duplicate_count,
        "audit_json": {
            "quality": quality_report,
            "version": version_str,
            "preprocessing": preprocessing_meta
        }
    }

    # Write to Supabase tables
    supabase.insert_row("datasets", dataset_entry, token=auth_token)
    supabase.insert_row("dataset_versions", version_entry, token=auth_token)
    supabase.insert_row("dataset_audits", audit_entry, token=auth_token)

    # Also dual-write to local SQLite so legacy viewers remain up to date
    try:
        import sqlite3
        conn = sqlite3.connect(os.path.join(os.path.dirname(__file__), 'seediq.db'))
        conn.execute('''
            CREATE TABLE IF NOT EXISTS dataset_versions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dataset_name TEXT NOT NULL,
                version TEXT NOT NULL,
                file_hash TEXT NOT NULL,
                row_count INTEGER,
                column_count INTEGER,
                features_json TEXT,
                target_column TEXT,
                missing_values INTEGER,
                duplicate_rows INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.execute('''
            INSERT INTO dataset_versions (dataset_name, version, file_hash, row_count, column_count, features_json, target_column, missing_values, duplicate_rows)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            dataset_label, version_str, file_hash, row_count, col_count,
            json.dumps(processed_features or original_features), target_column, missing_count, duplicate_count
        ))
        
        conn.execute('''
            CREATE TABLE IF NOT EXISTS dataset_audits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dataset_name TEXT,
                file_hash TEXT,
                shape TEXT,
                target_column TEXT,
                missing_values INTEGER,
                duplicate_rows INTEGER,
                audit_json TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.execute('''
            INSERT INTO dataset_audits (dataset_name, file_hash, shape, target_column, missing_values, duplicate_rows, audit_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            dataset_label, file_hash, f"{row_count}x{col_count}", target_column, missing_count, duplicate_count,
            json.dumps(audit_entry["audit_json"])
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[DATASET_PIPELINE] SQLite sync error: {e}")

    # Log completion events
    log_activity(
        "DATASET_PREPROCESSED",
        user_id=user_id,
        details={
            "version": version_str,
            "dataset": dataset_label,
            "processed_path": processed_storage_path,
            "features_extracted": len(processed_features)
        }
    )

    return {
        "status": "success",
        "message": f"Dataset ingested, preprocessed, and versioned as {version_str}.",
        "dataset_name": dataset_label,
        "version": version_str,
        "rows": row_count,
        "columns": col_count,
        "detected_type": dataset_label,
        "original_storage_path": original_storage_path,
        "processed_storage_path": processed_storage_path,
        "target_column": target_column,
        "features": processed_features or original_features,
        "preprocessing_status": "COMPLETED",
        "quality_status": "PASSED" if quality_report.get("passed") else "REVIEW_NEEDED"
    }
