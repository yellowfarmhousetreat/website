/**
 * Site Shell - Main Entry Point for All Pages
 * 
 * This module handles:
 * - Overlay navigation menu initialization
 * - Product card interactions
 * - Cart functionality
 * - Site-wide utilities
 * 
 * Built with Vite for proper bundling and tree-shaking.
 * Changes to product cards won't affect menu functionality.
 */

// Import third-party dependencies

// Import core functionality (ISOLATED - won't break from other changes)
import '../../assets/js/overlay-menu-simple.js';

// Import page-specific modules
import '../../assets/js/main.js';
import '../../assets/js/product-card-info.js';

// Import site configuration
import '../../site-config.js';

// Import cart and product loaders (if they exist)

(async () => {
  try {
    await import('../../assets/js/cart.js');
  } catch (e) {
    console.log('cart.js not found, skipping', e);
  }
})();

console.log('✓ Site shell loaded successfully');
