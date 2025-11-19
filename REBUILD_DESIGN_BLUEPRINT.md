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

