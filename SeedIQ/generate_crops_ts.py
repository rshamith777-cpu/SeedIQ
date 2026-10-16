import json
import os

with open('seediq-frontend/public/crops/crop_images_manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

ts_content = '''// Master crop definitions and image asset mapping
export interface CropAsset {
  name: string;
  slug: string;
  cropImage?: string;
  storageImage?: string;
}

export const CROP_ASSETS: Record<string, CropAsset> = ''' + json.dumps(manifest, indent=2) + ''';

export const CROP_VARIETIES = [
  "Wheat", "Rice", "Maize", "Cotton", "Groundnut", "Sunflower", "Soybean", "Sugarcane", 
  "Sorghum", "Pearl Millet", "Finger Millet", "Barley", "Oats", "Rye", "Buckwheat",
  "Quinoa", "Amaranth", "Teff", "Wild Rice", "Spelt", "Triticale", "Canola",
  "Mustard", "Sesame", "Linseed", "Safflower", "Castor", "Niger Seed", "Olive",
  "Oil Palm", "Coconut", "Chickpea", "Pigeon Pea", "Lentil", "Black Gram", "Green Gram",
  "Cowpea", "Horse Gram", "Moth Bean", "Peas", "Faba Bean", "Lupin", "Alfalfa",
  "Clover", "Timothy Grass", "Bermuda Grass", "Ryegrass", "Fescue", "Brome", "Vetch",
  "Potato", "Sweet Potato", "Cassava", "Yam", "Taro", "Beetroot", "Turnip", "Radish",
  "Carrot", "Onion", "Garlic", "Leek", "Shallot", "Tomato", "Eggplant", "Capsicum",
  "Chili", "Chilli", "Cucumber", "Pumpkin", "Squash", "Zucchini", "Watermelon", "Muskmelon",
  "Bitter Gourd", "Bottle Gourd", "Ridge Gourd", "Sponge Gourd", "Ash Gourd", "Snake Gourd",
  "Cabbage", "Cauliflower", "Broccoli", "Brussels Sprouts", "Kohlrabi", "Kale", "Spinach",
  "Lettuce", "Celery", "Asparagus", "Artichoke", "Apple", "Banana", "Orange",
  "Mango", "Grapes", "Pineapple", "Papaya", "Guava", "Pomegranate", "Strawberry",
  "Blueberry", "Raspberry", "Blackberry", "Cherry", "Plum", "Peach", "Pear",
  "Almond", "Walnut", "Cashew", "Pecan", "Pistachio", "Macadamia", "Hazelnut",
  "Coffee", "Tea", "Cocoa", "Tobacco", "Rubber", "Jute", "Flax", "Hemp",
  "Turmeric", "Ginger", "Cardamom", "Black Pepper", "Clove", "Cinnamon", "Nutmeg",
  "Vanilla", "Saffron", "Coriander", "Cumin", "Fennel", "Fenugreek", "Mustard Seed",
  "Abaca", "Dragon Fruit", "Ivy Gourd", "Arecanut"
];

function normalizeKey(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[()]/g, "")
    .replace(/\\s+/g, "-")
    .replace(/_+/g, "-");
}

export function getCropAsset(cropName: string): CropAsset | null {
  if (!cropName) return null;
  const key = normalizeKey(cropName);
  
  if (CROP_ASSETS[key]) return CROP_ASSETS[key];
  
  // Specific alias mappings
  if (key.includes("areca") || key.includes("arecanut")) return CROP_ASSETS["areacnut"] || null;
  if (key.includes("bottle")) return CROP_ASSETS["bottle-guard"] || null;
  if (key.includes("sponge")) return CROP_ASSETS["sponge-guard"] || CROP_ASSETS["sponge-gourd"] || null;
  if (key.includes("ash") && key.includes("gourd")) return CROP_ASSETS["ash-gourd"] || null;
  if (key.includes("brinjal") || key.includes("eggplant")) return CROP_ASSETS["brinjal"] || null;
  if (key.includes("paddy") || key.includes("rice")) return CROP_ASSETS["rice"] || null;
  if (key.includes("corn") || key.includes("maize")) return CROP_ASSETS["maize(corn)"] || CROP_ASSETS["maize"] || null;
  if (key.includes("chilli") || key.includes("chili")) return CROP_ASSETS["chilli"] || CROP_ASSETS["chili"] || null;
  if (key.includes("tur") || key.includes("pigeon")) return CROP_ASSETS["pigeon-pea"] || CROP_ASSETS["piegon-pea"] || null;
  if (key.includes("cowpea") || key.includes("cow-pea")) return CROP_ASSETS["cowpea"] || CROP_ASSETS["cow-pea"] || null;
  if (key.includes("moth") && key.includes("bean")) return CROP_ASSETS["moth-bean"] || null;
  if (key.includes("faba") && key.includes("bean")) return CROP_ASSETS["faba-bean"] || null;
  if (key.includes("oil") && key.includes("palm")) return CROP_ASSETS["oil-palm"] || null;
  if (key.includes("sweet") && key.includes("potato")) return CROP_ASSETS["sweet-potato"] || null;
  if (key.includes("aspar")) return CROP_ASSETS["asparagus"] || CROP_ASSETS["aspargus"] || null;
  if (key.includes("brussel")) return CROP_ASSETS["brussels-sprouts"] || null;
  if (key.includes("black") && key.includes("pepper")) return CROP_ASSETS["black-pepper"] || null;

  // Partial match fallback
  for (const [k, val] of Object.entries(CROP_ASSETS)) {
    if (key.includes(k) || k.includes(key)) {
      return val;
    }
  }
  
  return null;
}

export function getCropImage(cropName: string): string | null {
  const asset = getCropAsset(cropName);
  return asset?.cropImage || null;
}

export function getStorageImage(cropName: string): string | null {
  const asset = getCropAsset(cropName);
  return asset?.storageImage || null;
}
'''

with open('seediq-frontend/src/lib/crops.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print('Successfully regenerated seediq-frontend/src/lib/crops.ts with', len(manifest), 'assets!')
