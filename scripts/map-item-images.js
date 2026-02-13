// ─── Map items.json entries to their best-matching image file ──
// Run: node scripts/map-item-images.js
const fs = require("fs");
const path = require("path");

const ITEMS_PATH = path.join(__dirname, "../public/data/items.json");
const IMAGES_DIR = path.join(__dirname, "../public/images/items");

// Category name → image folder mapping
const CATEGORY_MAP = {
  "Bathroom Items": "Bathroom_Furniture",
  "Bedroom Furniture": "Bedroom",
  "Children Baby Items": "Children_Baby_Items",
  "Dining Room Furniture": "Dining_Room_Furniture",
  "Electrical Electronics": "Electrical_Electronic",
  "Garden Outdoor Furniture": "Garden_Outdoor",
  "Gym Equipment": "Gym_Fitness_Equipment",
  "Home Office Furniture": "Office_furniture",
  "Kitchen Items": "Kitchen_appliances",
  "Living Room Furniture": "Living_room_Furniture",
  "Miscellaneous Items": "Miscellaneous_household",
  "Musical Instruments": "Musical_instruments",
  "Pet Items": "Pet_items",
  "Seasonal Items": "Garden_Outdoor", // fallback
  "Special Awkward Items": "Special_Awkward_items",
  "Storage Hallway Furniture": "Wardrobes_closet", // fallback
};

// Build index: folder → list of filenames
const imageIndex = {};
for (const dir of fs.readdirSync(IMAGES_DIR)) {
  const full = path.join(IMAGES_DIR, dir);
  if (!fs.statSync(full).isDirectory()) continue;
  imageIndex[dir] = fs.readdirSync(full).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
}

// Normalize text for matching
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/);
}

// Score how well an image filename matches an item name
function score(itemWords, filename) {
  const fileWords = normalize(filename.replace(/\.\w+$/, ""));
  let matched = 0;
  for (const w of itemWords) {
    if (w.length < 3) continue;
    if (fileWords.some((fw) => fw.includes(w) || w.includes(fw))) {
      matched++;
    }
  }
  return matched;
}

const raw = fs.readFileSync(ITEMS_PATH, "utf-8").replace(/^\uFEFF/, "");
const items = JSON.parse(raw);
let mapped = 0;
let unmapped = 0;

for (const item of items) {
  const folder = CATEGORY_MAP[item.category];
  if (!folder || !imageIndex[folder] || imageIndex[folder].length === 0) {
    item.image = "";
    unmapped++;
    continue;
  }

  const itemWords = normalize(item.name);
  let bestFile = imageIndex[folder][0];
  let bestScore = 0;

  for (const file of imageIndex[folder]) {
    const s = score(itemWords, file);
    if (s > bestScore) {
      bestScore = s;
      bestFile = file;
    }
  }

  item.image = `/images/items/${folder}/${bestFile}`;
  mapped++;

  if (bestScore === 0) {
    // No word match — assign first image from category as fallback
    item.image = `/images/items/${folder}/${imageIndex[folder][0]}`;
  }
}

fs.writeFileSync(ITEMS_PATH, JSON.stringify(items, null, 2), "utf-8");
console.log(`Done. Mapped: ${mapped}, Unmapped: ${unmapped}, Total: ${items.length}`);
