# Copilot Instructions for Yellow Farmhouse Treats Website

## Project Overview

This is a static HTML/CSS/JS website for the Yellow Farmhouse Treats, built on the "Massively" template by HTML5 UP. The site is text-heavy, article-oriented, and features a large background image with parallax and scroll effects. The main user-facing feature is a multi-step order form for baked goods, with dynamic product selection, dietary options, and payment instructions.

## Key Files & Structure

- **HTML Pages:** `index.html`, `cart.html`, `order.html`, `menu.html`
- **Order Form Logic:** Embedded in `reference_document.md` (used for new template and order flow)
- **Assets:** 
  - CSS: `assets/css/main.css` (template styles), `noscript.css`
  - JS: `assets/js/main.js` (template logic), `reference_document.md` (order form logic)
  - SASS: `assets/sass/` (organized by base, components, layout, libs)
  - Images: `images/`
  - Fonts: `assets/webfonts/`
- **Menu/Product Data:** Hardcoded in JS within the order form (see `reference_document.md`)
- **README.txt:** Credits, template info, and licensing

## Architecture & Data Flow

- **Single-page, static architecture:** No backend, all logic is client-side.
- **Order Form:** 
  - Multi-step, dynamic product selection (menu items, sizes, flavors, dietary options)
  - Cart management and summary
  - Fulfillment options (pickup, shipping for specific items)
  - Payment method selection (Cash, Cash App, Venmo, PayPal, Zelle)
  - Form submission via Formspree (external service)
- **Menu Items:** Defined in JS as an array of objects with properties for name, emoji, sizes, prices, flavors, dietary notes, and shipping eligibility.
- **Shipping Logic:** Only enabled for "Pecan English Toffee"; shipping cost calculated by ZIP code.
- **Deposit Calculation:** 50% deposit required, balance due at pickup.

## Developer Workflows

- **No build step required:** All assets are static.
- **To update menu or order logic:** Edit the JS in `reference_document.md` (or migrate to a dedicated JS file for maintainability).
- **Styling:** Use SASS partials in `assets/sass/` and compile to CSS if making style changes.
- **Template JS:** `assets/js/main.js` handles template-specific features (parallax, nav panel, breakpoints).
- **Testing:** Manual browser testing; no automated tests present.

## Project-Specific Patterns

- **Menu and product logic is centralized in a JS array.** Any changes to products, prices, or dietary options should be made here.
- **Shipping is only available for specific products.** UI and logic enforce this.
- **Payment instructions are dynamically shown based on selection.**
- **Form validation is handled in JS before submission.**
- **Responsive design:** Uses CSS grid and media queries for mobile support.

## Integration Points

- **Formspree:** Handles order form submissions.
- **SnapWidget:** Embeds Instagram feed.
- **Font Awesome:** For icons.
- **Google Fonts:** For typography.

## Example: Adding a New Product

1. Update the `menuItems` array in the JS (see `reference_document.md`).
2. Add any new dietary notes or shipping rules as needed.
3. Ensure the UI updates by re-initializing the product grid.

## Security

- No backend code; security concerns are limited to client-side validation and safe use of external services.
- Follow Snyk security scanning for any new JS code.

---

**Feedback Request:**  
Please review and let me know if any sections are unclear, missing, or need more detail (e.g., deployment, SASS workflow, asset management, etc.). I can iterate further based on your feedback.
