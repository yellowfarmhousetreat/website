# Yellow Farmhouse Treats — Comprehensive Rebuild Blueprint

Last updated: November 18, 2025Last updated: November 19, 2025

**CURRENT PHASE: v3-liberation CSS replacement**

This branch keeps all working HTML structure and JavaScript from the 36-hour build documented in `reference_document.md`. The ONLY change is consolidating styling into the custom dark-mode design in `assets/css/app.css`.195

---

## IMMEDIATE TASK FOR COPILOT: Dark Mode CSS Redesign

### Current State
- HTML structure is FINAL (keep all existing #wrapper, #intro, #header, #nav, #main, #footer)
- JavaScript is WORKING (cart.js, products.js, all features functional)
- Template CSS removed so `assets/css/app.css` is now the sole stylesheet
- Current app.css exists but needs complete visual overhaul

### Your Mission
Rewrite `assets/css/app.css` with a professional dark-mode bakery e-commerce design.

### Design Requirements

**Color Scheme (CRITICAL - Dark Mode):**
```css
:root {
  /* Background & Surfaces */
  --color-bg: #1a1a23;           /* Main dark background */
  --color-surface: #212931;       /* Cards, panels */
  --color-border: rgba(255, 255, 255, 0.15);
  
  /* Brand Colors */
  --color-accent: #e74c3c;        /* Primary yellow/gold accent */
  --color-highlight: #ffd86f;     /* Highlight yellow */
  
  /* Text */
  --color-text: #f5f5f5;          /* Primary text (light on dark) */
  --color-text-muted: #a0a0a0;    /* Secondary text */
  
  /* Interactive */
  --color-btn-primary: #e74c3c;   /* CTA buttons */
  --color-btn-hover: #c73529;     /* Button hover */
  --color-success: #27ae60;
  --color-danger: #e74c3c;
}
```

**The Yellow Farmhouse Brand:**
- Dark background (#1a1a23) creates CONTRAST for yellow/gold branding
- This is intentional - "Yellow Farmhouse" needs dark mode to make the yellow POP
- Think: premium dark e-commerce (like Apple) meets warm bakery

**Layout Requirements:**
1. **Existing HTML selectors to style:**
   - `#wrapper` - Main container
   - `#intro` - Hero section
   - `#header` - Site header
   - `#nav` - Main navigation
   - `.submenu-tabs` - Product category tabs
   - `#main` - Content area
   - `#footer` - Footer
   - `.products-grid` - Product card grid
   - `.product-card` - Individual product cards
   - `.order-form` - Order form on order.html
   - `.cart-badge` - Cart counter

2. **Product Cards:**
   - Dark surface background (--color-surface)
   - Subtle border or shadow
   - Product images should have slight border/glow to separate from dark bg
   - Hover effect with subtle lift
   - Yellow/gold accent on "Add to Cart" buttons

3. **Navigation:**
   - Dark header with yellow logo/branding
   - White/light text for nav links
   - Active tab indicator in yellow
   - Cart badge in yellow with count

4. **Forms & Buttons:**
   - Input fields: dark surface with light text
   - Primary buttons: Yellow (#e74c3c) with dark text
   - Secondary buttons: Dark with light border
   - Focus states with yellow outline

5. **Typography:**
   - Headers: Bold, light colored for contrast
   - Body: Light gray (#f5f5f5) for readability
   - System font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

6. **Responsive:**
   - Mobile-first
   - Breakpoints: 736px (tablet), 980px (desktop)
   - Touch-friendly button sizes (min 44px)

**What NOT to do:**
- Don't change HTML structure or IDs
- Don't modify JavaScript files
- Don't add new CSS files (only edit app.css)
- Don't use emojis in code
- Don't create light mode (dark only)

**Visual Inspiration:**
- Dark: Modern e-commerce dark themes
- Warm: Bakery product photography on dark backgrounds  
- Professional: Apple.com dark mode
- Contrast: Yellow/gold elements pop against #1a1a23

### Output
Provide the COMPLETE rewritten `assets/css/app.css` file with:
1. :root custom properties (colors, spacing, typography)
2. Base styles (html, body, typography)
3. Layout (wrapper, header, nav, main, footer)
4. Components (product cards, buttons, forms, cart)
5. Responsive media queries
6. Utility classes

Make it look like a premium dark-mode bakery e-commerce site where the Yellow Farmhouse branding stands out beautifully.
