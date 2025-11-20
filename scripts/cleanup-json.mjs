#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../public/data/products-data.json');

console.log('Reading JSON file...');
const rawData = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(rawData);

console.log(`Found ${data.products.length} products`);

let cleanedCount = 0;
data.products.forEach(product => {
  let hadVariants = false;
  
  if (product.variantIngredients) {
    delete product.variantIngredients;
    hadVariants = true;
  }
  
  if (product.variantAllergens) {
    delete product.variantAllergens;
    hadVariants = true;
  }
  
  if (hadVariants) {
    cleanedCount++;
  }
});

console.log(`Cleaned ${cleanedCount} products (removed variantIngredients and variantAllergens)`);

// Update version timestamp
data.version = new Date().toISOString();
data.metadata.lastUpdated = new Date().toISOString();

// Write back to file with pretty formatting
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');

console.log('✅ JSON file cleaned successfully!');
console.log('Back of cards will now only show: Ingredients and Allergen information');
