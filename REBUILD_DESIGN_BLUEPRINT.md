# Yellow Farmhouse Treats — Clean Rebuild Blueprint
**Version:** 3.0 CLEAN SLATE  
**Last updated:** November 18, 2025  
**Status:** Ready for empty repo deployment

This is the ONLY design document needed for the rebuild. Start with an empty repository containing:
- This file (`REBUILD_DESIGN_BLUEPRINT.md`)
- `reference_document.md` (working farmhousestand.com HTML/CSS/JS for reference)

Everything else builds from scratch. No template inheritance. No legacy cruft.

---

## 1. Mission & Success Criteria

**Business Goal:** Regional microbakery e-commerce platform that captures custom orders, displays menu/pricing, and gives the baker full control over inventory without touching code.

**Experience Pillars:**
1. Mobile-first browsing with primary CTAs at top
2. Clear pricing, dietary/allergen transparency
3. Frictionless Browse → Cart → Order flow
4. Single-owner admin panel (local browser tool, no backend)

**Rebuild Objective:** Static HTML/CSS/JS stack upgraded from farmhousestand.com that eliminates template dependencies and enables "this doesn't look right, fix it" edits without breaking logic.

---

## 2. Non-Negotiable Rules

1. **No emojis anywhere** in code, comments, or commits.
2. **PayPal is the only payment processor**; Cash/Cash App/Venmo/Zelle are informational deposit instructions only.
3. **Mobile-first layouts**: primary actions near top on phones.
4. **Separate HTML pages**: `index.html`, `menu.html`, `cookies.html`, `cakes.html`, `pies.html`, `breads.html`, `order.html`, plus obscured admin file.
5. **Centralized product data**: `products-data.js` feeds all surfaces.
6. **Client-only architecture**: localStorage + Formspree + PayPal. No backend.
7. **Security through obscurity**: Admin filename is `cookiewagon.html` (not "admin") with no public links/sitemaps.

---

## 3. Information Architecture

PUBLIC SITE
├── index.html // Hero, Instagram embed, "Order Now" / "Browse Menu" CTAs
├── menu.html // Tabbed product browser (Cookies/Cakes/Pies/Breads)
├── cookies.html // Direct category page
├── cakes.html
├── pies.html
├── breads.html
└── order.html // Multi-step: Cart → Fulfillment → Payment

OBSCURED ADMIN (security through obscurity)
└── cookiewagon.html // In-browser admin panel (bookmark-only access, no nav links)

SHARED LOGIC
├── /assets/js/
│ ├── products-data.js // Master product array (JSON structure)
│ ├── site-config.js // ordersPaused, soldOutItems, deposit%, Formspree endpoint
│ ├── cart.js // localStorage CRUD + badge updates
│ ├── product-loader.js // Renders product cards from data
│ └── order-logic.js // Multi-step form, deposit calc, Formspree POST
├── /assets/css/
│ ├── base.css // Design system (see Section 7)
│ └── components.css // Buttons, cards, forms, nav
└── /images/ // Product photos, hero, favicons


**Admin Security Model:**
- Filename `cookiewagon.html` is NOT linked anywhere on site (no nav, footer, sitemap, robots.txt)
- Access via bookmark or direct URL typing only
- Document in README: "This is local-use only. Public hosting = zero authentication. Use at your own risk."
- No login system (client-side localStorage can't authenticate)

---

## 4. User Journeys

### 4.1 Customer Flow: Browse → Cart → Order

**Browse:**
- Land on `index.html` → click "Browse Menu" → `menu.html`
- Tabs (Cookies/Cakes/Pies/Breads) or direct category links
- Product cards show: name, price, sizes/tiers, dietary toggles (GF/SF/Vegan), allergens, "Ships Nationwide" badge (Pecan English Toffee only)

**Add to Cart:**
- Click "Add to Cart" → `cart.js` writes to localStorage, updates badge
- Continue browsing or click cart icon → `order.html`

**Order Steps (`order.html`):**
1. **Cart Review**: Edit quantity, remove items, see subtotal → "Proceed"
2. **Fulfillment**: Radio buttons (Pickup/Shipping). Shipping only if cart has Pecan English Toffee; if yes, show ZIP input + calculated cost.
3. **Details**: Pickup date/time, special instructions, "How did you hear about us?" dropdown
4. **Payment**: Display subtotal + shipping + **50% deposit required**. Show payment method instructions (Cash/Cash App/Venmo/PayPal/Zelle). Checkbox "I agree to pay deposit" → "Submit Order" → POST to Formspree → confirmation page.

---

### 4.2 Baker Admin Flow (`cookiewagon.html`)

**Access:** Type URL directly or use bookmark. No link from public site.

**Dashboard Sections:**
1. **Product CRUD**:
   - Table/grid of all products from `products-data.js`
   - Add New: form with fields (name, category, basePrice, sizes, tiers, dietary, allergens, shipsNationwide, imageUrl)
   - Edit: inline or modal
   - Delete: confirmation prompt
   - Save: Downloads updated `products-data.js` for manual upload to GoDaddy

2. **Site Settings**:
   - Orders Paused toggle (writes to `site-config.js`)
   - Sold Out Items: checkboxes → updates `soldOutItems` array
   - Save: Downloads updated `site-config.js`

3. **Orders/Export**:
   - No backend; baker reviews Formspree email notifications
   - "Export Cart" button downloads localStorage as JSON (debugging)

**Why localStorage download instead of direct file write?**
- Static hosting (GoDaddy) = no server-side writes
- Baker downloads JSON → uploads via GoDaddy file manager or GitHub sync
- Future: GitHub API integration for auto-commits (post-launch enhancement)

---

## 5. Product Data Schema

**File:** `assets/js/products-data.js`
const productsData = [
{
id: "chocolate-chip-cookies", // Unique, no spaces
name: "Chocolate Chip Cookies",
category: "cookies", // "cookies"|"cakes"|"pies"|"breads"
basePrice: 12.00,
sizes: [ // Optional; use sizes OR tiers, not both
{ label: "Half Dozen", price: 12.00 },
{ label: "Dozen", price: 20.00 }
],
dietary: {
glutenFree: { available: true, priceAdd: 3.00 },
sugarFree: { available: false, priceAdd: 0 },
vegan: { available: true, priceAdd: 2.00 }
},
allergens: ["Wheat", "Eggs", "Dairy"], // Empty array if none
shipsNationwide: false, // true ONLY for Pecan English Toffee
imageUrl: "/images/products/chocolate-chip-cookies.jpg",
description: "Classic homemade cookies." // Optional
}
// ... more products
];

text

**Validation:**
- `id` must be unique
- `category` must match: cookies, cakes, pies, breads
- `basePrice` required; sizes/tiers optional
- `dietary.*.available` defaults false
- `shipsNationwide` defaults false

---

## 6. Site Configuration Schema

**File:** `assets/js/site-config.js`

const siteConfig = {
ordersPaused: false, // If true: show banner, disable "Add to Cart"
soldOutItems: [], // Array of product IDs
shippingRate: 8.50, // Flat rate USD
depositPercentage: 0.50, // 50% required
formspreeEndpoint: "https://formspree.io/f/YOUR_FORM_ID",
paypalClientId: "YOUR_PAYPAL_CLIENT_ID",
contactInfo: {
email: "orders@yellowfarmhousetreats.com",
phone: "(555) 123-4567",
instagram: "@yellowfarmhousetreats",
facebook: "YellowFarmhouseTreats"
}
};

text

---

## 7. CSS Architecture: Eject and Rebuild

**Goal:** Strip all template CSS. Build modular, maintainable system with custom properties. Enable "doesn't look right → fix it" without breaking.

### 7.1 File Structure
/assets/css/
├── base.css // Reset + design tokens (variables) + base layout
└── components.css // Buttons, cards, nav, forms, badges

text

### 7.2 Base CSS (`base.css`)

**Start with minimal reset:**
{
margin: 0;
padding: 0;
box-sizing: border-box;
}

body {
font-family: 'Open Sans', sans-serif;
background: #fffef8;
color: #3d3d3d;
line-height: 1.6;
}

text

**Design tokens (CSS custom properties):**
:root {
/* Brand Colors /
--color-primary: #f5cd53; / Yellow /
--color-primary-dark: #d4af38;
--color-accent: #59461c; / Brown */
--color-success: #27ae60;
--color-danger: #e74c3c;
--color-bg: #fffef8;
--color-text: #3d3d3d;
--color-text-light: #666;
--color-border: #d4c5b9;

/* Typography */
--font-size-base: 16px;
--font-size-sm: 14px;
--font-size-lg: 18px;
--font-size-xl: 24px;
--font-size-2xl: 32px;

/* Spacing */
--spacing-xs: 0.5rem;
--spacing-sm: 1rem;
--spacing-md: 1.5rem;
--spacing-lg: 2rem;
--spacing-xl: 3rem;

/* Layout */
--container-max: 1200px;
--border-radius: 8px;
--box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

text

**Container/grid:**
.container {
max-width: var(--container-max);
margin: 0 auto;
padding: 0 var(--spacing-md);
}

.grid {
display: grid;
gap: var(--spacing-md);
}

.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

/* Mobile-first responsive */
@media (max-width: 768px) {
.grid-2, .grid-3, .grid-4 {
grid-template-columns: 1fr;
}
}

text

### 7.3 Components (`components.css`)

**Buttons:**
.btn {
display: inline-block;
padding: var(--spacing-sm) var(--spacing-md);
font-size: var(--font-size-base);
font-weight: 600;
text-align: center;
border-radius: var(--border-radius);
cursor: pointer;
border: none;
transition: all 0.2s;
}

.btn-primary {
background: var(--color-primary);
color: var(--color-accent);
}

.btn-primary:hover {
background: var(--color-primary-dark);
}

.btn-secondary {
background: white;
color: var(--color-accent);
border: 2px solid var(--color-accent);
}

text

**Product Cards:**
.product-card {
background: white;
border: 1px solid var(--color-border);
border-radius: var(--border-radius);
padding: var(--spacing-md);
box-shadow: var(--box-shadow);
}

.product-card__image {
width: 100%;
height: 200px;
object-fit: cover;
border-radius: var(--border-radius);
margin-bottom: var(--spacing-sm);
}

.product-card__name {
font-size: var(--font-size-lg);
font-weight: 600;
margin-bottom: var(--spacing-xs);
}

.product-card__price {
font-size: var(--font-size-xl);
color: var(--color-accent);
font-weight: bold;
}

.product-card__badge {
display: inline-block;
padding: 0.25rem 0.5rem;
font-size: var(--font-size-sm);
background: var(--color-success);
color: white;
border-radius: 4px;
margin-top: var(--spacing-xs);
}

text

**Forms:**
.form-group {
margin-bottom: var(--spacing-md);
}

.form-label {
display: block;
margin-bottom: var(--spacing-xs);
font-weight: 600;
}

.form-input,
.form-select,
.form-textarea {
width: 100%;
padding: var(--spacing-sm);
font-size: var(--font-size-base);
border: 1px solid var(--color-border);
border-radius: var(--border-radius);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
outline: none;
border-color: var(--color-primary);
}

text

### 7.4 Instructions for Copilot

**When user says "This doesn't look right, fix it":**
1. Identify the specific CSS selector/property causing the issue
2. Edit ONLY that rule in `base.css` or `components.css`
3. If color/spacing issue: change the `--custom-property` value in `:root`
4. Do NOT add new classes or override with inline styles
5. Test change, confirm with user, move on

**No template dependencies:**
- Zero `@import` from external themes
- Zero `.template-*` or `.legacy-*` selectors
- Every class name describes purpose, not template structure
- Use semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`)

---

## 8. Build & Migration Plan

###

