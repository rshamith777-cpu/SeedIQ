"""
SeedIQ Storage Intelligence & Post-Harvest Preservation Engine
Provides scientifically verified post-harvest temperature, relative humidity,
safe seed moisture, preservation methods, pathogen risks, and facility architectures.
"""

import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KB_PATH = os.path.join(BASE_DIR, 'knowledge_base', 'storage_db.json')

def load_storage_db():
    if os.path.exists(KB_PATH):
        try:
            with open(KB_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {}

STORAGE_DB = load_storage_db()

def recommend_storage(crop_name=None, temp=None, humidity=None):
    """
    Get comprehensive agronomic storage recommendation for any crop or climate parameters.
    """
    if not crop_name and temp is not None and humidity is not None:
        if temp < 20 and humidity < 50:
            return "Ideal Storage Condition"
        else:
            return "Adjust Temperature/Humidity"
            
    if not crop_name:
        return "Please specify a crop name or temperature/humidity."

    # Look up crop
    clean_name = crop_name.strip().title()
    crop_info = STORAGE_DB.get(clean_name)
    
    if not crop_info:
        for k, v in STORAGE_DB.items():
            if clean_name.lower() in k.lower() or k.lower() in clean_name.lower():
                crop_info = v
                clean_name = k
                break

    if not crop_info:
        return {
            "crop": crop_name,
            "status": "Generic Grain/Produce",
            "recommended_temp": "12–15°C",
            "recommended_humidity": "55–65%",
            "recommended_facility": "Ventilated Dry Warehouse",
            "preservation": "Ensure clean, dry storage away from moisture.",
            "shelf_life": "6–12 months",
            "fungal_risks": "Storage molds (Aspergillus, Penicillium)",
            "insect_pests": "Grain weevils and flour beetles",
            "risk_score": 30
        }

    return {
        "crop": clean_name,
        "recommended_temp": crop_info.get("temp"),
        "recommended_humidity": crop_info.get("hum"),
        "recommended_facility": crop_info.get("type"),
        "preservation": crop_info.get("pres"),
        "shelf_life": crop_info.get("shelf_life"),
        "fungal_risks": crop_info.get("fungus"),
        "insect_pests": crop_info.get("insects"),
        "risk_score": crop_info.get("risk_score", 20)
    }
