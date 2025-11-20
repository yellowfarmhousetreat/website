# Copilot Instructions for Yellow Farmhouse Treats Website

## ⚠️ CRITICAL: Site Operator Context

**The primary site operator is NON-TECHNICAL.** All features, documentation, and workflows MUST be designed for someone with minimal computer literacy:
- NO manual JSON editing for routine product management
- NO code exposure for normal operations  
- All error messages in plain, non-developer language
- Visual, form-based interfaces for all content updates
- Clear validation with helpful error messages
- Schema-driven, fail-safe design

## Project Overview

This is a **modern, schema-driven e-commerce website** for Yellow Farmhouse Treats microbakery. The site uses:
- **Static HTML/CSS/JS frontend** (no backend server)
- **JSON-based product data** with strict schema validation
- **Dynamic product rendering** (zero hardcoded product HTML)
- **Recipe card/tarot card aesthetic** for product display
- **Admin forms** for non-technical product management
- **Vite build system** for bundling and dev server
- **Accessibility-first design** (axe-core audits, WCAG compliance)

## Current Architecture (v3-liberation)

### Core Principle: **Data-Driven, Schema-First**
All products are defined in `/data/products-data.json` and validated against `/data/product-schema.json`. The schema enforces:
- Required fields: `id`, `name`, `category`, `description`, `image`, `sizes`, `dietary`
- Optional fields with defaults: `tier`, `ingredients`, `allergens`, `shippable`, `soldOut`
- Enum validation for `category` (cookies/pies/cakes/breads/candy) and `tier` (signature/seasonal/standard)
- Strict data types and formats

### Key Files & Structure

#### HTML Pages (Public-Facing)
- `index.html` - Homepage  
- `menu.html` - Full dynamic product menu (uses `render-products.js`)
- `cookies.html`, `pies.html`, `cakes.html`, `breads.html`, `candy.html` - Category-specific pages
- `order.html` - Order/cart page
- `cart.js` - Cart management (root level)

#### Admin Interface (`/admin/`)
- `product-form.html` is a prototype for `cookiewagon-20c574b7.html` - **PRIMARY PRODUCT MANAGEMENT INTERFACE**
  - Schema-driven form with visual validation
  - Non-technical friendly field labels and help text
  - Real-time validation with clear error messages
  - Photo uploader from `cookiewagon-20c574b7.html` needs to name the photo what the rest of the code expects it to be and store it in /images
  - JSON export (copy-paste workflow for now)
- `product-manager.js` - Form logic, schema loading, validation
- `admin.js` - Admin utilities (needs to be correctly linked to `/data/products-data.json`
  
#### Data Layer (`/data/`)
- `products-data.json` - **SINGLE SOURCE OF TRUTH** for all products
- `product-schema.json` - JSON Schema defining product structure and validation rules

#### Assets (`/assets/`)

**CSS:**
- `css/app.css` - **PRIMARY STYLESHEET**
  - Responsive grid layouts
  - Product card flip animations
  - Dark theme variables
- `css/product_cards.css` -needs created in order to keep primary stylesheet from exceeding 1500 lines
  - Contains recipe card/tarot card styles
- `css/fontawesome-all.min.css` - Icon fonts (not sure this is absolutely necessary, willing to compromise)

**JavaScript (Core Rendering):**
- `js/render-products.js` - **MAIN PRODUCT RENDERER**
  - Loads from `/data/products-data.json`
  - Renders flip cards dynamically
  - Handles size selection, quantity, add-to-cart
  - NO hardcoded product HTML
  - Incorporates card fliping feature, Photo and commerce features on one side, Ingredients and Allergy Info on the other. 
- `js/product-card-info.js` - Product card interactivity
- `js/main.js` - Template/site-shell logic
- `js/overlay-menu.js` - Mobile navigation
- `js/order.js` - Order form logic

**SASS (Source Styles - compiled to CSS):**
- `sass/` - Organized by base, components, layout, libs

### Build & Dev Environment

**Package Manager:** npm  
**Build Tool:** Vite (`vite.config.js`)  
**Dev Server:** `npm run dev` (runs on `localhost:5173`)  
**Build:** `npm run build`  
**Preview:** `npm run preview`

**Dependencies:**
- `@playwright/test` - E2E testing
- `axe-core` - Accessibility audits
- `vite` - Build system

### Product Card Design (Recipe/Tarot Card Aesthetic)

**Visual Style:**
- Cream/parchment colored cards (`#fdfbf7`)
- Brown borders (`#8b7355`) mimicking aged paper
- Punch-hole decorations in corners
- Polaroid-style product images (1/3 of card height)
- Lined paper texture (subtle repeating gradient)
- Courier New monospace font for recipe-card authenticity
- 3D flip animation (front→back shows ingredients/allergens)

**Card Dimensions:**
- Height: 520px (desktop), 500-580px (mobile)
- Max-width: 350px (centered)
- Image: 100px height (desktop), 90-120px (mobile)

**Interactive Elements:**
- **Size selection:** Clickable list items (highlighted when selected)
- **Quantity input:** Compact inline input (50px wide)
- **Info toggle:** Circle ⓘ button (48px, touch-friendly) - flips card
- **Back side:** Curved arrow ↩ button - returns to front
- **Add to Cart:** Brown button matching card aesthetic

**Accessibility:**
- Touch targets minimum 44-48px (with small circle i icon only, transparent background, no visible border)
- Keyboard navigation support
- ARIA labels on interactive elements
- High contrast text

## Data Flow & Product Rendering

```
admin panel can (upload photos from iPhotos for all products) edit/add/delete/and pause order taking when backlogged
    ↓
products-data.json
       ↓
   (validated against product-schema.json)
       ↓
  render-products.js loads JSON
       ↓
  createCard() generates DOM elements
       ↓
  Appends to #products-container
       ↓
  Event listeners (flip, size select, add-to-cart)
```

**Key Function:**  
`window.renderProducts(containerId, category=null)`
- Call with container ID (e.g., `'products-container'`)
- Optional category filter ('cookies', 'pies', etc.)
- Automatically loads, validates, and renders

## Developer Workflows

### Adding a New Product (NON-TECHNICAL USER)
1. Open `/admin/product-form.html` in browser
2. Fill out form fields (all labeled in plain English)
3. Click "Generate JSON"
4. Copy generated JSON
5. Paste into `/data/products-data.json` in the `products` array
6. Save file
7. Refresh menu page - product appears automatically

**CRITICAL:** Form validates against schema in real-time. Invalid data cannot be generated.

### Adding a New Product (DEVELOPER)
1. Edit `/data/products-data.json` directly
2. Add object to `products` array following schema
3. Run `npm run validate` (if validation script exists) or check browser console
4. Product auto-renders on page load

### Updating Product Schema
1. Edit `/data/product-schema.json`
2. Update `/admin/product-manager.js` form fields to match
3. Update `/assets/js/render-products.js` if new fields affect rendering
4. Update `PRODUCT_MANAGEMENT_GUIDE.md` documentation

### Styling Changes
1. **Quick CSS edits:** Directly edit `/assets/css/app.css`
2. **SASS workflow:** Edit files in `/assets/sass/`, compile to CSS
3. **Product card styles:** Look for `/* RECIPE CARD / TAROT STYLE */` section in `app.css`

### Testing
- **Manual:** Test in browser (Chrome, Firefox, Safari, mobile viewports)
- **Accessibility:** Run `/scripts/audit-accessibility.js` (Playwright + axe-core)
- **Validation:** Check browser console for schema validation errors

## Project-Specific Patterns & Rules

### CRITICAL RULES
1. **NEVER hardcode product HTML** - Always use `render-products.js`
2. **NEVER bypass schema validation** - All products must conform
3. **NEVER expose code to non-technical users** - Admin forms only
4. **ALWAYS validate JSON** before committing product data changes
5. **ALWAYS test flip animation** on card style changes
6. **ALWAYS check mobile responsiveness** (320px to 1920px)

### Product Data Patterns
- `id`: Lowercase, hyphenated (e.g., `'peanut-butter-cookies'`)
- `category`: Must match enum in schema
- `sizes`: Array of `{name, price}` objects (e.g., `[{name: '1/2 dozen', price: 12}]`)
- `dietary`: Object with boolean flags (`{glutenFree: true, sugarFree: false, vegan: false}`)
- `image`: Relative path from root (e.g., `'/images/cookies/peanut-butter.jpg'`)

### CSS Organization
- **Variables:** `:root` color scheme (`--color-bg`, `--color-accent`, etc.)
- **Dark theme** enforced (`color-scheme: dark`)
- **Utility classes:** Prefixed with `u-` (e.g., `.u-text-center`)
- **BEM-ish naming:** `.product-card__element-name`

### JavaScript Patterns
- **ES6 classes** for renderers (`SimpleProductRenderer`)
- **Async/await** for data loading
- **Event delegation** for dynamic content
- **No jQuery** - Vanilla JS only
- **Console logging** for debugging (use `console.log()` liberally)

## Integration Points

- **Formspree:** Form submission endpoint (contact, orders)
- **SnapWidget:** Instagram feed embed
- **Font Awesome:** Icon library (already bundled)
- **Google Fonts:** Typography (loaded in HTML `<head>`)

## Deployment

**Host:** GitHub Pages  
**Branch:** `main` (production) / `v3-liberation` (development)  
**Build:** Vite build outputs to `/dist/`  
**CNAME:** Custom domain configured

**Deployment Steps:**
1. Commit changes to `v3-liberation`
2. Test locally (`npm run dev`)
3. Build (`npm run build`)
4. Merge PR to `main`
5. GitHub Pages auto-deploys

## Security & Best Practices

- **No backend:** All data client-side (products are public anyway)
- **No sensitive data** in repo (API keys, passwords)
- **HTTPS enforced** via GitHub Pages
- **Accessibility audits** before major releases
- **WCAG 2.1 AA compliance** target
- **ESLint** for code quality (if configured)

## Common Tasks Quick Reference

| Task | File(s) | Method |
|------|---------|--------|
| Add product | `/data/products-data.json` | Use `/admin/product-form.html` OR edit JSON |
| Change product card design | `/assets/css/app.css` | Edit `/* RECIPE CARD */` section |
| Update menu layout | `/assets/css/app.css` | Edit `.products-grid` and related |
| Fix rendering bug | `/assets/js/render-products.js` | Debug `createCard()` function |
| Add new product field | `/data/product-schema.json` + renderer | Update schema, form, renderer |
| Change site colors | `/assets/css/app.css` | Edit `:root` CSS variables |
| Update footer | All `.html` files | Edit `<footer>` in each page |

## Troubleshooting

**Products not rendering:**
1. Check browser console for errors
2. Verify `products-data.json` is valid JSON (use JSONLint)
3. Ensure schema validation passes
4. Check `#products-container` exists in HTML
5. Verify `renderProducts()` is called in `<script>`

**Card styles broken:**
1. Check `app.css` loaded in `<head>`
2. Inspect element class names match CSS selectors
3. Verify no conflicting styles
4. Check responsive breakpoints (media queries)

**Admin form not working:**
1. Check `product-schema.json` loads correctly
2. Verify form fields match schema structure
3. Check console for validation errors
4. Ensure all required fields filled

## Future Enhancements (Roadmap)

- [ ] Backend API for product management (Node.js/Express)
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real cart with Stripe/PayPal checkout
- [ ] Inventory management
- [ ] Order tracking
- [ ] Customer accounts
- [ ] Admin dashboard (full CRUD)
- [ ] Image upload to CDN
- [ ] Analytics integration

## Important Notes for Copilot

1. **When generating product HTML:** Use `render-products.js` patterns, never hardcode
2. **When suggesting styling:** Match recipe card aesthetic (brown, cream, monospace fonts)
3. **When writing validation:** Follow JSON Schema patterns in `product-schema.json`
4. **When proposing new features:** Consider non-technical user workflows FIRST
5. **When debugging:** Always suggest checking browser console and validation
6. **When refactoring:** Maintain backward compatibility with existing `products-data.json`
7. **When adding fields:** Update schema, form, renderer, AND documentation together

## Documentation Files

- `ADMIN_REQUIREMENTS.md` - Admin interface requirements
- `PRODUCT_MANAGEMENT_GUIDE.md` - Product management workflows  
- `REBUILD_DESIGN_BLUEPRINT.md` - Design system documentation
- `README.txt` - Template credits and licensing
- `reference_document.md` - Legacy reference (deprecated)

---

**Last Updated:** 2025-11-20  
**Branch:** v3-liberation  
**Maintainer:** yellowfarmhousetreat
