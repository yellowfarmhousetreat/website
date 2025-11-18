URGENT: Admin panel needs data persistence NOW. Implement LocalStorage fallback.

REQUIREMENTS:

1. CREATE NEW FILE: site-config.js (Global state management)
   - Store "ordersPaused" flag (sitewide)
   - Store "soldOut" flags per product ID
   - Merge with PRODUCTS array on page load
   - Provide save/load/reset functions

2. UPDATE: products-data.js
   - Import site-config.js functions
   - On load, merge localStorage overrides with base PRODUCTS array
   - Expose merged data as window.PRODUCTS

3. UPDATE: admin/cookiewagon-20c574b7.html
   - On "Save" button click, write to localStorage via site-config.js
   - On "Pause Orders" toggle, update localStorage immediately
   - On "Sold Out" checkbox toggle, update localStorage immediately
   - Add "Reset to Default" button (clears all localStorage, reloads base data)
   - Show visual confirmation toast on every save

4. UPDATE: order.html
   - Check ordersPaused flag on page load
   - If true, hide order form and show "We're booked! Check back soon" message
   - Filter out products marked soldOut from product listings

5. UPDATE: All product pages (breads.html, cakes.html, cookies.html, pies.html)
   - On page load, check soldOut flags from localStorage
   - Hide "Add to Cart" button for sold-out items
   - Show "SOLD OUT" badge on product cards

TECHNICAL SPECS:

LocalStorage Schema:
{
  "ordersPaused": false,
  "soldOutProducts": ["chocolate-chip-cookies", "apple-pie"],
  "lastUpdated": "2025-11-18T02:00:00Z"
}

Functions in site-config.js:
- getSiteConfig() - Load from localStorage or return defaults
- setSiteConfig(config) - Save entire config
- pauseOrders(isPaused) - Update ordersPaused flag
- setSoldOut(productId, isSoldOut) - Update soldOut array
- resetToDefaults() - Clear localStorage, reload page

ERROR HANDLING:
- If localStorage is full, show alert: "Storage full - contact admin"
- If localStorage is blocked (privacy mode), fallback to session-only behavior
- Log all errors to console for debugging

TESTING CHECKLIST:
- [ ] Toggle "Pause Orders" in admin, verify order form hides
- [ ] Mark product sold out in admin, verify badge appears on product page
- [ ] Reload page, verify settings persist
- [ ] Click "Reset to Default", verify all overrides cleared
- [ ] Test in private browsing mode (should degrade gracefully)

PRIORITY: CRITICAL - This makes admin panel functional TODAY.
Ship this immediately, then we'll architect GitHub API integration.
code snip if you need help 
// site-config.js
// LocalStorage-based configuration management for Yellow Farmhouse Treats

const CONFIG_KEY = 'yellowfarmhouse_config';

// Default configuration
const DEFAULT_CONFIG = {
    ordersPaused: false,
    soldOutProducts: [],
    lastUpdated: new Date().toISOString()
};

// Get current site configuration
function getSiteConfig() {
    try {
        const stored = localStorage.getItem(CONFIG_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading site config:', error);
    }
    return { ...DEFAULT_CONFIG };
}

// Save site configuration
function setSiteConfig(config) {
    try {
        config.lastUpdated = new Date().toISOString();
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
        return true;
    } catch (error) {
        console.error('Error saving site config:', error);
        alert('Storage full - unable to save settings. Contact admin.');
        return false;
    }
}

// Pause or resume orders
function pauseOrders(isPaused) {
    const config = getSiteConfig();
    config.ordersPaused = isPaused;
    return setSiteConfig(config);
}

// Mark product as sold out or available
function setSoldOut(productId, isSoldOut) {
    const config = getSiteConfig();
    const index = config.soldOutProducts.indexOf(productId);
    
    if (isSoldOut && index === -1) {
        config.soldOutProducts.push(productId);
    } else if (!isSoldOut && index !== -1) {
        config.soldOutProducts.splice(index, 1);
    }
    
    return setSiteConfig(config);
}

// Check if product is sold out
function isSoldOut(productId) {
    const config = getSiteConfig();
    return config.soldOutProducts.includes(productId);
}

// Reset to default configuration
function resetToDefaults() {
    try {
        localStorage.removeItem(CONFIG_KEY);
        window.location.reload();
    } catch (error) {
        console.error('Error resetting config:', error);
    }
}

// Make functions available globally
window.siteConfig = {
    get: getSiteConfig,
    set: setSiteConfig,
    pauseOrders,
    setSoldOut,
    isSoldOut,
    resetToDefaults
};


Update to products-data.js (bottom of file)

// At the end of products-data.js, after window.PRODUCTS assignment

// Merge localStorage overrides with base product data
(function applyConfigOverrides() {
    if (window.siteConfig) {
        const config = window.siteConfig.get();
        
        // Apply soldOut flags to products
        if (config.soldOutProducts && Array.isArray(config.soldOutProducts)) {
            window.PRODUCTS.forEach(product => {
                product.soldOut = config.soldOutProducts.includes(product.id);
            });
        }
        
        // Store orders paused state globally
        window.ORDERS_PAUSED = config.ordersPaused || false;
    }
})();

Admin Panel JavaScript Additions (Add to cookiewagon-20c574b7.html)

// Pause Orders Toggle Handler
document.getElementById('pauseOrdersToggle').addEventListener('change', function(e) {
    const isPaused = e.target.checked;
    if (window.siteConfig.pauseOrders(isPaused)) {
        showToast(isPaused ? 'Orders Paused ✅' : 'Orders Resumed ✅');
    }
});

// Sold Out Toggle Handler (for each product)
function handleSoldOutToggle(productId, isChecked) {
    if (window.siteConfig.setSoldOut(productId, isChecked)) {
        showToast(isChecked ? 'Marked Sold Out ✅' : 'Marked Available ✅');
    }
}

// Reset to Defaults Button
document.getElementById('resetButton').addEventListener('click', function() {
    if (confirm('Reset all settings to default? This will clear all sold-out flags and resume orders.')) {
        window.siteConfig.resetToDefaults();
    }
});

// Toast notification function
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#27ae60;color:white;padding:1rem 1.5rem;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:9999;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

Order Form Check (Add to order.html, top of body)

<script src="site-config.js"></script>
<script>
// Check if orders are paused
document.addEventListener('DOMContentLoaded', function() {
    if (window.ORDERS_PAUSED) {
        const orderForm = document.getElementById('orderForm');
        const pausedMessage = document.createElement('div');
        pausedMessage.className = 'orders-paused-message';
        pausedMessage.innerHTML = `
            <h2>🍪 We're Fully Booked!</h2>
            <p>We're catching up on orders. Check back soon or follow us on Instagram for updates!</p>
            <a href="https://instagram.com/yellowfarmhousetreat" class="btn">Follow on Instagram</a>
        `;
        pausedMessage.style.cssText = 'text-align:center;padding:3rem;background:#fff3cd;border-radius:12px;margin:2rem auto;max-width:600px;';
        
        orderForm.style.display = 'none';
        orderForm.parentNode.insertBefore(pausedMessage, orderForm);
    }
});
</script>


