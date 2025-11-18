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
        if (error.name === 'QuotaExceededError') {
            alert('Storage full - unable to save settings. Contact admin.');
        } else {
            console.warn('LocalStorage unavailable - running in session-only mode');
        }
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

// Check if orders are paused
function areOrdersPaused() {
    const config = getSiteConfig();
    return config.ordersPaused || false;
}

// Reset to default configuration
function resetToDefaults() {
    try {
        localStorage.removeItem(CONFIG_KEY);
        window.location.reload();
    } catch (error) {
        console.error('Error resetting config:', error);
        // Fallback: reload anyway
        window.location.reload();
    }
}

// Make functions available globally
window.siteConfig = {
    get: getSiteConfig,
    set: setSiteConfig,
    pauseOrders,
    setSoldOut,
    isSoldOut,
    areOrdersPaused,
    resetToDefaults
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Ensure config is loaded
    getSiteConfig();
});