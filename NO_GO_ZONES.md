# 🚫 NO-GO ZONES & CRITICAL ARCHITECTURE

**READ THIS BEFORE EDITING ANY FILES.**
This project uses a specific "Single Page App" (SPA) hybrid architecture with Vite. Violating these rules will break the site, the admin panel, or the build process.

## 1. 🛑 DO NOT Create New HTML Pages for Products
*   **The Rule:** Never create files like `cookies.html`, `pies.html`, or `chocolate-chip.html`.
*   **The Reason:** This is a dynamic site. All products are rendered into `menu.html` (or `index.html`) using JavaScript.
*   **How it works:** `render-products.js` reads `products-data.json` and generates the HTML cards on the fly.

## 2. 🔐 The Admin Panel (Secure Kitchen)
*   **Location:** `website/secure-kitchen-x99/`
*   **Security Model:** Security by Obscurity & LocalStorage.
    *   **DO NOT** link to this folder from the main navigation.
    *   **DO NOT** move this folder to a public/obvious name like `/admin`.
    *   **DO NOT** alter the `kitchen-logic.js` authentication check (it looks for a specific LocalStorage key).
*   **Purpose:** This is a client-side tool for the owner to update `products-data.json` and `theme.json`. It does not have a backend database.

## 3. 📄 Data Files (The "Database")
### `website/public/data/products-data.json`
*   **Role:** The source of truth for all product info (Price, Ingredients, Stock Status).
*   **Editing:**
    *   **DO NOT** manually edit the structure (keys like `id`, `tier`, `images`).
    *   **Images:** Filenames in `images.primary` MUST match files in `website/public/images/products/`.
    *   **IDs:** Product IDs must be unique and URL-safe (kebab-case).

### `website/public/data/theme.json`
*   **Role:** Controls global site content (Phone, Email, Address) and Color Palette.
*   **Usage:** Used by `theme-loader.js` to inject values into the DOM at runtime.
*   **Editing:** Update this file to change the phone number or brand colors across the entire site instantly.

## 4. ⚙️ Configuration Files
### `website/site-config.js`
*   **Role:** Manages **runtime state** (Orders Paused, Sold Out items) using the browser's `localStorage`.
*   **Critical:** This file allows the owner to "Pause Orders" immediately without a code deployment.
*   **Do Not:** Do not hardcode "Sold Out" states in HTML. Use this config system.

## 5. 🖼️ Image Paths (Vite)
*   **Source:** Place all images in `website/public/images/`.
*   **Code Reference:** Refer to them as `/images/filename.jpg`.
    *   ❌ `../public/images/file.jpg`
    *   ❌ `website/images/file.jpg`
    *   ✅ `/images/file.jpg`

---
*Last Updated: November 20, 2025*
