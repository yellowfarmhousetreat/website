PRODUCT_MANAGEMENT_GUIDE.md# Product Management System - Data-Driven Schema

## Overview

This system uses a **schema-first approach** to product data management. Define fields once in a JSON schema, and the system automatically validates, fills defaults, and renders products with zero duplication.

**Key Benefits:**
- ✅ Single source of truth for product structure
- ✅ Automatic field validation & defaults
- ✅ Zero copy-paste for product data
- ✅ Flip-card templates with ingredient display
- ✅ Beautiful admin form for adding products

---

## Architecture

### Files

```
data/
├── product-schema.json          # Schema definitions
└── products-data.json           # Product catalog

assets/js/
├── product-manager.js           # Schema validation & management
├── render-products.js           # Flip-card template renderer
└── flip-card animation          # (in app.css)

admin/
└── product-form.html            # Web form for adding products

scripts/
└── add-product.js               # CLI tool for adding products (optional)
```

---

## Data Flow

```
┌─────────────────────┐
│ product-schema.json │  Define fields once
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────┐
│ ProductManager.js       │  Validate & fill defaults
│ - loadSchema()          │
│ - validateProduct()     │
│ - fillDefaults()        │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ products-data.json      │  Clean, normalized data
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ render-products.js      │  Flip-card templates
│ FlipCardRenderer        │
└──────────┬──────────────┘
           │
           ▼
       Beautiful UI!
```

---

## Adding Products

### Method 1: Web Form (Easiest)

1. Open `admin/product-form.html` in your browser
2. Fill in required fields
3. Optional fields auto-fill with defaults
4. Click "Generate JSON"
5. Copy the JSON output
6. Paste into `data/products-data.json` in the `products` array

### Method 2: Direct JSON Edit (Advanced)

Edit `data/products-data.json` directly. ProductManager will validate on load:

```json
{
  "id": "chocolate-chip-cookies",
  "name": "Chocolate Chip Cookies",
  "category": "cookies",
  "description": "Classic homemade...",
  "image": "images/cookies-chocolate-chip.jpg",
  "sizes": [{"name": "1/2 dozen", "price": 12}, {"name": "dozen", "price": 20}],
  "dietary": {"glutenFree": true, "sugarFree": false, "vegan": false},
  "ingredients": "Flour, butter, sugar, eggs, chocolate chips",
  "allergens": "Contains wheat, dairy, eggs",
  "shippable": false,
  "soldOut": false
}
```

---

## Schema Definition

File: `data/product-schema.json`

### Required Fields
- **id** - URL-safe identifier (lowercase, hyphens)
- **name** - Display name
- **category** - cookies | cakes | pies | breads
- **description** - Short product description
- **image** - Path to image file
- **sizes** - Array of {name, price} objects
- **dietary** - Object with glutenFree, sugarFree, vegan flags

### Optional Fields (Auto-filled if blank)
- **tier** - Regular | Fancy | Complex (default: Regular)
- **ingredients** - (default: "See package for details")
- **allergens** - (default: "See package for details")
- **shippable** - (default: false)
- **soldOut** - (default: false)

---

## Using ProductManager

### Load Schema
```javascript
await ProductManager.loadSchema();
```

### Validate Product
```javascript
const { valid, errors } = ProductManager.validateProduct(product);
if (!valid) {
  console.log('Errors:', errors);
}
```

### Auto-Fill Defaults
```javascript
ProductManager.fillDefaults(product);
// Now product has all defaults filled
```

### Complete Workflow
```javascript
await ProductManager.loadSchema();
const result = ProductManager.normalizeProduct(product);
if (result.valid) {
  console.log('Product ready:', result.product);
} else {
  console.log('Validation errors:', result.errors);
}
```

---

## Rendering Products

### Basic Usage
```javascript
const renderer = new FlipCardRenderer('products-grid');
await renderer.init();
renderer.renderByCategory('cookies');
```

### HTML Setup
```html
<div id="products-grid"></div>
<script src="assets/js/render-products.js"></script>
<script src="assets/js/product-manager.js"></script>
<script>
  const renderer = new FlipCardRenderer('products-grid');
  renderer.init().then(() => {
    renderer.renderByCategory('cookies');
  });
</script>
```

---

## Flip Card Features

**Front Side:**
- Product image
- Product name
- Description
- Dietary tags (GF = Gluten Free, SF = Sugar Free, V = Vegan)
- Price range
- Size/price options
- Add to Cart button
- "Click to see ingredients" hint

**Back Side (Click to flip):**
- Ingredients list
- Allergen warnings
- Kitchen processing disclaimer
- "Click to return" hint

---

## Workflow Example

### Adding a New Product

1. **Go to admin form:**
   ```
   admin/product-form.html
   ```

2. **Fill form:**
   - ID: `lavender-blueberry`
   - Name: `Lavender Blueberry Cookies`
   - Category: `cookies`
   - Description: `Delicate lavender with tart blueberries`
   - Image: `images/cookies-lavender-blueberry.jpg`
   - Sizes: `[{"name": "1/2 dozen", "price": 18}, {"name": "dozen", "price": 32}]`
   - Dietary: `{"glutenFree": true, "sugarFree": false, "vegan": false}`

3. **Submit** → JSON generated → Copy

4. **Paste into `data/products-data.json`:**
   ```json
   "products": [
     { ...existing products... },
     { ...copied JSON... },
   ]
   ```

5. **Done!** Product now renders on cookies.html with flip-card template

---

## Validation Rules

### Required Field Validation
- All required fields must be present & non-empty
- Rejects: `null`, `undefined`, empty strings

### Enum Validation
- **category** must be: cookies | cakes | pies | breads
- **tier** must be: Regular | Fancy | Complex

### Data Type Validation
- **sizes** must be an array
- **dietary** must be an object
- **prices** must be numbers

---

## Performance Notes

- Schema loads once on page load
- Products rendered via template (no DOM duplication)
- Lazy-loaded flip card animations (CSS3)
- Fast filtering by category

---

## Troubleshooting

### "Schema not loaded" Error
Make sure `ProductManager.loadSchema()` is called before using validation:
```javascript
await ProductManager.loadSchema();
```

### Validation Errors
Check the admin form error messages:
- Missing required fields
- Invalid category/tier enum
- Malformed JSON in sizes/dietary

### Products Not Appearing
1. Verify JSON syntax in `products-data.json`
2. Check product category matches filter
3. Inspect console for fetch errors

---

## Next Steps

- [ ] Add more dietary options (nut-free, dairy-free, etc.)
- [ ] Implement product image upload
- [ ] Add inventory/stock tracking
- [ ] Create bulk import from CSV
- [ ] Add product analytics/popularity

---

**Created:** Data-first architecture for maintainability and zero-duplication product management.
