/**
 * SECURE ADMIN INTERFACE FOR YELLOW FARMHOUSE TREATS
 * Merged Logic: "Throughput" Data Loading + Site Config Persistence
 */

const DEFAULT_DIETARY_PRICING = {
    glutenFree: 3,
    sugarFree: 3
};

const DEFAULT_PAYMENT_METHODS = {
    cash: { name: 'Cash', instructions: 'Payment due at pickup' },
    cashapp: { name: 'Cash App', instructions: 'Send payment to $YellowFarmhouse' },
    venmo: { name: 'Venmo', instructions: 'Send payment to @YellowFarmhouse' },
    paypal: { name: 'PayPal', instructions: 'Send payment to yellowfarmhouse@email.com' },
    zelle: { name: 'Zelle', instructions: 'Send payment to (555) 123-4567' }
};

const DEFAULT_SHIPPING_ZONES = {
    '12345': 5.00,
    '12346': 5.00,
    '12347': 7.50,
    '12348': 7.50,
    '12349': 10.00
};

class AdminInterface {
    constructor() {
        this.isAuthenticated = false;
        this.products = [];
        this.backupData = null;
        this.dietaryPricing = { ...DEFAULT_DIETARY_PRICING };
        this.paymentMethods = { ...DEFAULT_PAYMENT_METHODS };
        this.shippingZones = { ...DEFAULT_SHIPPING_ZONES };
        this.catalogVersion = '';
        this.soldOutProducts = [];
        this.pauseOrders = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthentication();
        this.loadAdminState(); // Load "Pause Orders" state
    }

    // --- Site-wide state persistence using window.siteConfig ---
    saveAdminState() {
        try {
            if (window.siteConfig) {
                window.siteConfig.pauseOrders(this.pauseOrders);
                this.products.forEach(product => {
                    window.siteConfig.setSoldOut(product.id, product.soldOut || false);
                });
                this.showMessage('✅ Admin state saved site-wide', 'success');
                console.log('Admin state saved via siteConfig system');
            } else {
                console.warn('siteConfig system not available');
            }
        } catch (error) {
            this.showMessage('❌ Failed to save admin state', 'error');
            console.error('Site config save error:', error);
        }
    }

    loadAdminState() {
        try {
            if (window.siteConfig) {
                const config = window.siteConfig.get();
                this.pauseOrders = config.ordersPaused;
                // Note: Product sold-out states are applied after products load
                if (config.lastUpdated) {
                    console.log(`📋 Admin state loaded (last updated: ${config.lastUpdated})`);
                }
            }
        } catch (error) {
            console.error('Site config load error:', error);
        }
    }

    // --- Order pause toggle and UI update ---
    toggleOrderPause() {
        this.pauseOrders = !this.pauseOrders;
        this.updateOrderStatusUI();
        this.saveAdminState();
        this.showMessage(`Orders ${this.pauseOrders ? 'paused' : 'resumed'}`, this.pauseOrders ? 'warning' : 'success');
    }

    updateOrderStatusUI() {
        const statusEl = document.getElementById('pause-status');
        if (!statusEl) return;
        const statusText = statusEl.querySelector('.status-text');
        if (this.pauseOrders) {
            statusEl.className = 'status-indicator paused';
            if (statusText) statusText.textContent = 'Paused';
        } else {
            statusEl.className = 'status-indicator active';
            if (statusText) statusText.textContent = 'Active';
        }
    }

    renderOrderPauseToggle() {
        const container = document.getElementById('order-pause-toggle');
        if (!container) return;

        container.innerHTML = `
        <div class="order-status-control">
          <div class="status-indicator ${this.pauseOrders ? 'paused' : 'active'}" id="pause-status">
            Status: <span class="status-text">${this.pauseOrders ? 'Paused' : 'Active'}</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" ${this.pauseOrders ? 'checked' : ''} onchange="adminInterface.toggleOrderPause()">
            <span class="toggle-slider"></span>
            <span class="toggle-label">Pause All Orders</span>
          </label>
        </div>
      `;
    }

    // --- Authentication (Simplified) ---
    checkAuthentication() {
        if (sessionStorage.getItem('admin_auth') === 'active') {
            this.isAuthenticated = true;
            this.showAdminPanel();
        } else {
            this.showLoginForm();
        }
    }

    showLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.style.display = 'flex';
            // Add security disclaimer if missing
            if (!loginForm.querySelector('.security-disclaimer')) {
                const disclaimer = document.createElement('div');
                disclaimer.className = 'security-disclaimer';
                disclaimer.style.marginRight = '2rem';
                disclaimer.innerHTML = `
            <div style="background: rgba(255, 193, 7, 0.15); border: 2px solid rgba(255, 193, 7, 0.4); border-radius: 8px; padding: 1rem; color: #ffffff; font-size: 0.85rem; line-height: 1.4; max-width: 300px;">
              <strong>SECURITY NOTICE:</strong><br>This admin interface provides <strong>NO REAL SECURITY</strong>.<br><br><strong>For production:</strong> Edit data/products-data.json directly.
            </div>`;
                loginForm.insertBefore(disclaimer, loginForm.firstChild);
            }
        }
    }

    handleLogin() {
        sessionStorage.setItem('admin_auth', 'active');
        this.isAuthenticated = true;
        this.showAdminPanel();
        this.showMessage('Access granted.', 'success');
    }

    logout() {
        sessionStorage.removeItem('admin_auth');
        this.isAuthenticated = false;
        this.showLoginForm();
        document.getElementById('admin-panel').classList.add('hidden');
        this.showMessage('Logged out successfully', 'info');
    }

    showAdminPanel() {
        const loginForm = document.getElementById('login-form');
        const adminPanel = document.getElementById('admin-panel');

        if (loginForm) loginForm.style.display = 'none';
        if (adminPanel) {
            adminPanel.style.display = 'block';
            adminPanel.classList.remove('hidden');
        }

        this.loadProducts().then(() => {
            this.renderProductList();
            this.renderOrderPauseToggle();
        }).catch((err) => {
            console.error("Product load failed", err);
            this.renderProductList();
            this.renderOrderPauseToggle();
        });
    }

    // --- Data Loading (The "Throughput" Design) ---
    async loadProducts() {
        // Strategy: Try ProductLoader first (preferred), then fallback to manual fetch
        if (typeof ProductLoader !== 'undefined') {
            try {
                console.log("Attempting to load via ProductLoader...");
                // Try the Vite path first
                const loader = new ProductLoader({ dataUrl: '../data/products-data.json' });
                const payload = await loader.loadData(true);
                
                this.processLoadedData(payload);
                this.showMessage(`Loaded ${this.products.length} products via shared loader`, 'success');
                return;
            } catch (e) {
                console.warn("ProductLoader failed with default path, trying fallback...", e);
            }
        }

        // Fallback to manual loading with multiple path attempts
        try {
            await this.loadProductsFromJson();
            this.showMessage(`Loaded ${this.products.length} products via fallback`, 'success');
        } catch (error) {
            console.error('All product load attempts failed:', error);
            this.showMessage('Error loading products. Check console.', 'error');
            this.createSampleProduct();
            this.renderProductList();
        }
    }

    processLoadedData(payload) {
        this.products = payload.products.map(p => this.convertToAdminFormat(p));
        this.dietaryPricing = payload.dietaryPricing || { glutenFree: 3, sugarFree: 3 };
        this.paymentMethods = payload.paymentMethods || {};
        this.shippingZones = payload.shippingZones || {};
        this.catalogVersion = payload.version || '';

        // Apply saved sold-out states from siteConfig
        if (window.siteConfig) {
            const config = window.siteConfig.get();
            if (config.soldOutProducts) {
                this.products.forEach(p => {
                    if (config.soldOutProducts.includes(p.id)) {
                        p.soldOut = true;
                    }
                });
            }
        }
    }

    async loadProductsFromJson() {
        // Comprehensive list of potential paths
        const paths = [
            '/data/products-data.json',           // Absolute (Vite root)
            '../data/products-data.json',         // Relative to admin (Vite)
            '../public/data/products-data.json',  // Relative to admin (File system)
            'products-data.json'                  // Same dir (Fallback)
        ];

        for (const path of paths) {
            try {
                console.log(`Trying path: ${path}`);
                const resp = await fetch(path + '?t=' + Date.now());
                if (resp.ok) {
                    const payload = await resp.json();
                    this.processLoadedData(payload);
                    return;
                }
            } catch (e) { 
                console.warn(`Failed to load from ${path}`, e); 
            }
        }
        throw new Error('Could not load product data from any known path.');
    }

    createSampleProduct() {
        this.products = [{
            id: 'sample-cookies',
            name: 'Sample Cookies',
            price: 20,
            unit: 'dozen',
            category: 'cookies',
            description: 'Sample product',
            ingredients: 'Flour, Sugar',
            allergens: ['wheat'],
            image: 'sample.jpg',
            originalSizes: [{ name: 'dozen', price: 20 }]
        }];
    }

    // --- Data Conversion & Management ---
    convertToAdminFormat(product) {
        const basePrice = product.sizes && product.sizes.length > 0 ? product.sizes[0].price : 20;
        const baseUnit = this.extractUnitFromSize(product.sizes && product.sizes[0] ? product.sizes[0].name : 'dozen');
        const originalSizes = product.sizes ? JSON.parse(JSON.stringify(product.sizes)) : [{ name: 'dozen', price: basePrice }];

        return {
            id: product.id,
            name: product.name,
            price: basePrice,
            unit: baseUnit,
            category: product.category,
            description: product.description || '',
            ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : (product.ingredients || ''),
            allergens: product.allergens?.contains || product.allergens || [],
            image: product.images?.primary || product.image || '',
            glutenFree: product.dietary?.glutenFree || false,
            sugarFree: product.dietary?.sugarFree || false,
            glutenFreePrice: product.dietaryPricing?.glutenFree || 3,
            sugarFreePrice: product.dietaryPricing?.sugarFree || 3,
            shippingEligible: product.shippable || false,
            baseShippingCost: product.shipping?.baseShippingCost || 5,
            perPoundRate: product.shipping?.perPoundRate || 2,
            featured: product.featured || false,
            tier: product.tier || 'Regular',
            emoji: product.emoji || '',
            soldOut: product.soldOut || false,
            originalSizes: originalSizes
        };
    }

    convertFromAdminFormat(product) {
        let sizes = [];
        if (product.originalSizes && product.originalSizes.length > 0) {
            sizes = [...product.originalSizes];
            if (sizes[0]) sizes[0].price = product.price;
        } else {
            sizes = this.generateDefaultSizes(product);
        }

        const ingredientsArray = typeof product.ingredients === 'string' 
            ? product.ingredients.split(',').map(i => i.trim()).filter(i => i.length > 0)
            : product.ingredients;

        return {
            id: product.id,
            name: product.name,
            ...(product.tier && { tier: product.tier }),
            category: product.category,
            description: product.description,
            ingredients: ingredientsArray,
            allergens: {
                contains: Array.isArray(product.allergens) ? product.allergens : [],
                mayContain: ["Tree Nuts", "Peanuts", "Soy"],
                facilityStatement: "Produced in a facility that also processes tree nuts, peanuts, and soy."
            },
            ...(product.emoji && { emoji: product.emoji }),
            images: {
                primary: product.image,
                gallery: [product.image],
                thumbnail: product.image ? product.image.replace(/(\.[\w\d_-]+)$/i, '_thumb$1') : '',
                alt: `${product.name} - freshly baked`
            },
            sizes: sizes,
            dietary: {
                glutenFree: product.glutenFree || false,
                sugarFree: product.sugarFree || false,
                vegan: false
            },
            shippable: product.shippingEligible || false,
            soldOut: product.soldOut || false,
            featured: product.featured || false,
            tags: [product.category, ...(product.featured ? ['specialty'] : [])],
            ...(product.shippingEligible && {
                shipping: {
                    baseShippingCost: product.baseShippingCost || 5,
                    perPoundRate: product.perPoundRate || 2
                }
            })
        };
    }

    extractUnitFromSize(sizeName) {
        if (!sizeName) return 'dozen';
        const lower = sizeName.toLowerCase();
        if (lower.includes('dozen')) return 'dozen';
        if (lower.includes('loaf')) return 'loaf';
        if (lower.includes('pie')) return 'each';
        return 'each';
    }

    generateDefaultSizes(product) {
        const basePrice = product.price || 20;
        if (product.category === 'cookies') return [{ name: '1/2 dozen', price: Math.round(basePrice * 0.6) }, { name: 'dozen', price: basePrice }];
        return [{ name: product.unit || 'each', price: basePrice }];
    }

    // --- UI Rendering ---
    sanitizeText(text) {
        if (!text) return '';
        return text.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    renderProductList() {
        const container = document.getElementById('product-list');
        container.innerHTML = `
      <div class="admin-header">
        <h2>Product Management <span style="font-size: 0.6em; color: #ff6b6b; font-weight: normal;">(Development Tool)</span></h2>
        <div class="admin-actions">
          <button onclick="adminInterface.addNewProduct()" class="btn btn-primary">+ Add New Product</button>
          <button onclick="adminInterface.exportData()" class="btn btn-secondary">Export All Data</button>
          <button onclick="adminInterface.saveChangesWithPhotos()" class="btn btn-success">Save All Products</button>
        </div>
        <div class="save-instructions">
          <small style="color: rgba(255, 255, 255, 0.7); font-style: italic;">
            Tip: Use individual "Save" buttons on each product for quick updates, or "Save All" for bulk changes<br>
            Reminder: This interface has no real security - files download to your device for manual upload to production
          </small>
        </div>
        <div id="order-pause-toggle"></div>
      </div>
      <div class="products-grid">
        ${this.products.map((product, index) => this.renderProductCard(product, index)).join('')}
      </div>
    `;
        this.renderOrderPauseToggle();
        setTimeout(() => this.adjustUploadUIForMobile(), 100);
    }

    renderProductCard(product, index) {
        return `
      <div class="admin-product-card" data-index="${index}">
        <div class="product-header">
          <h3>${this.sanitizeText(product.name)}</h3>
          <div class="product-actions">
            <label class="sold-out-toggle">
              <input type="checkbox" ${product.soldOut ? 'checked' : ''} onchange="adminInterface.toggleProductSoldOut(${index})">
              <span class="sold-out-label">Sold Out</span>
            </label>
            <button onclick="adminInterface.saveIndividualProduct(${index})" class="btn btn-success btn-small" title="Save this product">Save</button>
            <button onclick="adminInterface.deleteProduct(${index})" class="btn btn-danger btn-small" title="Delete this product">Delete</button>
          </div>
        </div>
        <div class="product-form">
          <div class="form-group">
            <label>Product Name:</label>
            <input type="text" value="${this.sanitizeText(product.name)}" onchange="adminInterface.updateProduct(${index}, 'name', this.value)">
          </div>
          <div class="form-group">
            <label>Sizes & Pricing:</label>
            <div class="sizes-container" id="sizes-${index}">${this.renderSizesEditor(product, index)}</div>
            <button type="button" class="btn btn-small btn-secondary" onclick="adminInterface.addSize(${index})" style="margin-top: 5px;">+ Add Size</button>
          </div>
          <div class="form-group">
            <label>Category:</label>
            <select onchange="adminInterface.updateProduct(${index}, 'category', this.value)">
              <option value="cookies" ${product.category === 'cookies' ? 'selected' : ''}>Cookies</option>
              <option value="cakes" ${product.category === 'cakes' ? 'selected' : ''}>Cakes</option>
              <option value="pies" ${product.category === 'pies' ? 'selected' : ''}>Pies</option>
              <option value="breads" ${product.category === 'breads' ? 'selected' : ''}>Breads</option>
              <option value="candy" ${product.category === 'candy' ? 'selected' : ''}>Candy</option>
            </select>
          </div>
          <div class="form-group">
            <label>Description:</label>
            <textarea onchange="adminInterface.updateProduct(${index}, 'description', this.value)">${this.sanitizeText(product.description || '')}</textarea>
          </div>
          <div class="form-group">
            <label>Ingredients:</label>
            <textarea onchange="adminInterface.updateProduct(${index}, 'ingredients', this.value)">${this.sanitizeText(product.ingredients || '')}</textarea>
          </div>
          <div class="form-group">
            <label>Image Filename:</label>
            <input type="text" value="${this.sanitizeText(product.image)}" onchange="adminInterface.updateProduct(${index}, 'image', this.value)">
          </div>
        </div>
      </div>
    `;
    }

    renderSizesEditor(product, productIndex) {
        let sizes = product.originalSizes || [];
        if (sizes.length === 0) {
            sizes = [{ name: 'dozen', price: product.price || 20 }];
            this.products[productIndex].originalSizes = sizes;
        }

        return sizes.map((size, sizeIndex) => `
        <div class="size-row" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center; flex-wrap: wrap;">
          <input type="text" value="${this.sanitizeText(size.name)}" placeholder="Size" style="flex: 1;" onchange="adminInterface.updateSize(${productIndex}, ${sizeIndex}, 'name', this.value)">
          <div style="display: flex; align-items: center; gap: 5px;">
            <span>$</span>
            <input type="number" step="0.01" value="${size.price}" style="width: 80px;" onchange="adminInterface.updateSize(${productIndex}, ${sizeIndex}, 'price', parseFloat(this.value))">
          </div>
          <button type="button" class="btn btn-small btn-danger" onclick="adminInterface.removeSize(${productIndex}, ${sizeIndex})" ${sizes.length <= 1 ? 'disabled' : ''}>&times;</button>
        </div>
      `).join('');
    }

    // --- Updates & Actions ---
    updateProduct(index, field, value) {
        if (this.products[index]) this.products[index][field] = value;
    }

    updateSize(productIndex, sizeIndex, field, value) {
        if (!this.products[productIndex].originalSizes) this.products[productIndex].originalSizes = [];
        if (!this.products[productIndex].originalSizes[sizeIndex]) this.products[productIndex].originalSizes[sizeIndex] = { name: '', price: 0 };
        this.products[productIndex].originalSizes[sizeIndex][field] = value;
        if (sizeIndex === 0 && field === 'price') this.products[productIndex].price = value;
    }

    addSize(productIndex) {
        if (!this.products[productIndex].originalSizes) this.products[productIndex].originalSizes = [];
        this.products[productIndex].originalSizes.push({ name: 'new size', price: this.products[productIndex].price || 20 });
        document.getElementById(`sizes-${productIndex}`).innerHTML = this.renderSizesEditor(this.products[productIndex], productIndex);
    }

    removeSize(productIndex, sizeIndex) {
        if (this.products[productIndex].originalSizes.length <= 1) return;
        this.products[productIndex].originalSizes.splice(sizeIndex, 1);
        document.getElementById(`sizes-${productIndex}`).innerHTML = this.renderSizesEditor(this.products[productIndex], productIndex);
    }

    toggleProductSoldOut(index) {
        this.products[index].soldOut = !this.products[index].soldOut;
        this.saveAdminState(); // Persist to siteConfig
    }

    addNewProduct() {
        this.products.unshift({
            id: 'new-product-' + Date.now(),
            name: 'New Product',
            price: 0,
            unit: 'each',
            category: 'cookies',
            description: '',
            ingredients: '',
            allergens: [],
            image: '',
            originalSizes: [{ name: 'each', price: 0 }]
        });
        this.renderProductList();
    }

    deleteProduct(index) {
        if (confirm('Delete this product?')) {
            this.products.splice(index, 1);
            this.renderProductList();
        }
    }

    // --- Saving & Exporting ---
    generateProductsJson() {
        const exportProducts = this.products.map(product => this.convertFromAdminFormat(product));
        const payload = {
            schemaVersion: 'yellowfarmhouse.products.v1',
            version: new Date().toISOString(),
            products: exportProducts,
            dietaryPricing: this.dietaryPricing,
            paymentMethods: this.paymentMethods,
            shippingZones: this.shippingZones,
            metadata: { generatedBy: 'cookiewagon-admin', updatedAt: new Date().toISOString() }
        };
        return JSON.stringify(payload, null, 2);
    }

    saveChangesWithPhotos() {
        const updatedJson = this.generateProductsJson();
        this.downloadFile(updatedJson, 'products-data.json', 'application/json');
        this.showMessage('Products file downloaded! Upload it to your website.', 'success');
    }

    saveIndividualProduct(index) {
        const product = this.products[index];
        const exportProduct = this.convertFromAdminFormat(product);
        const productJS = `const UPDATED_PRODUCT = ${JSON.stringify(exportProduct, null, 4)};`;
        const filename = `${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.js`;
        this.downloadFile(productJS, filename, 'text/javascript');
        this.showMessage(`Saved ${product.name} individually!`, 'success');
    }

    exportData() {
        const dataJSON = JSON.stringify({ products: this.products, exportDate: new Date().toISOString() }, null, 2);
        this.downloadFile(dataJSON, `backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.getElementById('admin-messages');
        if (!messageDiv) return;
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        messageDiv.appendChild(messageEl);
        setTimeout(() => { if (messageEl.parentNode) messageEl.parentNode.removeChild(messageEl); }, 5000);
    }

    // Detect mobile device and adjust UI
    detectMobileDevice() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                        window.innerWidth <= 768;
        return isMobile;
    }
    
    // Adjust upload UI for mobile after rendering
    adjustUploadUIForMobile() {
        const isMobile = this.detectMobileDevice();
        if (isMobile) {
        // Switch to mobile-friendly text
        document.querySelectorAll('[class*="upload-text-"]').forEach(textEl => {
            const desktopText = textEl.querySelector('.desktop-text');
            const mobileText = textEl.querySelector('.mobile-text');
            if (desktopText && mobileText) {
            desktopText.style.display = 'none';
            mobileText.style.display = 'block';
            }
        });
        }
    }

    setupEventListeners() {
        // Drag and drop listeners could go here
    }
}

// Initialize
let adminInterface;
document.addEventListener('DOMContentLoaded', function() {
    adminInterface = new AdminInterface();
    window.adminInterface = adminInterface;
});

window.handleLogin = () => adminInterface && adminInterface.handleLogin();
window.logout = () => adminInterface && adminInterface.logout();
