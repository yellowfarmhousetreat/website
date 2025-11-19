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


### 8.1 Scaffold New Repo (Phase 1: Structure)

**Step 1: Create directory structure**
yellowfarmhousetreats-rebuild/
├── index.html
├── menu.html
├── cookies.html
├── cakes.html
├── pies.html
├── breads.html
├── order.html
├── cookiewagon.html // Admin panel (obscured filename)
├── /assets/
│ ├── /js/
│ │ ├── products-data.js
│ │ ├── site-config.js
│ │ ├── cart.js
│ │ ├── product-loader.js
│ │ └── order-logic.js
│ └── /css/
│ ├── base.css
│ └── components.css
├── /images/
│ └── /products/
├── REBUILD_DESIGN_BLUEPRINT.md // This file
└── reference_document.md // Farmhousestand.com working code

text

**Step 2: Initialize base files**
- Copy design tokens from Section 7.2 into `/assets/css/base.css`
- Copy component patterns from Section 7.3 into `/assets/css/components.css`
- Create empty product data array in `products-data.js`
- Create site config object in `site-config.js`

---

### 8.2 Port Data (Phase 2: Content Migration)

**Migrate products from current site:**
1. Open existing yellowfarmhousetreats.com `products-data.js`
2. For each product, validate against schema (Section 5)
3. Ensure all IDs are unique and lowercase-hyphenated
4. Verify category matches one of: cookies, cakes, pies, breads
5. Test product loader renders cards correctly

**Migrate site config:**
1. Extract current `ordersPaused` status
2. Extract current `soldOutItems` array
3. Update Formspree endpoint (use existing or create new)
4. Add PayPal client ID from current integration

**Image assets:**
1. Download all product images from current site
2. Optimize for web (max 500KB per image, 800x800px recommended)
3. Upload to `/images/products/` with consistent naming: `product-id.jpg`

---

### 8.3 Build HTML Pages (Phase 3: Structure)

**Shared components ALL pages need:**

<!-- Navigation (top of every page) --> <header class="site-header"> <div class="container"> <a href="index.html" class="logo">Yellow Farmhouse Treats</a> <nav class="main-nav"> <a href="menu.html">Menu</a> <a href="order.html">Cart <span class="cart-badge" id="cart-count">0</span></a> </nav> </div> </header> <!-- Footer (bottom of every page) --> <footer class="site-footer"> <div class="container"> <div class="footer-social"> <a href="https://instagram.com/yellowfarmhousetreats" target="_blank">Instagram</a> <a href="https://facebook.com/YellowFarmhouseTreats" target="_blank">Facebook</a> </div> <p>&copy; 2025 Yellow Farmhouse Treats. All rights reserved.</p> </div> </footer> <!-- Scripts (end of body on every page) --> <script src="/assets/js/site-config.js"></script> <script src="/assets/js/products-data.js"></script> <script src="/assets/js/cart.js"></script>
text

**index.html specific:**
<main> <section class="hero"> <div class="container"> <h1>State Fair Winner in Baked Treats</h1> <p>Custom orders for pickup or nationwide shipping (select items)</p> <div class="hero-cta"> <a href="order.html" class="btn btn-primary">Order Now</a> <a href="menu.html" class="btn btn-secondary">Browse Menu</a> </div> </div> </section> <section class="instagram-feed"> <div class="container"> <h2>Check Out Our Latest Creations</h2> <!-- SnapWidget embed from existing site --> <script src="https://snapwidget.com/js/snapwidget.js"></script> <iframe src="YOUR_SNAPWIDGET_EMBED_URL" class="snapwidget-widget"></iframe> </div> </section> </main> ```
menu.html specific:

text
<main>
  <div class="container">
    <h1>Our Menu</h1>
    
    <!-- Tabs -->
    <div class="menu-tabs">
      <button class="tab-btn active" data-category="cookies">Cookies</button>
      <button class="tab-btn" data-category="cakes">Cakes</button>
      <button class="tab-btn" data-category="pies">Pies</button>
      <button class="tab-btn" data-category="breads">Breads</button>
    </div>

    <!-- Product grid (populated by product-loader.js) -->
    <div id="product-grid" class="grid grid-3"></div>
  </div>
</main>

<script src="/assets/js/product-loader.js"></script>
<script>
  // Tab switching logic
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.category;
      loadProductsByCategory(category); // Function from product-loader.js
    });
  });

  // Load cookies by default
  loadProductsByCategory('cookies');
</script>
Category pages (cookies.html, cakes.html, pies.html, breads.html):

text
<main>
  <div class="container">
    <h1>Cookies</h1> <!-- Change per page -->
    <div id="product-grid" class="grid grid-3"></div>
  </div>
</main>

<script src="/assets/js/product-loader.js"></script>
<script>
  loadProductsByCategory('cookies'); // Change per page: 'cakes', 'pies', 'breads'
</script>
order.html (multi-step form):

text
<main>
  <div class="container">
    <h1>Your Order</h1>

    <!-- Step indicator -->
    <div class="order-steps">
      <div class="step active" data-step="1">Cart</div>
      <div class="step" data-step="2">Fulfillment</div>
      <div class="step" data-step="3">Details</div>
      <div class="step" data-step="4">Payment</div>
    </div>

    <!-- Step 1: Cart Review -->
    <div id="step-1" class="order-step active">
      <div id="cart-items"></div>
      <div class="cart-total">
        <strong>Subtotal:</strong> <span id="cart-subtotal">$0.00</span>
      </div>
      <button class="btn btn-primary" onclick="goToStep(2)">Proceed to Fulfillment</button>
    </div>

    <!-- Step 2: Fulfillment -->
    <div id="step-2" class="order-step">
      <div class="form-group">
        <label class="form-label">Fulfillment Method</label>
        <label><input type="radio" name="fulfillment" value="pickup" checked> Pickup</label>
        <label><input type="radio" name="fulfillment" value="shipping" id="shipping-radio"> Shipping</label>
      </div>

      <div id="shipping-fields" class="hidden">
        <div class="form-group">
          <label class="form-label">ZIP Code</label>
          <input type="text" class="form-input" id="shipping-zip" placeholder="12345">
        </div>
        <div id="shipping-cost-display"></div>
      </div>

      <button class="btn btn-secondary" onclick="goToStep(1)">Back</button>
      <button class="btn btn-primary" onclick="goToStep(3)">Continue</button>
    </div>

    <!-- Step 3: Details -->
    <div id="step-3" class="order-step">
      <div class="form-group">
        <label class="form-label">Name</label>
        <input type="text" class="form-input" id="customer-name" required>
      </div>

      <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" class="form-input" id="customer-email" required>
      </div>

      <div class="form-group">
        <label class="form-label">Phone</label>
        <input type="tel" class="form-input" id="customer-phone" required>
      </div>

      <div class="form-group">
        <label class="form-label">Requested Pickup Date/Time</label>
        <input type="datetime-local" class="form-input" id="pickup-datetime" required>
      </div>

      <div class="form-group">
        <label class="form-label">Special Instructions</label>
        <textarea class="form-textarea" id="special-instructions" maxlength="500"></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">How did you hear about us?</label>
        <select class="form-select" id="referral-source">
          <option value="">Select...</option>
          <option value="social">Social Media</option>
          <option value="friend">Friend/Family</option>
          <option value="search">Search Engine</option>
          <option value="other">Other</option>
        </select>
      </div>

      <button class="btn btn-secondary" onclick="goToStep(2)">Back</button>
      <button class="btn btn-primary" onclick="goToStep(4)">Continue to Payment</button>
    </div>

    <!-- Step 4: Payment -->
    <div id="step-4" class="order-step">
      <div class="order-summary">
        <h3>Order Summary</h3>
        <div id="final-cart-review"></div>
        <div class="summary-line">
          <span>Subtotal:</span>
          <span id="final-subtotal">$0.00</span>
        </div>
        <div class="summary-line" id="shipping-line" class="hidden">
          <span>Shipping:</span>
          <span id="final-shipping">$0.00</span>
        </div>
        <div class="summary-line total">
          <strong>Total:</strong>
          <strong id="final-total">$0.00</strong>
        </div>
        <div class="summary-line deposit">
          <strong>50% Deposit Required:</strong>
          <strong id="deposit-amount">$0.00</strong>
        </div>
      </div>

      <div class="payment-instructions">
        <h3>Payment Methods</h3>
        <p><strong>Cash:</strong> Pay deposit at pickup</p>
        <p><strong>Cash App:</strong> $YourCashAppHandle</p>
        <p><strong>Venmo:</strong> @YourVenmoHandle</p>
        <p><strong>PayPal:</strong> Use button below</p>
        <div id="paypal-button-container"></div>
        <p><strong>Zelle:</strong> your-email@example.com</p>
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" id="deposit-agreement" required>
          I agree to pay the 50% deposit before pickup/shipping
        </label>
      </div>

      <button class="btn btn-secondary" onclick="goToStep(3)">Back</button>
      <button class="btn btn-primary" id="submit-order-btn" disabled>Submit Order</button>
    </div>
  </div>
</main>

<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID"></script>
<script src="/assets/js/order-logic.js"></script>
8.4 Build JavaScript Logic (Phase 4: Functionality)
cart.js (localStorage management):

text
// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  updateBadge();
  showToast(`Added ${product.name} to cart`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateBadge();
}

function updateQuantity(productId, newQuantity) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity = Math.max(1, newQuantity);
    saveCart();
    updateBadge();
  }
}

function getCart() {
  return cart;
}

function clearCart() {
  cart = [];
  saveCart();
  updateBadge();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'inline' : 'none';
  }
}

function calculateSubtotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Initialize badge on page load
updateBadge();
product-loader.js (render product cards):

text
function loadProductsByCategory(category) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  // Filter products by category
  const filteredProducts = productsData.filter(p => p.category === category);

  // Check if orders are paused
  if (siteConfig.ordersPaused) {
    grid.innerHTML = '<p class="orders-paused-message">Orders are currently paused. Check back soon!</p>';
    return;
  }

  // Render product cards
  grid.innerHTML = filteredProducts.map(product => {
    const isSoldOut = siteConfig.soldOutItems.includes(product.id);
    const shippingBadge = product.shipsNationwide ? '<span class="product-card__badge">Ships Nationwide</span>' : '';
    const soldOutOverlay = isSoldOut ? '<div class="sold-out-overlay">Sold Out</div>' : '';

    return `
      <div class="product-card" data-product-id="${product.id}">
        ${soldOutOverlay}
        <img src="${product.imageUrl}" alt="${product.name}" class="product
