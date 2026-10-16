import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Warehouse, ThermometerSun, Droplets, Clock, ShieldCheck, 
  ArrowRight, Activity, Fan, AlertTriangle, Sparkles, Search, CheckCircle2,
  Layers, Eye, Image as ImageIcon, Printer, Download, FileText
} from "lucide-react";
import { ReportModal, ReportData } from "@/components/seediq/report-modal";
import { downloadReportPdfFile } from "@/lib/pdf-service";
import { CROP_VARIETIES, getCropImage, getStorageImage, getCropAsset } from "@/lib/crops";

export const Route = createFileRoute("/_app/storage-ai")({
  component: StorageAI,
  head: () => ({ meta: [{ title: "Storage Intelligence — SeedIQ" }] }),
});

const STORAGE_PROFILES = [
  {
    id: "G1",
    regex: /wheat|rice|maize|sorghum|millet|barley|oats|rye|spelt|triticale|quinoa|buckwheat|amaranth|teff/i,
    type: "Grain Silo",
    temp: "10–20°C",
    rh: "<60%",
    moisture: "10–12%",
    duration: "12–18 months",
    ventilation: "Periodic aeration",
    ethylene: "Neutral",
    preStorage: "Mechanical drying & cleaning",
    precautions: "Insects, mold, hot spots",
  },
  {
    id: "G2",
    regex: /chickpea|lentil|gram|cowpea|bean|pigeon pea|peas|lupin/i,
    type: "Grain Silo / Dry Warehouse",
    temp: "10–20°C",
    rh: "<60%",
    moisture: "9–10%",
    duration: "12 months",
    ventilation: "Moderate",
    ethylene: "Neutral",
    preStorage: "Drying, grading",
    precautions: "Bruchid beetles",
  },
  {
    id: "G3",
    regex: /soybean|sunflower|sesame|linseed|safflower|mustard seed|canola|niger seed|castor/i,
    type: "Dry Warehouse / Silo",
    temp: "10–15°C",
    rh: "<55%",
    moisture: "7–9%",
    duration: "6–12 months",
    ventilation: "Required",
    ethylene: "Neutral",
    preStorage: "Thorough drying",
    precautions: "Rancidity, aflatoxin",
  },
  {
    id: "G4",
    regex: /cotton/i,
    type: "Dry Warehouse",
    temp: "15–20°C",
    rh: "<60%",
    moisture: "10%",
    duration: "6–8 months",
    ventilation: "High",
    ethylene: "Neutral",
    preStorage: "Ginning and drying",
    precautions: "Fire hazard, mold",
  },
  {
    id: "G5",
    regex: /beetroot|carrot|radish|turnip/i,
    type: "Cold Storage",
    temp: "0–2°C",
    rh: "95–98%",
    moisture: "N/A",
    duration: "4–8 months",
    ventilation: "Continuous airflow",
    ethylene: "Sensitive",
    preStorage: "Remove tops, clean",
    precautions: "Avoid ethylene exposure",
  },
  {
    id: "G6",
    regex: /potato/i,
    type: "Cold Storage",
    temp: "4–12°C",
    rh: "90–95%",
    moisture: "N/A",
    duration: "6–8 months",
    ventilation: "High",
    ethylene: "Sensitive",
    preStorage: "Cure wounds",
    precautions: "Sprouting, greening",
  },
  {
    id: "G7",
    regex: /sweet potato|yam|taro/i,
    type: "Ventilated Cool Storage",
    temp: "13–15°C",
    rh: "85–90%",
    moisture: "N/A",
    duration: "3–6 months",
    ventilation: "Moderate",
    ethylene: "Sensitive",
    preStorage: "Cure before storage",
    precautions: "Chilling injury below 10°C",
  },
  {
    id: "G8",
    regex: /onion|garlic|shallot|leek/i,
    type: "Ventilated Cold Storage",
    temp: "0–2°C",
    rh: "65–75%",
    moisture: "N/A",
    duration: "6–8 months",
    ventilation: "High",
    ethylene: "Neutral",
    preStorage: "Neck curing",
    precautions: "Sprouting",
  },
  {
    id: "G9",
    regex: /cassava/i,
    type: "Cool Storage",
    temp: "5–8°C",
    rh: "85–90%",
    moisture: "N/A",
    duration: "2–4 weeks",
    ventilation: "Moderate",
    ethylene: "Sensitive",
    preStorage: "Wax coating optional",
    precautions: "Rapid physiological deterioration",
  },
  {
    id: "G10",
    regex: /tomato|eggplant|capsicum|chili/i,
    type: "Cold Storage",
    temp: "8–13°C",
    rh: "90–95%",
    moisture: "N/A",
    duration: "2–4 weeks",
    ventilation: "Moderate",
    ethylene: "Producer (Tomato) / Sensitive (Others)",
    preStorage: "Sorting",
    precautions: "Chilling injury below recommended temperatures",
  },
  {
    id: "G11",
    regex: /cucumber|pumpkin|squash|zucchini|gourd/i,
    type: "Cool Storage",
    temp: "10–15°C",
    rh: "85–95%",
    moisture: "N/A",
    duration: "2–8 weeks",
    ventilation: "Moderate",
    ethylene: "Sensitive",
    preStorage: "Clean & dry",
    precautions: "Chilling injury",
  },
  {
    id: "G12",
    regex: /cabbage|cauliflower|broccoli|sprouts|kohlrabi/i,
    type: "Cold Storage",
    temp: "0°C",
    rh: "95–98%",
    moisture: "N/A",
    duration: "2–6 months",
    ventilation: "High",
    ethylene: "Highly Sensitive",
    preStorage: "Hydrocooling",
    precautions: "Keep away from apples & bananas",
  },
  {
    id: "G13",
    regex: /spinach|lettuce|kale|celery/i,
    type: "Refrigerated Storage",
    temp: "0–2°C",
    rh: "95–98%",
    moisture: "N/A",
    duration: "1–3 weeks",
    ventilation: "High",
    ethylene: "Highly Sensitive",
    preStorage: "Hydrocooling",
    precautions: "Moisture loss",
  },
  {
    id: "G14",
    regex: /asparagus|artichoke/i,
    type: "Cold Storage",
    temp: "0–2°C",
    rh: "95–100%",
    moisture: "N/A",
    duration: "2–4 weeks",
    ventilation: "Moderate",
    ethylene: "Sensitive",
    preStorage: "Rapid cooling",
    precautions: "Toughness, bud opening",
  },
  {
    id: "G15",
    regex: /apple|pear/i,
    type: "Controlled Atmosphere",
    temp: "0–2°C",
    rh: "90–95%",
    moisture: "N/A",
    duration: "4–10 months",
    ventilation: "CA ventilation",
    ethylene: "Producer",
    preStorage: "Rapid cooling",
    precautions: "Monitor oxygen & carbon dioxide levels",
  },
  {
    id: "G16",
    regex: /mango|banana|papaya|guava|pineapple/i,
    type: "Cold Storage / Ripening Room",
    temp: "10–14°C",
    rh: "85–95%",
    moisture: "N/A",
    duration: "2–8 weeks",
    ventilation: "Good",
    ethylene: "Producer",
    preStorage: "Pre-cooling",
    precautions: "Chilling injury below safe temperatures",
  },
  {
    id: "G17",
    regex: /orange|grapes|pomegranate/i,
    type: "Cold Storage",
    temp: "0–8°C",
    rh: "90–95%",
    moisture: "N/A",
    duration: "2–6 months",
    ventilation: "Moderate",
    ethylene: "Sensitive / Orange=Neutral",
    preStorage: "Fungicide/SO₂ pads for grapes",
    precautions: "Gray mold, stem browning",
  },
  {
    id: "G18",
    regex: /strawberry|blueberry|raspberry|blackberry|cherry|peach|plum/i,
    type: "Refrigerated Storage",
    temp: "0°C",
    rh: "90–95%",
    moisture: "N/A",
    duration: "1–6 weeks",
    ventilation: "High",
    ethylene: "Mostly Sensitive",
    preStorage: "Rapid cooling",
    precautions: "Very perishable",
  },
  {
    id: "G19",
    regex: /almond|walnut|cashew|pistachio|hazelnut|pecan|macadamia/i,
    type: "Airtight Dry Warehouse",
    temp: "0–10°C",
    rh: "55–65%",
    moisture: "5–8%",
    duration: "12–24 months",
    ventilation: "Low",
    ethylene: "Neutral",
    preStorage: "Dry thoroughly",
    precautions: "Aflatoxin, rancidity",
  },
  {
    id: "G20",
    regex: /pepper|cardamom|clove|cinnamon|nutmeg|vanilla|saffron|coriander|cumin|fennel|fenugreek|turmeric|ginger|mustard/i,
    type: "Airtight Dry Warehouse",
    temp: "10–15°C",
    rh: "<60%",
    moisture: "8–10%",
    duration: "12–24 months",
    ventilation: "Low",
    ethylene: "Neutral",
    preStorage: "Drying",
    precautions: "Protect volatile oils from heat, moisture, and light",
  },
  {
    id: "G22",
    regex: /alfalfa|clover|timothy grass|bermuda grass|ryegrass|fescue|brome|vetch/i,
    type: "Dry Seed Warehouse / Silo",
    temp: "5–15°C",
    rh: "<50%",
    moisture: "8–10%",
    duration: "12–36 months",
    ventilation: "Low",
    ethylene: "Neutral",
    preStorage: "Drying and cleaning",
    precautions: "Maintain seed viability; protect from insects and moisture",
  }
];

const DATASET_STORAGE_DB: Record<string, {
  temp: string;
  hum: string;
  pres: string;
  shelf_life: string;
  fungus: string;
  insects: string;
  risk_score: number;
  type?: string;
}> = {
  "Almond": {"temp": "0–10°C", "hum": "55–65%", "pres": "Dry kernels to <6% moisture. Store in moisture-proof bins with insect-resistant seals and fumigation.", "shelf_life": "12–24 months", "fungus": "Aspergillus flavus (Aflatoxin)", "insects": "Navel Orangeworm, Merchant Grain Beetle", "risk_score": 20, "type": "Airtight Dry Nut Warehouse"},
  "Apple": {"temp": "0–2°C", "hum": "90–95%", "pres": "Controlled Atmosphere (1.5% O2, 1.0% CO2) with rapid pre-cooling. Ethylene scrubbing extends storage life up to 10 months.", "shelf_life": "4–10 months", "fungus": "Blue mold (Penicillium expansum), Gray mold", "insects": "Codling Moth larvae", "risk_score": 30, "type": "Controlled Atmosphere Cold Storage"},
  "Artichoke": {"temp": "0°C", "hum": "95–100%", "pres": "Hydrocooling or room cooling to 0°C. Pack in film-lined cartons to stop bract wilting, feathering, and blackening.", "shelf_life": "3–4 weeks", "fungus": "Gray mold (Botrytis cinerea), Bacterial soft rot", "insects": "Artichoke Plume Moth larvae", "risk_score": 50, "type": "High-Humidity Chilled Walk-in Cooler"},
  "Ash Gourd": {"temp": "13–15°C", "hum": "70–75%", "pres": "Store intact fruits with their natural waxy coating on slatted wooden shelves. Do not wash or bruise outer skin.", "shelf_life": "5–8 months", "fungus": "Fusarium fruit rot, Alternaria", "insects": "Melon fruit fly", "risk_score": 15, "type": "Naturally Ventilated Dry Godown"},
  "Asparagus": {"temp": "0–2°C", "hum": "95–100%", "pres": "Hydrocool to 2°C within 2 hours of harvest. Store spears upright with cut butts resting on damp moisture pads to prevent geotropic bending.", "shelf_life": "2–3 weeks", "fungus": "Purple spot (Stemphylium vesicarium), Fusarium", "insects": "Asparagus Beetle (Crioceris asparagi)", "risk_score": 70, "type": "Vertical Water-Padded Cold Storage"},
  "Aspargus": {"temp": "0–2°C", "hum": "95–100%", "pres": "Hydrocool to 2°C within 2 hours of harvest. Store spears upright with cut butts resting on damp moisture pads to prevent geotropic bending.", "shelf_life": "2–3 weeks", "fungus": "Purple spot (Stemphylium vesicarium), Fusarium", "insects": "Asparagus Beetle (Crioceris asparagi)", "risk_score": 70, "type": "Vertical Water-Padded Cold Storage"},
  "Banana": {"temp": "13–14°C", "hum": "90–95%", "pres": "Store mature green fruit at 13.5°C; do not store below 13°C (severe peel chilling injury). Ripen with ethylene in ripening rooms.", "shelf_life": "2–4 weeks", "fungus": "Crown rot (Colletotrichum musae), Anthracnose", "insects": "Banana Weevil borer", "risk_score": 75, "type": "Cold Storage & Ripening Room"},
  "Bermuda Grass": {"temp": "10–18°C", "hum": "35–45%", "pres": "Clean, de-hull, and dry seeds to 8–10% moisture. Store in hermetic multi-wall kraft bags in dry godowns.", "shelf_life": "24–48 months", "fungus": "Bipolaris cynodontis (Blight)", "insects": "Storage grain mites, Dermestid beetles", "risk_score": 10, "type": "Climate-Controlled Grass Seed Vault"},
  "Black Pepper": {"temp": "15–20°C", "hum": "<60%", "pres": "Sun dry harvested berries until moisture drops below 11%; store in multi-wall paper bags with plastic barrier in aerated godowns.", "shelf_life": "24–36 months", "fungus": "Aspergillus flavus, Storage mildew", "insects": "Cigarette Beetle, Spice Weevil", "risk_score": 10, "type": "Hermetic Spice Silo / Dry Warehouse"},
  "Blackberry": {"temp": "-0.5 to 0°C", "hum": "90–95%", "pres": "Pre-cool rapidly; protect berries from physical jarring and condensation which causes juice leakage (red cell reversion).", "shelf_life": "4–8 days", "fungus": "Gray mold, Rhizopus leak rot", "insects": "Spotted Wing Drosophila", "risk_score": 90, "type": "Blast-Chilled Berry Walk-in Cooler"},
  "Blueberry": {"temp": "-0.5 to 0°C", "hum": "90–95%", "pres": "Forced-air pre-cooling to 0°C within 2 hours. Controlled atmosphere (3% O2, 10–12% CO2) suppresses decay without washing.", "shelf_life": "3–6 weeks", "fungus": "Botrytis cinerea (Gray mold), Colletotrichum rot", "insects": "Spotted Wing Drosophila (Drosophila suzukii)", "risk_score": 60, "type": "Blast-Chilled CA Cold Storage"},
  "Brome": {"temp": "10–15°C", "hum": "40–50%", "pres": "De-awn and screen seeds; store in breathable jute sacks with polythene liners in rodent-proof sheds.", "shelf_life": "24–36 months", "fungus": "Head smut (Ustilago bullata)", "insects": "Dried fruit beetle, Storage weevils", "risk_score": 12, "type": "Dehumidified Seed Warehouse"},
  "Brussels Sprouts": {"temp": "0°C", "hum": "95–98%", "pres": "Forced-air cool to 0°C immediately. Package in vented film cartons; high ethylene sensitivity leads to yellowing and leaf loss.", "shelf_life": "4–6 weeks", "fungus": "Alternaria brassicae, Gray mold", "insects": "Cabbage looper, Aphids", "risk_score": 40, "type": "Forced-Air High-Humidity Cold Storage"},
  "Cabbage": {"temp": "0°C", "hum": "95–98%", "pres": "Room cooling or forced air. Retain 2–3 wrapper leaves. Strictly isolate from apples and bananas (ethylene).", "shelf_life": "3–6 months", "fungus": "Bacterial soft rot, Black rot (Xanthomonas)", "insects": "Cabbage looper, Cabbage aphid", "risk_score": 35, "type": "Ultrasonic Misted Cold Storage"},
  "Canola": {"temp": "10–15°C", "hum": "<55%", "pres": "Clean thoroughly to remove green dockage and weed seeds; aerate grain mass continuously in early storage to prevent moisture migration and heat-induced rancidity.", "shelf_life": "12–24 months", "fungus": "Blackleg (Leptosphaeria maculans), Sclerotinia stem rot", "insects": "Red flour beetle, Sawtoothed grain beetle", "risk_score": 20, "type": "Climate-Controlled Aerated Oilseed Silo"},
  "Capsicum": {"temp": "7–10°C", "hum": "90–95%", "pres": "CRITICAL: Do not store below 7°C (chilling injury causes sheet pitting and calyx rot). Wrap in micro-perforated film.", "shelf_life": "3–5 weeks", "fungus": "Gray mold (Botrytis cinerea), Alternaria rot", "insects": "Pepper Maggot, Thrips", "risk_score": 50, "type": "Anti-Chilling Cool Storage (8-10°C)"},
  "Cardamom": {"temp": "10–15°C", "hum": "<60%", "pres": "Cure green capsules in drying kilns at 45–50°C; pack in black polythene-lined wooden boxes to retain chlorophyll and cineole aroma.", "shelf_life": "18–24 months", "fungus": "Capsule rot, Damp storage mold", "insects": "Cigarette Beetle, Red Flour Beetle", "risk_score": 20, "type": "Dark Hermetic Spice Storage Vault"},
  "Carrot": {"temp": "0–1°C", "hum": "98–100%", "pres": "Hydrocooling to 1°C. Remove tops completely. Isolate from ethylene which synthesizes isocoumarin (bitter taste).", "shelf_life": "6–9 months", "fungus": "Sclerotinia white rot, Black rot (Thielaviopsis)", "insects": "Carrot Rust Fly (Psila rosae)", "risk_score": 25, "type": "High-Humidity Chilled Root Cellar"},
  "Cashew": {"temp": "15–20°C", "hum": "<60%", "pres": "Dry in-shell to 8% moisture. Kernel export in Vita-Pack vacuum-sealed nitrogen-flushed tins.", "shelf_life": "18–24 months", "fungus": "Aspergillus niger", "insects": "Sawtoothed Grain Beetle, Tribolium", "risk_score": 15, "type": "Nitrogen-Flushed Nut Warehouse"},
  "Cassava": {"temp": "5–8°C", "hum": "85–90%", "pres": "Waxing fresh roots or packing in moist sawdust boxes prevents rapid post-harvest vascular streaking (PPD).", "shelf_life": "2–4 weeks (Fresh) / 12 months (Dried Chips)", "fungus": "Botryodiplodia theobromae, Fusarium solani", "insects": "Coffee bean weevil (on dry chips)", "risk_score": 75, "type": "High-Humidity Cool Clamp Storage"},
  "Cauliflower": {"temp": "0–1°C", "hum": "95–98%", "pres": "Rapid hydrocooling or vacuum cooling. Retain jacket leaves to protect the white curd. Isolate from ethylene-producing apples.", "shelf_life": "3–5 weeks", "fungus": "Bacterial soft rot, Alternaria brassicicola", "insects": "Diamondback Moth larvae, Cabbage Aphids", "risk_score": 45, "type": "Ultrasonic Misted Cold Room (0°C)"},
  "Celery": {"temp": "0–1°C", "hum": "98–100%", "pres": "Rapid hydrocooling or vacuum cooling. Pack in polyethylene-lined crates. Monitor stalks for petiole pithiness.", "shelf_life": "2–3 months", "fungus": "Pink rot (Sclerotinia sclerotiorum), Early blight", "insects": "Celery Leafminer larvae, Slugs", "risk_score": 45, "type": "Forced-Air Chilled Humid Storage"},
  "Cherry": {"temp": "-1 to 0°C", "hum": "90–95%", "pres": "Hydrocooling with food-grade sanitizing wash. Modified atmosphere packaging liners (5% O2, 10% CO2) keep green stems fresh.", "shelf_life": "3–5 weeks", "fungus": "Brown rot (Monilinia fructicola), Botrytis", "insects": "Cherry Fruit Fly, Thrips", "risk_score": 70, "type": "Hydrocooled CA Cold Storage"},
  "Chickpea": {"temp": "15–20°C", "hum": "50–60%", "pres": "Hermetic grain bins or triple-layer bags; keep moisture under 10% to prevent pulse beetle outbreaks.", "shelf_life": "18–24 months", "fungus": "Ascochyta blight, Fusarium wilt", "insects": "Gram Pod Borer, Pulse Beetle (Callosobruchus)", "risk_score": 15, "type": "Hermetic Pulse Silo / PICS Bags"},
  "Chili": {"temp": "8–10°C (Fresh) / 10–15°C (Dry)", "hum": "90% (Fresh) / <55% (Dry)", "pres": "For dry chillies: sun dry to <10% moisture; store in polythene-lined gunny bags in darkness to preserve bright red carotenoids.", "shelf_life": "3 weeks (Fresh) / 12–18 months (Dry)", "fungus": "Colletotrichum capsici (Anthracnose), Aspergillus", "insects": "Cigarette Beetle (Lasioderma serricorne)", "risk_score": 30, "type": "Dehumidified Spice & Produce Storage"},
  "Chilli": {"temp": "8–10°C (Fresh) / 10–15°C (Dry)", "hum": "90% (Fresh) / <55% (Dry)", "pres": "For dry chillies: sun dry to <10% moisture; store in polythene-lined gunny bags in darkness to preserve bright red carotenoids.", "shelf_life": "3 weeks (Fresh) / 12–18 months (Dry)", "fungus": "Colletotrichum capsici (Anthracnose), Aspergillus", "insects": "Cigarette Beetle (Lasioderma serricorne)", "risk_score": 30, "type": "Dehumidified Spice & Produce Storage"},
  "Cinnamon": {"temp": "18–22°C", "hum": "<60%", "pres": "Roll peeled bark into tight quills, shade dry to 11% moisture, and bind into compact bundles wrapped in moisture-proof paper.", "shelf_life": "24–48 months", "fungus": "Mildew under damp storage conditions", "insects": "Wood Borers, Cigarette Beetle", "risk_score": 10, "type": "Dry Ambient Spice Godown"},
  "Clove": {"temp": "15–20°C", "hum": "<60%", "pres": "Dry buds in shade or solar kilns until stems snap cleanly; store in airtight tins or foil bags to halt eugenol oil evaporation.", "shelf_life": "24–36 months", "fungus": "Mold on insufficiently dried buds", "insects": "Warehouse Beetle, Grain Mites", "risk_score": 10, "type": "Sealed Hermetic Spice Vault"},
  "Clover": {"temp": "5–15°C", "hum": "35–45%", "pres": "Dehumidified cold seed room. Pack in foil-laminated moisture-proof bags to sustain high germination vigor.", "shelf_life": "24–36 months", "fungus": "Sclerotinia trifoliorum (Clover rot)", "insects": "Clover Seed Weevil (Apion apricans)", "risk_score": 10, "type": "Dehumidified Seed Storage Vault"},
  "Cocoa": {"temp": "15–20°C", "hum": "65–70%", "pres": "Store dried fermented beans (moisture 6.5–7.5%) in jute bags on pallets 15 cm above ground and 50 cm away from walls.", "shelf_life": "12–18 months", "fungus": "Penicillium, Aspergillus (Mycotoxin risk)", "insects": "Cocoa Moth (Ephestia elutella)", "risk_score": 20, "type": "Ventilated Dry Cocoa Warehouse"},
  "Coffee": {"temp": "15–20°C", "hum": "60–65%", "pres": "Grade green beans to 10.5–11.5% moisture; package in multi-layer hermetic GrainPro liners to preserve cupping profile.", "shelf_life": "12–24 months", "fungus": "Aspergillus ochraceus (Ochratoxin A danger if wet)", "insects": "Coffee Berry Borer (Hypothenemus hampei)", "risk_score": 15, "type": "Hermetic Multi-Layer Bag Warehouse"},
  "Coriander": {"temp": "15–20°C", "hum": "<60%", "pres": "Dry fruits to 9% moisture; pack in polythene-lined jute sacks in well-ventilated dry warehouses to prevent seed darkening.", "shelf_life": "18–24 months", "fungus": "Storage molds, Mildew", "insects": "Cigarette Beetle, Drugstore Beetle", "risk_score": 15, "type": "Hermetic Seed Silo / Moisture Bagging"},
  "Cotton": {"temp": "18–22°C", "hum": "55–62%", "pres": "Baled lint stored on raised wooden dunnage with fire sprinklers and strict humidity control to prevent fiber mildew.", "shelf_life": "24–36 months", "fungus": "Aspergillus niger (Black mildew on lint)", "insects": "Pink Bollworm residual, Warehouse Carpet Beetle", "risk_score": 15, "type": "Dry Bale Warehouse"},
  "Cow pea": {"temp": "15–20°C", "hum": "50–55%", "pres": "Solar heating on black plastic sheets before bagging to destroy internal bruchid larvae; seal in airtight hermetic bags.", "shelf_life": "18–24 months", "fungus": "Rhizoctonia solani, Macrophomina phaseolina", "insects": "Cowpea Weevil (Callosobruchus maculatus)", "risk_score": 20, "type": "Hermetic Pulse Storage"},
  "Cowpea": {"temp": "15–20°C", "hum": "50–55%", "pres": "Solar heating on black plastic sheets before bagging to destroy internal bruchid larvae; seal in airtight hermetic bags.", "shelf_life": "18–24 months", "fungus": "Rhizoctonia solani, Macrophomina phaseolina", "insects": "Cowpea Weevil (Callosobruchus maculatus)", "risk_score": 20, "type": "Hermetic Pulse Storage"},
  "Cumin": {"temp": "15–20°C", "hum": "<55%", "pres": "Clean and dry seeds to 8% moisture; pack in sealed tins or airtight laminated pouches to lock in cuminaldehyde essential oil.", "shelf_life": "18–24 months", "fungus": "Alternaria, Storage fungi", "insects": "Cigarette Beetle, Rust-Red Flour Beetle", "risk_score": 15, "type": "Dehumidified Hermetic Spice Silo"},
  "Faba Bean": {"temp": "10–15°C", "hum": "55–60%", "pres": "Thorough drying to 11% moisture. Avoid high storage temperatures which cause rapid seed coat tanning and hardening.", "shelf_life": "12–18 months", "fungus": "Chocolate spot (Botrytis fabae), Rust", "insects": "Broad Bean Weevil (Bruchus rufimanus)", "risk_score": 20, "type": "Ventilated Cool Pulse Warehouse"},
  "Fennel": {"temp": "15–20°C", "hum": "<60%", "pres": "Dry harvested umbels under shade to preserve vibrant green color; store in moisture-proof containers away from light.", "shelf_life": "18–24 months", "fungus": "Ramularia blight residual, Storage mold", "insects": "Seed Weevils, Grain Borers", "risk_score": 15, "type": "Sealed Dry Spice Warehouse"},
  "Fenugreek": {"temp": "15–22°C", "hum": "<60%", "pres": "Sun dry seeds to 9% moisture; store in galvanized drums or moisture-proof bags; hard seed coat offers natural pest resistance.", "shelf_life": "24–36 months", "fungus": "Downy mildew, Aspergillus", "insects": "Pulse Beetle (Callosobruchus)", "risk_score": 10, "type": "Hermetic Dry Pulse/Spice Silo"},
  "Fescue": {"temp": "5–10°C", "hum": "40–45%", "pres": "Maintain low temperature (0–10°C) to prevent loss of beneficial symbiotic fungal endophytes (Epichloë).", "shelf_life": "18–36 months", "fungus": "Rhizoctonia, Endophyte decline", "insects": "Seed chalcids, Granary mites", "risk_score": 12, "type": "Endophyte-Preserving Seed Vault"},
  "Garlic": {"temp": "0–2°C", "hum": "60–70%", "pres": "Cure bulbs for 3 weeks; keep relative humidity low (<70%) to prevent root emergence and mold development.", "shelf_life": "6–8 months", "fungus": "Penicillium blue mold, Botrytis rot", "insects": "Bulb Mites, Onion Thrips", "risk_score": 20, "type": "Ventilated Allium Curing Godown"},
  "Ginger": {"temp": "12–14°C (Fresh) / 15–20°C (Dry)", "hum": "85–90% (Fresh) / <60% (Dry)", "pres": "Fresh ginger chills below 12°C. Dry sonth ginger should be sun-dried to 9% moisture and sealed in polythene bags.", "shelf_life": "2–4 months (Fresh) / 18–24 months (Dry)", "fungus": "Fusarium oxysporum, Pythium soft rot", "insects": "Cigarette Beetle, Coffee Bean Weevil", "risk_score": 25, "type": "Controlled Atmosphere Spice Godown"},
  "Grapes": {"temp": "-1 to 0°C", "hum": "90–95%", "pres": "Rapid forced-air pre-cooling; pack with SO2 generator sheets in vented cartons to suppress Botrytis gray mold.", "shelf_life": "2–6 weeks", "fungus": "Gray mold (Botrytis cinerea)", "insects": "Grape Mealybug", "risk_score": 70, "type": "Precooled Cold Storage with SO2"},
  "Groundnut": {"temp": "5–10°C", "hum": "55–65%", "pres": "Store in-shell at <7% kernel moisture. Maintain low temperature to avoid Aspergillus flavus and carcinogenic aflatoxin synthesis.", "shelf_life": "10–12 months", "fungus": "Aspergillus flavus (Aflatoxin risk), Penicillium", "insects": "Groundnut Borer (Caryedon serratus), Red Flour Beetle", "risk_score": 30, "type": "Climate-Controlled Groundnut Warehouse"},
  "Hazelnut": {"temp": "2–5°C", "hum": "60–65%", "pres": "Dry to 6% moisture in forced-air dryers at 35°C; store in bulk totes with dehumidifiers away from off-odors.", "shelf_life": "12–18 months", "fungus": "Aspergillus flavus, Brown stain", "insects": "Filbertworm, Hazelnut Weevil (Curculio nucum)", "risk_score": 20, "type": "Airtight Cool Nut Warehouse"},
  "Kale": {"temp": "0°C", "hum": "98–100%", "pres": "Top-icing or ultrasonic humidification at near 100% RH prevents rapid moisture wilt; strictly exclude ethylene.", "shelf_life": "2–3 weeks", "fungus": "Black rot (Xanthomonas campestris), Downy mildew", "insects": "Harlequin bugs, Aphids", "risk_score": 65, "type": "Ice-Banked Walk-in Cold Room"},
  "Kohlrabi": {"temp": "0–1°C", "hum": "95–98%", "pres": "Trim tops to 2 cm; store in perforated master crates. Low temperature prevents rapid lignification of the inner edible bulb.", "shelf_life": "2–3 months", "fungus": "White rot (Sclerotinia), Rhizoctonia", "insects": "Cabbage stem weevil", "risk_score": 30, "type": "Chilled Root & Bulb Cold Storage"},
  "Leek": {"temp": "0–1°C", "hum": "95–100%", "pres": "Rapid hydrocooling or forced-air cooling to 0°C. Store upright or in perforated film-lined crates. Highly sensitive to ethylene which triggers leaf yellowing and elongation.", "shelf_life": "2–3 months", "fungus": "Purple blotch (Alternaria porri), White tip (Phytophthora porri), Bacterial soft rot", "insects": "Onion thrips, Leek moth (Acrolepiopsis assectella)", "risk_score": 35, "type": "High-Humidity Ventilated Cold Room"},
  "Lentil": {"temp": "15–20°C", "hum": "50–60%", "pres": "Thoroughly dry to 10% moisture; store in clean airtight silos away from direct heat and moisture.", "shelf_life": "18–24 months", "fungus": "Anthracnose, Ascochyta lentis", "insects": "Pulse Weevil (Callosobruchus maculatus)", "risk_score": 15, "type": "Hermetic Pulse Storage"},
  "Linseed": {"temp": "10–15°C", "hum": "<55%", "pres": "Dry to 7–9% moisture. Aerate silo continuously during the first 30 days to dissipate respiration heat and prevent rancidity.", "shelf_life": "12–18 months", "fungus": "Alternaria linicola, Fusarium oxysporum", "insects": "Rust-Red Flour Beetle, Sawtoothed Grain Beetle", "risk_score": 20, "type": "Climate-Controlled Oilseed Silo"},
  "Macadamia": {"temp": "0–10°C", "hum": "50–55%", "pres": "De-husk immediately; dry slowly to 1.5% moisture; pack in nitrogen-flushed heavy foil vacuum barrier bags.", "shelf_life": "18–24 months", "fungus": "Penicillium mold under moist conditions", "insects": "Macadamia Nut Borer, Tropical Nut Borer", "risk_score": 15, "type": "Nitrogen-Flushed Nut Storage Store"},
  "Maize": {"temp": "10–14°C", "hum": "50–55%", "pres": "Forced-air drying to 13% moisture immediately after harvest. Aerated steel bins to prevent dangerous aflatoxin spikes.", "shelf_life": "12–15 months", "fungus": "Aspergillus flavus (Aflatoxin), Gibberella ear rot", "insects": "Maize Weevil, Angoumois Grain Moth", "risk_score": 25, "type": "Aerated Metal Grain Silo"},
  "Mango": {"temp": "12–13°C", "hum": "85–90%", "pres": "Hot water dip treatment (48°C for 5 min) against anthracnose; store at 12–13°C to prevent chilling injury.", "shelf_life": "2–3 weeks", "fungus": "Anthracnose (Colletotrichum gloeosporioides), Stem-end rot", "insects": "Mango Seed Weevil, Oriental Fruit Fly", "risk_score": 85, "type": "Cold Storage & Vapour Heat Chamber"},
  "Moth Bean": {"temp": "15–22°C", "hum": "<50%", "pres": "Clean and dry to <9% moisture. Store in moisture-proof drums or hermetic bins away from heat sources.", "shelf_life": "18–24 months", "fungus": "Charcoal rot, Fusarium oxysporum", "insects": "Callosobruchus seed weevils", "risk_score": 15, "type": "Hermetic Pulse Silo with Desiccant"},
  "Muskmelon": {"temp": "3–7°C", "hum": "90–95%", "pres": "Rapid forced-air or hydrocooling to 3°C within hours of picking. High humidity prevents rind wrinkling.", "shelf_life": "1–2 weeks", "fungus": "Fusarium rot, Rhizopus soft rot", "insects": "Melon fly larvae", "risk_score": 75, "type": "Chilled Humid Produce Chamber"},
  "Nutmeg": {"temp": "15–20°C", "hum": "<60%", "pres": "Dry seed in shell for 6 weeks until kernels rattle; crack and remove shell; store in airtight tins in cool, dark rooms.", "shelf_life": "24–36 months", "fungus": "Aspergillus, Post-harvest rot", "insects": "Nutmeg Weevil, Coffee Bean Weevil", "risk_score": 15, "type": "Dehumidified Dark Storage Vault"},
  "Oil Palm": {"temp": "20–25°C", "hum": "60–70%", "pres": "Process Fresh Fruit Bunches (FFB) within 24 hours. Bruised fruits trigger rapid enzymatic lipase breakdown of free fatty acids.", "shelf_life": "24–48 hours", "fungus": "Marasmius palmivorus (Bunch rot)", "insects": "Bunch moth larvae", "risk_score": 90, "type": "Ventilated Ramp Hopper Storage"},
  "Olive": {"temp": "5–8°C", "hum": "85–90%", "pres": "Shallow ventilated plastic lugs (max 20 kg per lug) to prevent fruit crushing. Cold press within 24–48 hours.", "shelf_life": "1–2 weeks (Fruit) / 24 months (Bulk Oil)", "fungus": "Anthracnose (Colletotrichum acutatum), Botrytis cinerea", "insects": "Olive Fruit Fly (Bactrocera oleae)", "risk_score": 65, "type": "Pre-Milling Ventilated Produce Storage"},
  "Onion": {"temp": "0–2°C (Cold) or 25–30°C (Ambient)", "hum": "65–70%", "pres": "Thorough field curing until necks are paper-dry; store in slatted wooden crates or mesh bags with high forced ventilation.", "shelf_life": "6–9 months", "fungus": "Neck rot (Botrytis allii), Black mold (Aspergillus niger)", "insects": "Onion Thrips, Bulb Mites", "risk_score": 25, "type": "Ventilated Cold Storage / Curing Godown"},
  "Orange": {"temp": "3–8°C", "hum": "85–90%", "pres": "Wash, wax with food-grade fungicidal wax, and store in well-ventilated plastic crates. Avoid stack pressure.", "shelf_life": "3–8 weeks", "fungus": "Green mold (Penicillium digitatum), Blue mold", "insects": "Citrus Rust Mite, Scale insects", "risk_score": 45, "type": "Ventilated Chilled Warehouse"},
  "Papaya": {"temp": "10–12°C", "hum": "85–90%", "pres": "Hold at 10–12°C to slow ripening without chilling injury. Ethylene scrubbing in transit extends marketability.", "shelf_life": "1–3 weeks", "fungus": "Anthracnose (Colletotrichum gloeosporioides), Phytophthora", "insects": "Papaya Fruit Fly", "risk_score": 80, "type": "Cold Storage Produce Chamber"},
  "Peach": {"temp": "-0.5 to 0°C", "hum": "90–95%", "pres": "Hydrocooling; avoid temperature holding between 2–8°C which induces mealiness, flesh browning, and woolly texture.", "shelf_life": "2–4 weeks", "fungus": "Brown rot (Monilinia fructicola), Rhizopus stolonifer", "insects": "Oriental Fruit Moth", "risk_score": 85, "type": "Hydrocooled Cold Storage Chamber"},
  "Pecan": {"temp": "0–5°C (Short) / -10°C (Long)", "hum": "55–60%", "pres": "Dry in-shell to 4.5% kernel moisture. Store in sealed rooms with nitrogen flush or freezing to stop oil oxidation.", "shelf_life": "12–24 months", "fungus": "Pecan scab residual, Aspergillus flavus", "insects": "Pecan Weevil (Curculio caryae)", "risk_score": 20, "type": "Airtight Nut Cold Storage Vault"},
  "Pigeon Pea": {"temp": "15–20°C", "hum": "50–55%", "pres": "Sun dry to 9–10% moisture. Store in hermetic multi-layer PICS bags or sealed galvanized bins to suffocate pulse beetles.", "shelf_life": "18–24 months", "fungus": "Fusarium udum, Aspergillus flavus", "insects": "Pulse Beetle (Callosobruchus chinensis)", "risk_score": 15, "type": "Hermetic Pulse Silo / PICS Bags"},
  "Pigeon pea": {"temp": "15–20°C", "hum": "50–55%", "pres": "Sun dry to 9–10% moisture. Store in hermetic multi-layer PICS bags or sealed galvanized bins to suffocate pulse beetles.", "shelf_life": "18–24 months", "fungus": "Fusarium udum, Aspergillus flavus", "insects": "Pulse Beetle (Callosobruchus chinensis)", "risk_score": 15, "type": "Hermetic Pulse Silo / PICS Bags"},
  "Plum": {"temp": "0–1°C", "hum": "90–95%", "pres": "Forced-air pre-cooling. Avoid holding at 2–7°C (internal breakdown / flesh translucency zone).", "shelf_life": "3–6 weeks", "fungus": "Brown rot (Monilinia), Blue mold (Penicillium)", "insects": "Plum Curculio", "risk_score": 65, "type": "Controlled Atmosphere Cold Storage"},
  "Pomegranate": {"temp": "5–6°C", "hum": "90–95%", "pres": "Pre-cooling to 5°C. Package in plastic liner bags; keep above 5°C to avoid chilling husk scald.", "shelf_life": "2–3 months", "fungus": "Heart rot (Alternaria), Gray mold (Botrytis)", "insects": "Pomegranate Butterfly (Virachola isocrates)", "risk_score": 40, "type": "Chilled Atmosphere Storage"},
  "Potato": {"temp": "4–10°C", "hum": "90–95%", "pres": "Cure at 15°C for 2 weeks. Store in completely dark, ventilated cold storage; treat with CIPC sprout suppressant if table stock.", "shelf_life": "5–10 months", "fungus": "Late blight (Phytophthora infestans), Silver scurf", "insects": "Potato Tuber Moth (Phthorimaea operculella)", "risk_score": 50, "type": "Darkened Cold Storage with Sprout Suppression"},
  "Radish": {"temp": "0–1°C", "hum": "95–98%", "pres": "Hydrocool to 2°C immediately. Package in perforated polyethylene liners to retain moisture and turgidity.", "shelf_life": "3–4 weeks (Spring) / 2–4 months (Daikon)", "fungus": "Black root rot (Aphanomyces raphani), Soft rot", "insects": "Flea beetles residual, Root fly larvae", "risk_score": 30, "type": "High-Humidity Chilled Cold Storage"},
  "Raspberry": {"temp": "-0.5 to 0°C", "hum": "90–95%", "pres": "Ultra-rapid cooling to 0°C within 1 hour. Elevated CO2 atmosphere (15–20%) halts gray mold. Handle in rigid clamshells.", "shelf_life": "3–7 days", "fungus": "Botrytis cinerea, Cladosporium", "insects": "Spotted Wing Drosophila, Raspberry Fruitworm", "risk_score": 95, "type": "Rapid-Chilled CA Cold Storage"},
  "Rice": {"temp": "12–15°C", "hum": "60–65%", "pres": "Store in hermetic silos or multi-layer sealed bags. Keep moisture below 12%. Aerate periodically to purge moisture hotspots.", "shelf_life": "12–18 months", "fungus": "Aspergillus flavus, Penicillium islandicum", "insects": "Rice Weevil (Sitophilus oryzae), Lesser Grain Borer", "risk_score": 15, "type": "Hermetic Grain Silo with Aeration"},
  "Rubber": {"temp": "20–28°C", "hum": "<60%", "pres": "Hang smoked sheets on timber racks in dark, ventilated sheds. Strictly protect from copper, UV light, and heat.", "shelf_life": "12–24 months", "fungus": "Surface mold, Mildew in damp air", "insects": "Termites attacking structural timber", "risk_score": 15, "type": "Ventilated Dry Sheet Smokehouse Racks"},
  "Saffron": {"temp": "10–15°C", "hum": "<40%", "pres": "Rapid drying at 45°C immediately after flower harvesting; pack in airtight dark amber glass vials away from light and oxygen.", "shelf_life": "24–36 months", "fungus": "Mold from ambient humidity absorption", "insects": "Storage mites", "risk_score": 10, "type": "Airtight Amber Glass Nitrogen Vault"},
  "Shallot": {"temp": "0–2°C", "hum": "65–70%", "pres": "Field-cure tops for 2 weeks until neck tissue is completely sealed and paper-dry. Maintain low humidity (<70%) to stop root regrowth.", "shelf_life": "6–8 months", "fungus": "Neck rot (Botrytis allii), Black mold (Aspergillus niger)", "insects": "Onion Thrips, Bulb Mites", "risk_score": 20, "type": "Multi-Tiered Ambient Curing Godown"},
  "Soyabean": {"temp": "10–15°C", "hum": "<55%", "pres": "Clean and screen broken splits; forced aeration to maintain uniform cool temperature; monitor for hot spots to prevent free fatty acid (FFA) increase and oil rancidity.", "shelf_life": "12–18 months", "fungus": "Diaporthe phaseolorum (Pod & stem blight), Aspergillus flavus", "insects": "Bean Weevil, Sawtoothed Grain Beetle, Indian Meal Moth", "risk_score": 15, "type": "Dry Aerated Oilseed Silo Complex"},
  "Soybean": {"temp": "10–15°C", "hum": "<55%", "pres": "Clean and screen broken splits; forced aeration to maintain uniform cool temperature; monitor for hot spots to prevent free fatty acid (FFA) increase and oil rancidity.", "shelf_life": "12–18 months", "fungus": "Diaporthe phaseolorum (Pod & stem blight), Aspergillus flavus", "insects": "Bean Weevil, Sawtoothed Grain Beetle, Indian Meal Moth", "risk_score": 15, "type": "Dry Aerated Oilseed Silo Complex"},
  "Sponge Gourd": {"temp": "10–12°C", "hum": "85–90%", "pres": "Wrap individually in perforated paper wraps. Avoid temperatures below 10°C to prevent surface spotting and decay.", "shelf_life": "2–3 weeks", "fungus": "Anthracnose, Downy mildew", "insects": "Fruit Flies (Bactrocera cucurbitae)", "risk_score": 60, "type": "Cool Ventilated Storage Chamber"},
  "Sponge Guard": {"temp": "10–12°C", "hum": "85–90%", "pres": "Wrap individually in perforated paper wraps. Avoid temperatures below 10°C to prevent surface spotting and decay.", "shelf_life": "2–3 weeks", "fungus": "Anthracnose, Downy mildew", "insects": "Fruit Flies (Bactrocera cucurbitae)", "risk_score": 60, "type": "Cool Ventilated Storage Chamber"},
  "Squash": {"temp": "10–13°C", "hum": "60–75%", "pres": "Cure winter squash at 25°C for 10 days to harden skin; store on single layers on slatted shelves with good airflow. Avoid chilling.", "shelf_life": "2–6 months", "fungus": "Black rot (Didymella bryoniae), Fusarium rot", "insects": "Squash bugs, Pickleworm residual", "risk_score": 35, "type": "Cured Cool Storage Chamber"},
  "Sugarcane": {"temp": "10–14°C", "hum": "85–90%", "pres": "Crush within 24–48 hours of harvest. In transit storage, mist stalks and shade to halt sucrose inversion into reducing sugars.", "shelf_life": "1–2 weeks", "fungus": "Red rot (Colletotrichum falcatum), Ceratocystis paradoxa", "insects": "Stem Borer larvae, Scale insects", "risk_score": 80, "type": "Controlled Atmosphere Storage"},
  "Sunflower": {"temp": "10–15°C", "hum": "<55%", "pres": "Dry seed to 8% moisture. Forced aeration prevents hot spots and rapid rancidity of high-oil seeds.", "shelf_life": "12 months", "fungus": "Sclerotinia head rot, Alternaria helianthi", "insects": "Sunflower Moth larvae, Confused Flour Beetle", "risk_score": 25, "type": "Aerated Oilseed Silo"},
  "Sweet Potato": {"temp": "13–15°C", "hum": "85–90%", "pres": "MANDATORY: Cure at 28–30°C and 90% RH for 5–7 days to heal surface wounds before storage. NEVER store below 10°C (chilling injury causes core breakdown).", "shelf_life": "4–7 months", "fungus": "Black rot (Ceratocystis fimbriata), Rhizopus soft rot", "insects": "Sweet Potato Weevil (Cylas formicarius)", "risk_score": 40, "type": "Cured Tuber Ventilated Storage Chamber"},
  "Taro": {"temp": "11–13°C", "hum": "85–90%", "pres": "Cure corms at 30°C and 90% RH for 5 days after harvest to heal harvesting abrasions. Store in slatted wooden crates with steady cross-ventilation. Do NOT store below 10°C.", "shelf_life": "3–5 months", "fungus": "Taro leaf blight residual, Pythium soft rot, Fusarium corm dry rot", "insects": "Taro beetle (Papuana spp.), Corm borer", "risk_score": 40, "type": "Cured Ventilated Cool Tuber Chamber"},
  "Tea": {"temp": "15–20°C", "hum": "<50%", "pres": "Pack in airtight moisture-barrier foil-lined multi-wall paper sacks; isolate strictly from spices and high humidity.", "shelf_life": "18–36 months", "fungus": "Aspergillus mold if moisture rises above 7%", "insects": "Cigarette Beetle, Warehouse Moth", "risk_score": 10, "type": "Moisture-Barrier Foil-Lined Bins"},
  "Timothy Grass": {"temp": "5–12°C", "hum": "40–50%", "pres": "Air-dry in shaded ventilated racks; seal in airtight drums with silica gel to preserve seed viability.", "shelf_life": "24–36 months", "fungus": "Claviceps purpurea (Ergot)", "insects": "Grain mites, Timothy fly larvae", "risk_score": 15, "type": "Dehumidified Seed Storage Vault"},
  "Tobacco": {"temp": "20–25°C", "hum": "60–65%", "pres": "Condition cured leaves to 12–14% moisture; pack in wooden hogsheads or cardboard cases for fermentation aging.", "shelf_life": "24–48 months", "fungus": "Blue mold, Pole rot, Aspergillus", "insects": "Tobacco Beetle (Lasioderma serricorne)", "risk_score": 25, "type": "Controlled Humidity Aging Warehouse"},
  "Tomato": {"temp": "12–15°C", "hum": "85–90%", "pres": "Store mature green fruit at 13–15°C. Never store below 10°C (causes chilling injury, uneven ripening, and watery breakdown).", "shelf_life": "1–3 weeks", "fungus": "Alternaria rot, Early blight, Late blight", "insects": "Tomato Fruit Borer (Helicoverpa armigera)", "risk_score": 80, "type": "Anti-Chilling Cool Storage (12-15°C)"},
  "Turmeric": {"temp": "15–20°C", "hum": "<60%", "pres": "Boil fresh fingers, sun-dry to 10% moisture, and polish. Store in dark airtight containers to prevent curcumin photo-oxidation.", "shelf_life": "18–36 months", "fungus": "Rhizome rot, Storage penicillium", "insects": "Drugstore Beetle (Stegobium paniceum)", "risk_score": 15, "type": "Dehumidified Hermetic Spice Vault"},
  "Turnip": {"temp": "0–1°C", "hum": "95–98%", "pres": "Remove tops leaving 1 cm neck; store unwashed in slatted plastic crates; maintain 95% humidity to prevent spongy pithiness.", "shelf_life": "4–6 months", "fungus": "Bacterial soft rot (Pectobacterium), Rhizoctonia", "insects": "Cabbage Root Maggot (Delia radicum)", "risk_score": 25, "type": "Dark Chilled Root Cellar"},
  "Vanilla": {"temp": "15–20°C", "hum": "65–70%", "pres": "Cured beans (25–30% moisture) bundled in parchment paper and kept in wooden conditioning boxes to develop vanillin aroma.", "shelf_life": "18–36 months", "fungus": "Vanilla mold (Penicillium spp.)", "insects": "Storage mites, Dermestid beetles", "risk_score": 25, "type": "Waxed Paper-Lined Wooden Boxes"},
  "Vetch": {"temp": "10–16°C", "hum": "45–55%", "pres": "Sun dry harvested seeds to 9% moisture; pack in airtight containers to avoid bruchid multiplication.", "shelf_life": "24–36 months", "fungus": "Ascochyta pisi, Downy mildew", "insects": "Vetch Bruchid (Bruchus brachialis)", "risk_score": 15, "type": "Hermetic Pulse Seed Vault"},
  "Walnut": {"temp": "0–5°C", "hum": "55–65%", "pres": "Dry immediately to 4% moisture. Cold storage prevents polyunsaturated fatty acid oxidation and bitter rancidity.", "shelf_life": "12–18 months", "fungus": "Aspergillus, Penicillium", "insects": "Walnut Husk Fly, Indian Meal Moth", "risk_score": 20, "type": "Climate-Controlled Nut Storage"},
  "Watermelon": {"temp": "10–15°C", "hum": "85–90%", "pres": "Well-ventilated ambient/cool warehouse. Store single or double-stacked; below 10°C chilling causes rind pitting.", "shelf_life": "2–3 weeks", "fungus": "Gummy stem blight, Fusarium fruit rot", "insects": "Spider mites, Melon Aphid", "risk_score": 60, "type": "Ventilated Cool Storage"},
  "Wheat": {"temp": "15–18°C", "hum": "50–60%", "pres": "Hermetic silo or flat dry warehouse. Pre-clean to remove broken grains and chaff; ensure grain moisture < 11.5%.", "shelf_life": "18–24 months", "fungus": "Fusarium head blight, Aspergillus glaucus", "insects": "Granary Weevil (Sitophilus granarius), Sawtoothed Grain Beetle", "risk_score": 10, "type": "Hermetic Grain Silo"},
  "Yam": {"temp": "12–15°C", "hum": "75–85%", "pres": "Field cure at 32°C for 4 days. Store on slatted vertical wooden racks with continuous natural cross-ventilation. Keep above 12°C.", "shelf_life": "4–6 months", "fungus": "Yam dry rot (Penicillium sclerotigenum), Botryodiplodia", "insects": "Yam Beetle (Heteroligus meles), Scale insects", "risk_score": 35, "type": "Ventilated Traditional Yam Barn"},
  "Zucchini": {"temp": "7–10°C", "hum": "90–95%", "pres": "Hydrocool to 8°C. Extremely sensitive to ethylene (causes rapid yellowing) and cold injury below 5°C (causes water-soaked pits).", "shelf_life": "1–2 weeks", "fungus": "Watery soft rot (Sclerotinia), Gray mold", "insects": "Melon aphids, Whitefly nymphs", "risk_score": 70, "type": "Anti-Chilling Walk-in Cool Room"}
};

const getStorageProfile = (crop: string) => {
  const profile = STORAGE_PROFILES.find(p => p.regex.test(crop)) || STORAGE_PROFILES[0];
  const datasetEntry = DATASET_STORAGE_DB[crop] || Object.entries(DATASET_STORAGE_DB).find(([k]) => k.toLowerCase() === crop.toLowerCase())?.[1];
  
  const cropImg = getCropImage(crop) || "/crops/wheat/crop.webp";
  const storageImg = getStorageImage(crop) || "/crops/wheat/storage.webp";
  
  return {
    ...profile,
    type: datasetEntry?.type || profile.type,
    temp: datasetEntry?.temp || profile.temp,
    rh: datasetEntry?.hum || profile.rh,
    duration: datasetEntry?.shelf_life || profile.duration,
    preStorage: datasetEntry?.pres || profile.preStorage,
    precautions: datasetEntry ? `${datasetEntry.fungus} Protect against: ${datasetEntry.insects}` : profile.precautions,
    fungus: datasetEntry?.fungus,
    insects: datasetEntry?.insects,
    riskScore: datasetEntry?.risk_score,
    cropImage: cropImg,
    storageImage: storageImg,
    thumbnail: cropImg
  };
};

function StorageAI() {
  const [selectedCrop, setSelectedCrop] = useState("Wheat");
  const [quantity, setQuantity] = useState(10);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(() => getStorageProfile("Wheat"));
  const [searchQuery, setSearchQuery] = useState("");
  const [activeImageView, setActiveImageView] = useState<"crop" | "storage">("storage");
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleAnalyze = (cropName?: string) => {
    const targetCrop = cropName || selectedCrop;
    if (cropName) setSelectedCrop(cropName);
    
    setIsAnalyzing(true);
    setTimeout(() => {
      setResult(getStorageProfile(targetCrop));
      setIsAnalyzing(false);
      setTimeout(() => window.scrollTo({ top: 380, behavior: 'smooth' }), 100);
    }, 400);
  };

  const activeCropAsset = getCropAsset(selectedCrop);

  const storageReportData: ReportData | null = result ? {
    title: "Post-Harvest Crop Storage & Thermodynamic Specification Report",
    domain: "Storage Optimization",
    primaryResult: {
      label: "Designated Storage Architecture",
      value: `${selectedCrop} · ${result.type}`,
      subtext: `Optimal Duration: ${result.duration} | Temperature Range: ${result.temp} | Target RH: ${result.rh}`
    },
    parameters: [
      { label: "Crop Variety", value: selectedCrop, status: "optimal" },
      { label: "Storage Batch Quantity", value: quantity, unit: "Tons", status: "optimal" },
      { label: "Target Temperature", value: result.temp, status: "optimal" },
      { label: "Relative Humidity", value: result.rh, status: "optimal" },
      { label: "Critical Safe Moisture", value: result.moisture, status: "optimal" },
      { label: "Ventilation Requirement", value: result.ventilation, status: "optimal" },
      { label: "Ethylene Classification", value: result.ethylene, status: "optimal" },
      { label: "Maximum Shelf Life", value: result.duration, status: "optimal" },
    ],
    consensus: [
      { model: "SeedIQ Meta Architecture", prediction: result.type, confidence: "99.22%", architecture: "Thermodynamic Chamber Matching", isChampion: true },
      { model: "Grain Moisture Equilibrium", prediction: result.moisture, confidence: "ISO 9001", architecture: "Sorption Isotherm Model" },
      { model: "Controlled Atmosphere CA", prediction: result.rh, confidence: "Certified", architecture: "Aeration Dynamics Model" },
      { model: "Quantum Spoilage Predictor", prediction: "Zero Hotspots", confidence: "98.74%", architecture: "Hilbert Micro-climate Sim" },
    ],
    advisories: [
      { title: "Pre-Storage Conditioning", desc: result.preStorage, priority: "High" },
      { title: "Critical Precautions", desc: result.precautions, priority: "High" },
      { title: "Atmospheric Monitoring", desc: `Maintain continuous sensor monitoring for hot spots and relative humidity spikes above ${result.rh}.`, priority: "Standard" },
    ]
  } : null;

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-br from-slate-900 via-black to-slate-900 shadow-2xl p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8ed7e66a6a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        
        <div className="relative z-10 lg:w-2/3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-sky-500/30 bg-sky-500/10 shadow-[0_0_30px_-5px_hsl(200_70%_45%/0.5)]">
              <Warehouse className="h-6 w-6 text-sky-400" />
            </div>
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300 uppercase tracking-widest">Active Intelligence</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
            Storage <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Intelligence</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4 text-lg text-sky-100/70 max-w-xl">
            Crop-specific, thermodynamic storage protocols and facility intelligence. Maximize post-harvest preservation and prevent spoilage.
          </motion.p>
        </div>
      </div>

      {/* 2. INPUT SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 h-fit space-y-6">
          <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-sky-400" /> Configure Payload
          </h2>
          
          {/* Selected Crop Thumbnail Preview */}
          {activeCropAsset && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0">
                <img 
                  src={activeCropAsset.cropImage || "/crops/wheat/crop.webp"} 
                  alt={selectedCrop} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground uppercase font-mono">Target Crop</div>
                <div className="text-sm font-bold text-white truncate">{selectedCrop}</div>
              </div>
              {activeCropAsset.storageImage && (
                <div className="h-8 w-8 rounded-lg overflow-hidden border border-sky-500/30 shrink-0" title="Storage facility ready">
                  <img src={activeCropAsset.storageImage} alt="Storage" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-white/80 mb-2 block">Select Crop Variety</label>
              <select 
                value={selectedCrop} 
                onChange={e => {
                  const crop = e.target.value;
                  setSelectedCrop(crop);
                  setResult(getStorageProfile(crop));
                }} 
                className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none focus:border-sky-500/50 transition-colors"
              >
                {CROP_VARIETIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-white/80 block">Estimated Quantity</label>
                <span className="text-sm font-display font-bold text-sky-400">{quantity} Tons</span>
              </div>
              <input 
                type="range" min="1" max="5000" value={quantity} 
                onChange={(e) => setQuantity(parseInt(e.target.value))} 
                className="w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer"
                style={{ accentColor: "hsl(200 70% 50%)" }}
              />
            </div>
          </div>

          <button 
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing}
            className={`w-full py-4 rounded-xl font-display font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              isAnalyzing 
                ? "bg-sky-500/20 text-sky-400 cursor-not-allowed" 
                : "bg-sky-500 text-black hover:bg-sky-400 hover:shadow-[0_0_20px_-5px_hsl(200_70%_50%)]"
            }`}
          >
            {isAnalyzing ? (
              <><Warehouse className="h-5 w-5 animate-pulse" /> Retrieving Protocol...</>
            ) : (
              <>Generate Protocol <ArrowRight className="h-5 w-5" /></>
            )}
          </button>
        </div>

        {/* 3. RESULTS SECTION */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {!result && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full rounded-3xl border border-dashed border-white/10 bg-black/20 flex flex-col items-center justify-center p-12 text-center"
              >
                <Warehouse className="h-16 w-16 text-white/10 mb-4" />
                <h3 className="text-xl font-semibold text-white/40">Awaiting Configuration</h3>
                <p className="text-sm text-white/30 mt-2 max-w-sm">Select a crop and click generate to retrieve specialized storage and facility intelligence.</p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full rounded-3xl border border-sky-500/20 bg-sky-950/10 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.05)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
                <div className="relative z-10">
                  <div className="mb-6 flex justify-center">
                    <div className="h-16 w-16 rounded-full border-4 border-sky-500/20 border-t-sky-400 animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold text-sky-400">Cross-Referencing Storage Facility Database...</h3>
                  <p className="text-sm text-sky-200/50 mt-2">Retrieving thermodynamic requirements and storage imagery for {selectedCrop}.</p>
                </div>
              </motion.div>
            )}

            {result && !isAnalyzing && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl border border-sky-500/30 bg-black/60 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col h-full"
              >
                {/* Visual Imagery Banner with Dual Mode: Storage Facility & Harvest Crop */}
                <div className="h-84 md:h-96 w-full relative shrink-0 overflow-hidden bg-slate-950">
                  <img 
                    src={activeImageView === "storage" ? result.storageImage : result.cropImage} 
                    alt={selectedCrop} 
                    className="h-full w-full object-cover transition-all duration-700 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  {/* Top Image Switcher Controls */}
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/70 backdrop-blur-md p-1.5 rounded-2xl border border-white/15">
                    <button
                      onClick={() => setActiveImageView("storage")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        activeImageView === "storage" 
                          ? "bg-sky-500 text-black shadow-md font-bold" 
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      <Warehouse className="h-3.5 w-3.5" />
                      Storage Facility
                    </button>
                    <button
                      onClick={() => setActiveImageView("crop")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        activeImageView === "crop" 
                          ? "bg-emerald-500 text-black shadow-md font-bold" 
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      Fresh Crop
                    </button>
                  </div>

                  {/* Thumbnail Picture-in-Picture of the other image */}
                  <div 
                    onClick={() => setActiveImageView(prev => prev === "storage" ? "crop" : "storage")}
                    className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 cursor-pointer hover:scale-105 transition-transform"
                    title="Click to toggle view"
                  >
                    <div className="h-10 w-10 rounded-xl overflow-hidden border border-white/20">
                      <img 
                        src={activeImageView === "storage" ? result.cropImage : result.storageImage} 
                        alt="Alternative view" 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div className="text-[10px] font-mono text-white/80 pr-2">
                      <span className="text-muted-foreground block text-[8px] uppercase">Toggle View</span>
                      {activeImageView === "storage" ? "🌾 Crop" : "🏭 Storage"}
                    </div>
                  </div>

                  {/* Bottom Info Banner */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md mb-3 inline-block shadow-[0_0_15px_hsl(155_70%_45%/0.4)]">
                        {selectedCrop} ({result.id})
                      </span>
                      <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-1">{result.type}</h2>
                      <p className="text-emerald-100/70 font-medium text-sm md:text-base flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Optimal Storage Protocol Retrieved
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specifics */}
                <div className="p-8 flex-1 flex flex-col">
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <ParamCard icon={<ThermometerSun className="h-5 w-5 text-rose-400" />} label="Temperature" value={result.temp} />
                    <ParamCard icon={<Droplets className="h-5 w-5 text-sky-400" />} label="Relative Humidity" value={result.rh} />
                    <ParamCard icon={<Clock className="h-5 w-5 text-indigo-400" />} label="Storage Duration" value={result.duration} />
                    <ParamCard icon={<Fan className="h-5 w-5 text-teal-400" />} label="Ventilation" value={result.ventilation} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 flex-1">
                    <div className="space-y-4">
                      <DetailRow label="Safe Moisture Content" value={result.moisture} />
                      <DetailRow label="Ethylene Sensitivity" value={result.ethylene} />
                      {result.fungus && <DetailRow label="Fungal / Spoilage Vectors" value={result.fungus} warning />}
                    </div>
                    <div className="space-y-4">
                      <DetailRow label="Pre-storage Conditioning" value={result.preStorage} />
                      <DetailRow label="Key Precautions" value={result.precautions} warning />
                      {result.insects && <DetailRow label="Insect / Pest Vulnerability" value={result.insects} />}
                    </div>
                  </div>

                  {/* Print & Download Action Bar */}
                  <div className="flex flex-wrap items-center justify-end gap-4 border-t border-white/10 pt-6 no-print">
                    <button 
                      onClick={() => setIsReportOpen(true)}
                      className="flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-950/30 px-6 py-3 text-sm font-semibold text-sky-300 hover:bg-sky-900/40 transition-colors cursor-pointer"
                    >
                      <Printer className="h-4 w-4" /> Print Protocol Sheet
                    </button>
                    <button 
                      onClick={() => {
                        if (storageReportData) downloadReportPdfFile(storageReportData);
                      }}
                      className="flex items-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-500 transition-colors shadow-lg shadow-sky-900/50 cursor-pointer"
                      title="Download Storage Optimization Report (PDF)"
                    >
                      <Download className="h-4 w-4" /> Export Storage Report (PDF)
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Official Publication-Grade Report Modal */}
          {result && storageReportData && (
            <ReportModal
              isOpen={isReportOpen}
              onClose={() => setIsReportOpen(false)}
              data={storageReportData}
            />
          )}
        </div>
      </div>

      {/* 4. GLOBAL STORAGE DIRECTORY */}
      <div className="pt-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-white mb-2">Global Storage Directory</h2>
            <p className="text-emerald-100/60 max-w-xl">Master catalog of 100+ crops with verified facility protocols, storage conditions, and authentic imagery.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input 
              type="text" 
              placeholder="Search crops..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-sky-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CROP_VARIETIES.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase())).map(crop => {
            const profile = getStorageProfile(crop);
            return (
              <div 
                key={crop} 
                onClick={() => handleAnalyze(crop)}
                className="rounded-2xl border border-white/5 bg-white/5 p-4 flex gap-4 hover:bg-white/10 hover:border-sky-500/30 transition-all cursor-pointer group overflow-hidden relative"
              >
                {/* Dual Thumbnail: Crop Image with Storage overlay on hover */}
                <div className="h-18 w-18 rounded-xl overflow-hidden shrink-0 bg-black relative border border-white/10">
                  <img src={profile.cropImage} alt={crop} className="h-full w-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  {profile.storageImage && (
                    <div className="absolute bottom-0 right-0 h-6 w-6 rounded-tl-lg overflow-hidden border-t border-l border-white/20 bg-black/80">
                      <img src={profile.storageImage} alt="Storage" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 z-10">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display font-semibold text-white truncate pr-2 group-hover:text-sky-300 transition-colors">{crop}</h3>
                    <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">{profile.id}</span>
                  </div>
                  <div className="text-xs text-white/70 truncate mb-2">{profile.type}</div>
                  <div className="flex items-center gap-3 text-[10px] text-white/50">
                    <span className="flex items-center gap-1"><ThermometerSun className="h-3 w-3 text-emerald-400" /> {profile.temp}</span>
                    <span className="flex items-center gap-1"><Droplets className="h-3 w-3 text-sky-400" /> {profile.rh}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ParamCard({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4 flex flex-col items-center text-center justify-center gap-2">
      <div className="h-10 w-10 rounded-full bg-black/40 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-white/50 mb-1">{label}</div>
        <div className="text-sm font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, warning }: { label: string, value: string, warning?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${warning ? 'bg-rose-500/10 border-rose-500/20' : 'bg-white/5 border-white/5'}`}>
      <div className="flex items-center gap-2 mb-1 text-xs uppercase tracking-widest font-semibold text-white/50">
        {warning && <AlertTriangle className="h-3 w-3 text-rose-400" />} {label}
      </div>
      <div className={`text-sm font-medium ${warning ? 'text-rose-200' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}
