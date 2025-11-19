# Yellow Farmhouse Treats — Comprehensive Rebuild Blueprint

Last updated: November 18, 2025

This single source of truth consolidates every instruction, requirement, and functional spec that currently lives across `reference_document.md`, `ARCHITECTURE_BLUEPRINT.md`, `ADMIN_REQUIREMENTS.md`, `FRAGILITY-ANALYSIS.md`, `CSS-ARCHITECTURE.md`, the security docs, and supporting notes. Use it to rebuild the site **from scratch without inheriting the Massively template**, while keeping every working feature and guardrail that matters.

---

## 1. Mission & Outcomes

- **Business goal:** Showcase Yellow Farmhouse Treats, capture custom orders, and let the baker manage menu data without touching multiple files.
- **Experience pillars:** fast mobile-first browsing, trustworthy ordering, clear dietary/allergen data, and a maintainable admin panel for a single owner.
- **Rebuild objective:** Static HTML/CSS/JS stack that replicates current capabilities (menu browsing, cart, order form, internal admin) but ditches template cruft.

---

## 2. Non-Negotiable Rules

1. **No emojis anywhere in code** (per `intructions_copilot.md`).
2. **PayPal is the only payment processor**; other methods (Cash, Cash App, Venmo, PayPal, Zelle) remain informational instructions for the deposit collection flow in the order form (`reference_document.md`).
3. **Mobile-first layouts** with primary interactions placed near the top on phones.
4. **Separate HTML entry points per category**: `index.html`, `menu.html`, `cookies.html`, `cakes.html`, `pies.html`, `breads.html`, plus `order.html` and the real admin file.
5. **Centralized product data** (current `products-data.js`) feeding every storefront surface.
6. **Client-only architecture**: no backend available; ensure all persistence lives in the browser (localStorage) or Formspree/PayPal.
7. **Security transparency:** admin tool is for trusted local use only; document risks prominently (`SECURITY_ANALYSIS.md`, `README-SECURITY.md`).

---

## 3. Information Architecture

```text
PUBLIC
├── index.html (hero, Instagram, CTA buttons)
├── menu.html (tabbed browsing + add-to-cart hooks)
├── cookies.html / cakes.html / pies.html / breads.html (maintenance-friendly product lists)
└── order.html (cart review + fulfillment + payment instructions)

INTERNAL
└── admin/real-admin.html (new filename TBD, single in-browser tool)
    ├── Product CRUD tied to products-data.js
    ├── Orders paused toggle & sold-out flags (site-config.js)
    └── Export/download helpers
```

- Remove the honeytrap `/admin/index.html` in the rebuilt stack; focus on the real admin experience while keeping loud warnings about client-side “security”.

---

## 4. User Journeys & Flows

### Browsing → Cart → Order (from `reference_document.md`)

1. **Browse** via `menu.html` tabs or direct category pages; each product card exposes sizes, tiers, dietary toggles (GF/SF/Vegan), allergens, and shipping eligibility badges.
2. **Add to cart** triggers localStorage persistence (`cart.js`) and updates the site-wide badge.
3. **Cart/Order (`order.html`)** multi-step form:
   - Step 1: Review items; edit quantity or remove lines.
   - Step 2: Pickup vs shipping (shipping **only** for Pecan English Toffee, shipping cost calculated from ZIP).
   - Step 3: Requested pickup date/time, special notes, reference question (“How did you hear about us?”).
   - Step 4: Payment instructions (Cash, Cash App, Venmo, PayPal, Zelle) plus **mandatory 50% deposit** summary; deposit total mirrors 50% of cart subtotal.
   - Step 5: Submit via Formspree; storing a PDF/email is out of scope.
4. **Confirmation**: Show deposit/payment reminder, next steps, and social follow CTA.

### Admin Flow (from `ADMIN_REQUIREMENTS.md` + `New_instructions_temp.md`)

1. Login with a rotating password (client-side only). Post-rebuild, keep the simplified password-change dialog but plan to store the credential in one config module.
2. Load `products-data.js` into editable cards: name, description, sizes with tier pricing, allergens checkboxes, dietary toggles, shipping toggle.
3. Manage ancillary state:
   - `ordersPaused` (sitewide) — hides `order.html` form and shows a “we’re booked” banner.
   - `soldOutProducts[]` — per-product flag that removes add-to-cart buttons and adds “Sold Out” chips across all storefront pages.
4. Export/download updated data file, with a fallback to manual copy/paste.

---

## 5. Page-Level Wireframes (Text Specs)

### Home (`index.html`)

- **Hero:** Logo/wordmark, single CTA buttons (“View Menu”, “Start an Order”), short tagline.
- **Instagram block:** SnapWidget iframe (per current embed ID) plus “Follow us” CTA.
- **Quick menu tiles:** 5 buttons linking to anchors within `menu.html`.
- **Contact footer:** Address, phone, email, PayPal note, social icons.

### Unified Menu (`menu.html`)

- **Sticky tab nav** (Cookies, Cakes, Pies & Crisps, Breads & More, All Items) with keyboard focus styling.
- **Cookie tier buttons** (Simple/Fancy/Complex) that filter/annotate cards.
- **Product cards** display: name, emoji-free icon fallback, description, allergens, price grid (size vs price), dietary toggles, and “Add to cart”.
- **Cart badge** pinned in the nav linking to `order.html`.

### Category Maintenance Pages (cookies/cakes/pies/breads)

- Simplified grids to let the baker edit markup quickly; each card mimics the same product card component but can include inline admin hints.
- Reuse `product-loader.js` to avoid duplicating data.

### Order (`order.html`)

- **Stepper header** (Items → Details → Fulfillment → Payment → Submit) with progress indicator.
- **Order summary** table plus deposit breakdown and shipping estimate row.
- **Fulfillment module:** radio buttons (Pickup default, Shipping disabled unless toffee present). Shipping accordion contains address fields + live cost preview.
- **Payment instructions** show context-specific messaging per selection (Cash, Cash App, Venmo, PayPal, Zelle). Remember: PayPal executes payment; others detail offline deposit instructions.
- **Form submission** uses Formspree action, includes hidden cart payload JSON, deposit amount, and shipping cost.

### Admin (`admin/real-admin.html`)

- **Header:** brand + buttons for “Change Password”, “Pause Orders”, “Reset Overrides”, “Download Data”, “Logout”.
- **Status bar:** shows login state, orders paused, last publish timestamp.
- **Product accordion/grid:** matches spec in `ADMIN_REQUIREMENTS.md` (ingredients textarea, allergen checkboxes, per-size pricing rows, shipping toggle, dietary surcharges, iOS-friendly photo upload buttons).
- **Toast notifications** confirm saves and config updates.

---

## 6. Data & State Model

### Product Schema (from multiple docs)

```js
{
  id: string,            // slug referenced everywhere
  name: string,
  category: 'cookies' | 'cakes' | 'pies' | 'breads',
  description: string,
  ingredients: string,
  allergens: string[],   // wheat, eggs, milk, nuts, peanuts, soy
  image: string,
  sizes: [ { label, price, tier } ],
  dietary: { glutenFree: bool, sugarFree: bool, vegan: bool },
  shippable: bool,        // only true for Pecan English Toffee today
  featured: bool,
  soldOut: bool,
  notes: string
}
```


- Keep `products-data.js` as the single source; `product-loader.js` hydrates storefront cards.

### Cart State (`cart.js`)

- Stored in `localStorage.cart` as array of line items `{productId, size, price, quantity, dietaryModifiers, instructions}`.
- Utility functions: `addToCart`, `updateLine`, `removeLine`, `clearCart`, `getCart`, `calculateTotals`, `updateCartBadge`.

### Site Config (`site-config.js` from `New_instructions_temp.md`)

- `ordersPaused: boolean`
- `soldOutProducts: string[]`
- `lastUpdated: ISO8601`
- Provide helpers: `get`, `set`, `pauseOrders`, `setSoldOut`, `isSoldOut`, `resetToDefaults` with graceful failure alerts when storage is blocked/full.

### Form Submission Payload

- Multi-step order form compiles a JSON summary (items, deposit, fulfillment, payment method, contact info) into hidden inputs for Formspree.

---

## 7. Security & Operational Stance

- **Static only**: no server ensures all “authentication” is advisory. Keep prominent warnings in admin per `SECURITY_ANALYSIS.md` and `README-SECURITY.md`.
- **Password handling:** client-side SHA-256 hash with salt `salt2024` (per `ARCHITECTURE_BLUEPRINT.md`) plus jitter and a 3-attempt lockout. Provide an in-app password change that rewrites the stored hash in a single JS config module.
- **Honeytrap removal:** new build can omit `/admin/index.html`, but document that previous behavior existed. If you retain it, label clearly as decoy.
- **Security tooling:** rely on CodeQL workflows and manual reviews documented in the security files.
- **Client validation:** sanitize all user-entered strings (cart notes, dietary instructions) before rendering to prevent DOM XSS (matches previous fixes).

---

## 8. Visual System & CSS Guardrails

Derived from `CSS-ARCHITECTURE.md` and `FRAGILITY-ANALYSIS.md` but re-expressed for a fresh stack:

- **Tokens:**
  - Colors: Primary gold `#d4af37`, dark gold `#8b7220`, accent red `#c41e3a`, secondary navy `#2c5aa0`, success `#27ae60`, danger `#e74c3c`, text `#3d3d3d`, text-light `#666`, border `#d4c5b9`, background `#fffef8`.
  - Typography: Use system font stack (`-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, sans-serif) with Quicksand for headings if desired.
- **Spacing:** rely on REM scale (0.5, 1, 1.5, 2, 3). Avoid `calc()`-heavy widths; prefer flex/grid with explicit max-width containers.
- **Breakpoints:** 736px (mobile/tablet), 980px (tablet/desktop), 1280px (wide). Test at 320, 375, 480, 736, 980, 1280.
- **Z-index hierarchy:** base 1, nav 120, subnav 110, modals 300, toast 400.
- **Components to preserve:** `.safe-container`, `.safe-products-grid`, `.safe-btn-*`, `.safe-form-row`, `.toast-notification`, `.orders-paused-message`.
- **No inline styles** except dynamic JS toggles. Keep overrides in a single `app.css` successor.

---

## 9. Integrations

- **Instagram:** SnapWidget embed script + iframe. Keep ID from reference doc and include a fallback CTA if script fails.
- **Formspree:** existing endpoint (see `order.html`) for order submissions. Include spam honeypot input.
- **PayPal:** use standard PayPal checkout button; deposit instructions still rely on manual transfers for Cash App/Venmo/Zelle.

---

## 10. Build & Migration Plan

1. **Scaffold clean directories**: `/public` (HTML), `/assets/css` (tokens + components), `/assets/js` (cart, products loader, order logic, site-config, admin modules), `/images`.
2. **Port data**: migrate contents of `products-data.js` exactly; ensure IDs stay stable for orders and sold-out flags.
3. **Reimplement shared JS**: rewrite `cart.js`, `product-loader.js`, `order.js`, `admin.js`, `site-config.js` without template bindings but keeping logic from `reference_document.md` and admin requirements.
4. **Compose CSS**: start with a minimal reset + tokens; port only the needed layout rules from `assets/css/app.css`, referencing fragility guide to avoid template-specific selectors.
5. **Recreate HTML**: follow the wireframes above; reuse copy, contact info, shipping note, deposit language from the reference doc.
6. **Security warnings**: embed clear alerts inside admin and README.
7. **Testing checklist** (from instruction docs):
   - Navigation paths, cart persistence, diet modifiers pricing, shipping-only gating, deposit math, payment instructions, Formspree submission, Pause Orders + Sold Out propagation, responsive layouts, cross-browser sanity.
8. **Launch**: once new build passes checklist, delete the Massively template assets and document the new structure.

---

## 11. Appendices & Source Mapping

- Specs sourced from `reference_document.md` (order form markup/logic, product UX, deposit/shipping/payment rules).
- Admin behaviors from `ADMIN_REQUIREMENTS.md` and `New_instructions_temp.md`.
- Architecture/security posture from `ARCHITECTURE_BLUEPRINT.md`, `SECURITY_IMPLEMENTATION.md`, `README-SECURITY.md`, `SECURITY_ANALYSIS.md`, `SECURITY.md`.
- Styling/friction notes from `CSS-ARCHITECTURE.md`, `FRAGILITY-ANALYSIS.md`, `assets/css/app.css`.
- Process requirements from `.github/copilot-instructions.md`.

This document replaces the scattered markdown instructions so you can confidently wipe the template-driven codebase and rebuild a lean version that still respects every original requirement.
