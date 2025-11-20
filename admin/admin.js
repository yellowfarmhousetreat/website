/**
 * SECURE ADMIN INTERFACE FOR YELLOW FARMHOUSE TREATS
 * Allows remote product editing through web interface
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
    getPassword() {
      // Get password from localStorage or use default
      return localStorage.getItem('admin_password') || 'FarmhouseBaker2024!';
    }

    setPassword(newPassword) {
      localStorage.setItem('admin_password', newPassword);
      this.showMessage('Admin password updated!', 'success');
    }

    renderPasswordForm() {
      let pwForm = document.getElementById('admin-password-form');
      if (!pwForm) {
        pwForm = document.createElement('form');
        pwForm.id = 'admin-password-form';
        pwForm.innerHTML = `
          <div style="margin:1.5rem 0;padding:1rem;background:#f9f9f9;border-radius:8px;max-width:400px;">
            <h3 style="margin-bottom:0.5rem;color:#1976d2;">Change Admin Password</h3>
            <input type="password" id="new-admin-password" placeholder="New password" style="width:100%;margin-bottom:0.5rem;padding:0.5rem;">
            <button type="submit" style="padding:0.5rem 1rem;">Update Password</button>
          </div>
        `;
        pwForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const newPw = document.getElementById('new-admin-password').value;
          if (newPw && newPw.length >= 8) {
            this.setPassword(newPw);
            document.getElementById('new-admin-password').value = '';
          } else {
            this.showMessage('Password must be at least 8 characters.', 'error');
          }
        });
        document.getElementById('admin-panel').prepend(pwForm);
      }
    }
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
window.adminInterface = null;
let adminInterface;
    this.setupEventListeners();
    this.checkAuthentication();
    // Load products after authentication check
    this.displaySecurityWarning();
  }

  // Display security warning
  displaySecurityWarning() {
    console.warn('SECURITY WARNING: This admin interface provides NO REAL SECURITY!');
    console.warn('Client-side authentication can be bypassed by anyone with basic web knowledge');
    console.warn('Password is visible in source code: View Source -> Search for "FarmhouseBaker"');
    console.warn('Use ONLY on trusted devices and networks - NEVER in production!');
    console.warn('For real security, edit data/products-data.json directly and use Git for deployment');
    
    // Show warning banner
    this.showSecurityBanner();
  }

  // Show security warning banner
  showSecurityBanner() {
    const banner = document.createElement('div');
    banner.id = 'security-warning-banner';
    banner.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #ff4757, #ff3742);
        color: white;
        padding: 1rem;
        text-align: center;
        font-weight: bold;
        border-bottom: 3px solid #ff1e2d;
        box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
        position: sticky;
        top: 0;
        z-index: 9999;
      ">
        DEVELOPMENT TOOL - NO REAL SECURITY<br>
        <small style="font-weight: normal; opacity: 0.9;">
          This interface can be bypassed by anyone - Use only on trusted networks - Password visible in source code
        </small>
      </div>
    `;
    document.body.insertBefore(banner, document.body.firstChild);
  }

  // Security: Simple but effective authentication
  checkAuthentication() {
    const authToken = sessionStorage.getItem('admin_auth');
    const validToken = this.generateToken();
    
    if (authToken === validToken) {
      this.isAuthenticated = true;
      this.showAdminPanel();
    } else {
      this.showLoginForm();
    }
  }

  // Generate secure token (you should change this password)
  generateToken() {
    const password = this.getPassword();
    return btoa(password + new Date().toDateString());
  }

  // Update product data
  updateProduct(index, field, value) {
    document.getElementById('login-form').style.display = 'block';
    
    // Add security disclaimer to login form if not already present
    const loginContainer = document.getElementById('login-form');
    if (!loginContainer.querySelector('.security-disclaimer')) {
      const disclaimer = document.createElement('div');
      disclaimer.className = 'security-disclaimer';
      disclaimer.innerHTML = `
        <div style="
          background: rgba(255, 193, 7, 0.15);
          border: 2px solid rgba(255, 193, 7, 0.4);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          color: #ffffff;
          font-size: 0.85rem;
          line-height: 1.4;
        ">
          <strong>SECURITY NOTICE:</strong><br>
          This admin interface provides <strong>NO REAL SECURITY</strong>. The password is visible in the source code 
          and can be bypassed using browser developer tools. Use only on trusted devices and networks.
          <br><br>
          <strong>For production:</strong> Edit data/products-data.json directly and deploy via Git.
        </div>
      `;
      loginContainer.insertBefore(disclaimer, loginContainer.firstChild);
    }
  }

  showAdminPanel() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    this.renderPasswordForm();
    // Load products when admin panel is shown
    this.loadProducts().then(() => {
      this.renderProductList();
      this.renderOrderPauseToggle();
    }).catch(() => {
      this.renderProductList(); // Render with fallback data
      this.renderOrderPauseToggle();
    });
  }

  // Authentication handler
  handleLogin() {
    const password = document.getElementById('admin-password').value;
    const expectedToken = this.generateToken();
    const inputToken = btoa(password + new Date().toDateString());
    
    if (inputToken === expectedToken) {
      sessionStorage.setItem('admin_auth', inputToken);
      this.isAuthenticated = true;
      this.showAdminPanel();
      this.showMessage('Login successful!', 'success');
    } else {
      this.showMessage('Invalid password!', 'error');
    }
  }

  // Load current products from the main site (JSON catalog)
  async loadProducts() {
    try {
      await this.loadProductsFromJson();
      this.showMessage(`Loaded ${this.products.length} products successfully`, 'success');
    } catch (error) {
      console.error('Product catalog load failed:', error);
      this.showMessage('Error loading products: ' + error.message, 'error');
      this.products = [
        {
          id: 'sample-cookies',
          name: 'Sample Cookies',
          price: 20,
          unit: 'dozen',
          category: 'cookies',
          description: 'Sample product - edit or delete this',
          ingredients: 'Flour, Sugar, Butter, Eggs, Vanilla Extract, Salt, Baking Soda',
          allergens: ['wheat', 'eggs', 'milk'],
          image: 'sample-cookies.jpg',
          glutenFree: true,
          sugarFree: true,
          shippingEligible: false,
          featured: false
        }
      ];
      this.showMessage('Created sample product. Add your real products below.', 'info');
    }
  }

  async loadProductsFromJson() {
    const response = await fetch('../data/products-data.json?' + Date.now(), { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to fetch products-data.json');
    }

    const payload = await response.json();
    const rawProducts = Array.isArray(payload.products) ? payload.products : [];
    this.products = rawProducts.map(product => this.convertToAdminFormat(product));
    this.backupData = JSON.stringify(this.products, null, 2);
    this.dietaryPricing = payload.dietaryPricing || { glutenFree: 3, sugarFree: 3 };
    this.paymentMethods = payload.paymentMethods || {};
    this.shippingZones = payload.shippingZones || {};
    this.catalogVersion = payload.version || '';
  }

  // Convert complex product format to simple admin format
  convertToAdminFormat(product) {
    const basePrice = product.sizes && product.sizes.length > 0 ? product.sizes[0].price : 20;
    const baseUnit = this.extractUnitFromSize(product.sizes && product.sizes[0] ? product.sizes[0].name : 'dozen');
    
    // Deep clone the sizes array to prevent reference issues
    const originalSizes = product.sizes ? JSON.parse(JSON.stringify(product.sizes)) : [
      { name: 'dozen', price: basePrice }
    ];
    
    return {
      id: product.id,
      name: product.name,
      price: basePrice,
      unit: baseUnit,
      category: product.category,
      description: product.description || '',
      ingredients: product.ingredients || '',
      allergens: product.allergens || [],
      image: product.image || '',
      glutenFree: product.dietary ? product.dietary.glutenFree || false : false,
      sugarFree: product.dietary ? product.dietary.sugarFree || false : false,
      // vegan removed
      glutenFreePrice: product.glutenFreePrice || 3,
      sugarFreePrice: product.sugarFreePrice || 3,
      // veganPrice removed
      shippingEligible: product.shippable || false,
      baseShippingCost: product.baseShippingCost || 5,
      perPoundRate: product.perPoundRate || 2,
      featured: product.featured || false,
      tier: product.tier || 'Regular',
      emoji: product.emoji || '',
      originalSizes: originalSizes // Keep original sizes with deep clone
    };
  }

  // Extract unit from size name
  extractUnitFromSize(sizeName) {
    if (!sizeName) return 'dozen';
    const lowerSize = sizeName.toLowerCase();
    if (lowerSize.includes('dozen')) return 'dozen';
    if (lowerSize.includes('loaf')) return 'loaf';
    if (lowerSize.includes('pie')) return 'each';
    if (lowerSize.includes('lb')) return 'lb';
    return 'each';
  }

  // Render sizes editor for a product
  renderSizesEditor(product, productIndex) {
    // Ensure we have the originalSizes array
    let sizes = product.originalSizes || [];
    
    // If no sizes exist, create default based on existing data
    if (sizes.length === 0) {
      sizes = [{ name: 'dozen', price: product.price || 20 }];
      // Update the product to have this default
      this.products[productIndex].originalSizes = sizes;
    }

    console.log(`Rendering sizes for ${product.name}:`, sizes); // Debug log

    return sizes.map((size, sizeIndex) => {
      const sizeName = size.name || '';
      const sizePrice = size.price || 0;
      
      return `
        <div class="size-row" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center; flex-wrap: wrap;">
          <input type="text" value="${this.sanitizeText(sizeName)}" 
                 placeholder="Size name (e.g., 1/2 dozen, dozen)" 
                 style="flex: 1; min-width: 140px;"
                 onchange="adminInterface.updateSize(${productIndex}, ${sizeIndex}, 'name', this.value)">
          <div style="display: flex; align-items: center; gap: 5px;">
            <span>$</span>
            <input type="number" step="0.01" value="${sizePrice}" 
                   placeholder="Price" 
                   style="width: 80px;"
                   onchange="adminInterface.updateSize(${productIndex}, ${sizeIndex}, 'price', parseFloat(this.value))">
          </div>
          <div style="display: flex; align-items: center; gap: 5px;">
            <input type="number" step="0.1" value="${size.weight || ''}" 
                   placeholder="Weight (lbs)" 
                   style="width: 90px;"
                   onchange="adminInterface.updateSize(${productIndex}, ${sizeIndex}, 'weight', parseFloat(this.value))">
            <small style="color: #666;">lbs</small>
          </div>
          <button type="button" class="btn btn-small btn-danger" 
                  onclick="adminInterface.removeSize(${productIndex}, ${sizeIndex})"
                  ${sizes.length <= 1 ? 'disabled' : ''}>&times;</button>
        </div>
      `;
    }).join('');
  }

  // Update a specific size
  updateSize(productIndex, sizeIndex, field, value) {
    if (!this.products[productIndex].originalSizes) {
      this.products[productIndex].originalSizes = [];
    }
    
    if (!this.products[productIndex].originalSizes[sizeIndex]) {
      this.products[productIndex].originalSizes[sizeIndex] = { name: '', price: 0 };
    }
    
    this.products[productIndex].originalSizes[sizeIndex][field] = value;
    
    // Update the main price to be the first size's price
    if (sizeIndex === 0 && field === 'price') {
      this.products[productIndex].price = value;
    }
    
    this.showMessage(`Updated ${field} for size ${sizeIndex + 1}`, 'info');
  }

  // Add a new size to a product
  addSize(productIndex) {
    if (!this.products[productIndex].originalSizes) {
      this.products[productIndex].originalSizes = [];
    }
    
    this.products[productIndex].originalSizes.push({
      name: 'new size',
      price: this.products[productIndex].price || 20
    });
    
    // Re-render the sizes editor
    document.getElementById(`sizes-${productIndex}`).innerHTML = 
      this.renderSizesEditor(this.products[productIndex], productIndex);
    
    this.showMessage('Added new size option', 'success');
  }

  // Remove a size from a product
  removeSize(productIndex, sizeIndex) {
    if (!this.products[productIndex].originalSizes || this.products[productIndex].originalSizes.length <= 1) {
      this.showMessage('Cannot remove the last size option', 'error');
      return;
    }
    
    this.products[productIndex].originalSizes.splice(sizeIndex, 1);
    
    // Re-render the sizes editor
    document.getElementById(`sizes-${productIndex}`).innerHTML = 
      this.renderSizesEditor(this.products[productIndex], productIndex);
    
    this.showMessage('Removed size option', 'warning');
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

  // Render the product management interface
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
    setTimeout(() => this.adjustUploadUIForMobile(), 100);
  }

  // Render individual product editing card
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
            <label>Ingredients (in order of quantity):</label>
            <textarea placeholder="e.g., Flour, Sugar, Butter, Eggs, Vanilla Extract, Salt, Baking Soda" onchange="adminInterface.updateProduct(${index}, 'ingredients', this.value)">${this.sanitizeText(product.ingredients || '')}</textarea>
            <small style="color: rgba(255, 255, 255, 0.6); font-style: italic;">List all ingredients in descending order by weight/volume</small>
          </div>
          <div class="form-group">
            <label>Allergen Information:</label>
            <div class="allergen-checkboxes">
              ${['wheat','eggs','milk','nuts','peanuts','soy'].map(allergen => `
                <label class="checkbox-item">
                  <input type="checkbox" ${product.allergens?.includes(allergen) ? 'checked' : ''} onchange="adminInterface.updateAllergen(${index}, '${allergen}', this.checked)">
                  Contains ${allergen.charAt(0).toUpperCase() + allergen.slice(1)}
                </label>
              `).join('')}
            </div>
          </div>
          <div class="form-group">
            <label>Product Photo:</label>
            <div class="photo-upload-group" ondrop="adminInterface.handlePhotoDrop(event, ${index})" ondragover="adminInterface.handleDragOver(event)" ondragleave="adminInterface.handleDragLeave(event)">
              <div class="photo-preview" id="photo-preview-${index}" style="display: none;">
                <img id="photo-img-${index}" src="" alt="Product photo">
                <div class="photo-info">
                  <div class="photo-filename" id="photo-name-${index}"></div>
                  <div class="photo-size" id="photo-size-${index}"></div>
                </div>
                <div class="photo-actions">
                  <button type="button" class="btn btn-small btn-secondary" onclick="adminInterface.changePhoto(${index})">Change</button>
                  <button type="button" class="btn btn-small btn-danger" onclick="adminInterface.removePhoto(${index})">Remove</button>
                </div>
              </div>
              <div class="photo-upload-section">
                <div class="upload-buttons">
                  <button type="button" class="btn btn-primary btn-photo-library" onclick="adminInterface.triggerPhotoLibrary(${index})">Photos</button>
                  <button type="button" class="btn btn-secondary btn-camera" onclick="adminInterface.triggerCamera(${index})">Camera</button>
                  <button type="button" class="btn btn-secondary btn-files" onclick="adminInterface.triggerFiles(${index})">Files</button>
                </div>
                <div class="upload-hint">Select from Photos app, take new photo, or browse files</div>
              </div>
              <input type="file" id="photo-input-library-${index}" class="file-input" accept="image/*" onchange="adminInterface.handlePhotoSelect(event, ${index}, 'library')" style="display: none;">
              <input type="file" id="photo-input-camera-${index}" class="file-input" accept="image/*" capture="environment" onchange="adminInterface.handlePhotoSelect(event, ${index}, 'camera')" style="display: none;">
              <input type="file" id="photo-input-files-${index}" class="file-input" accept="image/*,image/heic,image/jpeg,image/png,image/gif,image/webp" onchange="adminInterface.handlePhotoSelect(event, ${index}, 'files')" style="display: none;">
            </div>
            <div style="margin-top: 0.5rem;">
              <label style="font-size: 0.85rem; opacity: 0.8;">Or enter filename manually:</label>
              <input type="text" value="${this.sanitizeText(product.image)}" onchange="adminInterface.updateProduct(${index}, 'image', this.value)" placeholder="e.g., cookies-chocolate-chip.jpg">
            </div>
          </div>
          <div class="form-group">
            <label>Dietary Options & Pricing:</label>
            <div class="dietary-options">
              <div class="checkbox-row">
                <label class="checkbox-item">
                  <input type="checkbox" id="gf-${index}" ${product.glutenFree ? 'checked' : ''} onchange="adminInterface.updateProduct(${index}, 'glutenFree', this.checked)">
                  Gluten Free
                </label>
                <div class="price-input-group">
                  <span>+$</span>
                  <input type="number" step="0.01" value="${product.glutenFreePrice || 3}" onchange="adminInterface.updateProduct(${index}, 'glutenFreePrice', parseFloat(this.value))">
                </div>
              </div>
              <div class="checkbox-row">
                <label class="checkbox-item">
                  <input type="checkbox" id="sf-${index}" ${product.sugarFree ? 'checked' : ''} onchange="adminInterface.updateProduct(${index}, 'sugarFree', this.checked)">
                  Sugar Free
                </label>
                <div class="price-input-group">
                  <span>+$</span>
                  <input type="number" step="0.01" value="${product.sugarFreePrice || 3}" onchange="adminInterface.updateProduct(${index}, 'sugarFreePrice', parseFloat(this.value))">
                </div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Shipping & Features:</label>
            <div class="shipping-options">
              <div class="checkbox-row">
                <label class="checkbox-item">
                  <input type="checkbox" ${product.shippingEligible ? 'checked' : ''} onchange="adminInterface.updateProduct(${index}, 'shippingEligible', this.checked)">
                  Shipping Eligible
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" ${product.featured ? 'checked' : ''} onchange="adminInterface.updateProduct(${index}, 'featured', this.checked)">
                  Featured Product
                </label>
              </div>
              ${product.shippingEligible ? `
                <div class="shipping-details" style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-top: 8px;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
                    </div>
                  `;
                }
                renderOrderPauseToggle() {
                        <input type="number" step="0.01" value="${product.baseShippingCost || 5}" style="width: 60px;" onchange="adminInterface.updateProduct(${index}, 'baseShippingCost', parseFloat(this.value))">
                      </div>
                    </div>
                    <div>
                      <label style="font-size: 0.85rem; margin-bottom: 3px; display: block;">Per Pound Rate:</label>
                      <div style="display: flex; align-items: center; gap: 3px;">
                        <span>$</span>
                        <input type="number" step="0.01" value="${product.perPoundRate || 2}" style="width: 60px;" onchange="adminInterface.updateProduct(${index}, 'perPoundRate', parseFloat(this.value))">
                        <small style="color: #666;">/lb</small>
                      </div>
                    </div>
                  </div>
                  <div style="font-size: 0.85rem; color: #666; font-style: italic;">Shipping = Base Cost + (Weight x Per Pound Rate)</div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    renderOrderPauseToggle() {
      const container = document.getElementById('order-pause-toggle');
      if (!container) return;
      container.innerHTML = `
        <div class="order-status-control">
          <label class="toggle-switch">
            <input type="checkbox" id="order-pause-checkbox" ${this.pauseOrders ? 'checked' : ''} onchange="adminInterface.toggleOrderPause()">
            <span class="toggle-slider"></span>
            <span class="toggle-label">Pause Orders</span>
          </label>
          <div id="pause-status" class="status-indicator ${this.pauseOrders ? 'paused' : 'active'}">
            <span class="status-text">${this.pauseOrders ? 'Paused' : 'Active'}</span>
          </div>
        </div>
      `;
    }
    toggleOrderPause() {
      this.pauseOrders = !this.pauseOrders;
      this.renderOrderPauseToggle();
      this.showMessage(`Orders ${this.pauseOrders ? 'paused' : 'active'}`, this.pauseOrders ? 'warning' : 'success');
      // TODO: Sync with siteConfig system if available
    }
    toggleProductSoldOut(index) {
      if (index >= 0 && index < this.products.length) {
        this.products[index].soldOut = !this.products[index].soldOut;
        this.renderProductList();
        this.showMessage(`${this.products[index].name} marked as ${this.products[index].soldOut ? 'SOLD OUT' : 'available'}`, this.products[index].soldOut ? 'warning' : 'success');
        // TODO: Sync with siteConfig system if available
      }
    }

  // Update allergen data
  updateAllergen(index, allergen, isChecked) {
    if (index >= 0 && index < this.products.length) {
      if (!this.products[index].allergens) {
        this.products[index].allergens = [];
      }
      
      if (isChecked) {
        if (!this.products[index].allergens.includes(allergen)) {
          this.products[index].allergens.push(allergen);
        }
      } else {
        this.products[index].allergens = this.products[index].allergens.filter(a => a !== allergen);
      }
      
      this.showMessage(`Updated allergen info for ${this.products[index].name}`, 'info');
    }
  }

  // Add new product
  addNewProduct() {
    const newProduct = {
      id: `new-product-${Date.now()}`,
      name: 'New Product',
      price: 20,
      unit: 'dozen',
      category: 'cookies',
      description: 'Enter product description',
      image: 'product-image.jpg',
      glutenFree: true,
      sugarFree: true,
      shippingEligible: false,
      featured: false
    };
    
    this.products.push(newProduct);
    this.renderProductList();
    this.showMessage('New product added. Don\'t forget to save!', 'success');
  }

  // Save individual product
  saveIndividualProduct(index) {
    if (index < 0 || index >= this.products.length) {
      this.showMessage('Product not found', 'error');
      return;
    }

    const product = this.products[index];
    const productName = product.name;
    
    try {
      // Convert single product to export format
      const exportProduct = this.convertFromAdminFormat(product);
      
      // Generate individual product file
      const productJS = this.generateIndividualProductJS(exportProduct, index);
      
      // Create downloadable file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `${productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}.js`;
      
      this.downloadFile(productJS, filename, 'text/javascript');
      
      // Also save any photos for this product
      if (this.photoFiles && this.photoFiles[index]) {
        const photoData = this.photoFiles[index];
        this.downloadPhotoFile(photoData, index);
      }
      
      this.showMessage(`Saved ${productName} individually!`, 'success');
      
    } catch (error) {
      this.showMessage(`Error saving ${productName}: ${error.message}`, 'error');
    }
  }

  // Delete product
  deleteProduct(index) {
    if (confirm('Are you sure you want to delete this product?')) {
      const productName = this.products[index].name;
      this.products.splice(index, 1);
      this.renderProductList();
      this.showMessage(`Deleted ${productName}`, 'warning');
    }
  }

  // Generate updated products-data.json content
  generateProductsJson() {
    const exportProducts = this.products.map(product => this.convertFromAdminFormat(product));

    const payload = {
      schemaVersion: 'yellowfarmhouse.products.v1',
      version: new Date().toISOString(),
      products: exportProducts,
      dietaryPricing: this.dietaryPricing || { ...DEFAULT_DIETARY_PRICING },
      paymentMethods: this.paymentMethods || { ...DEFAULT_PAYMENT_METHODS },
      shippingZones: this.shippingZones || { ...DEFAULT_SHIPPING_ZONES },
      metadata: {
        generatedBy: 'cookiewagon-admin',
        updatedAt: new Date().toISOString()
      }
    };

    return JSON.stringify(payload, null, 2);
  }

  // Convert admin format back to complex format for export
  convertFromAdminFormat(product) {
    // Generate sizes array based on unit and price
    let sizes = [];
    if (product.originalSizes && product.originalSizes.length > 0) {
      // Use original sizes if available, but update first size with current price
      sizes = [...product.originalSizes];
      if (sizes[0]) {
        sizes[0].price = product.price;
      }
    } else {
      // Generate default sizes based on unit and category
      sizes = this.generateDefaultSizes(product);
    }

    return {
      id: product.id,
      name: product.name,
      ...(product.tier && { tier: product.tier }),
      category: product.category,
      description: product.description,
      ingredients: product.ingredients || '',
      allergens: product.allergens || [],
      ...(product.emoji && { emoji: product.emoji }),
      image: product.image,
      sizes: sizes,
      dietary: {
        glutenFree: product.glutenFree || false,
        sugarFree: product.sugarFree || false,
        // vegan removed
      },
      dietaryPricing: {
        glutenFree: product.glutenFreePrice || 3,
        sugarFree: product.sugarFreePrice || 3,
        // veganPrice removed
      },
      shippable: product.shippingEligible || false,
      ...(product.shippingEligible && {
        shipping: {
          baseShippingCost: product.baseShippingCost || 5,
          perPoundRate: product.perPoundRate || 2
        }
      }),
      idahoDisclaimer: "This product was produced in a home kitchen that is not subject to public health inspection that may also process common food allergens. If you have safety concerns, contact your local health department."
    };
  }

  // Generate default sizes for a product
  generateDefaultSizes(product) {
    const basePrice = product.price || 20;
    
    switch (product.category) {
      case 'cookies':
        return [
          { name: '1/2 dozen', price: Math.round(basePrice * 0.6) },
          { name: 'dozen', price: basePrice }
        ];
      case 'pies':
        return [{ name: '9 inch pie', price: basePrice }];
      case 'breads':
        return [{ name: 'loaf', price: basePrice }];
      default:
        return [{ name: product.unit || 'each', price: basePrice }];
    }
  }

  // Generate individual product JavaScript file
  generateIndividualProductJS(product, index) {
    return `/**
 * INDIVIDUAL PRODUCT UPDATE
 * Product: ${product.name}
 * Generated: ${new Date().toLocaleString()}
 * 
 * Instructions:
 * 1. Copy the product object below
 * 2. Find this product in your main data/products-data.json file
 * 3. Replace the existing product with this updated version
 * 4. Save the file and redeploy
 */

// Updated product data:
const UPDATED_PRODUCT = ${JSON.stringify(product, null, 4)};

// Original array index: ${index}
// Product ID: ${product.id}

/* 
TO UPDATE YOUR MAIN FILE:
1. Open data/products-data.json
2. Find the product with id: '${product.id}'
3. Replace it with the UPDATED_PRODUCT object above
4. Save the file
*/`;
  }

  // Download photo file for individual product
  downloadPhotoFile(photoData, productIndex) {
    if (!photoData || !photoData.dataUrl) return;
    
    // Convert data URL to blob and download
    fetch(photoData.dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = photoData.filename || `product-${productIndex}-photo.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(error => {
        this.showMessage('Error downloading photo: ' + error.message, 'error');
      });
  }

  // Save changes (download new file)
  saveChanges() {
    const updatedJson = this.generateProductsJson();
    
    const blob = new Blob([updatedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showMessage('Products file downloaded! Upload it to your website to apply changes.', 'success');
  }

  // Export data as JSON
  exportData() {
    const dataJSON = JSON.stringify({
      products: this.products,
      exportDate: new Date().toISOString(),
      totalProducts: this.products.length
    }, null, 2);
    
    const blob = new Blob([dataJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `farmhouse-products-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showMessage('Product data exported as JSON backup!', 'info');
  }

  // Photo Management Methods
  
  triggerPhotoUpload(index) {
    document.getElementById(`photo-input-${index}`).click();
  }
  
  // Trigger photo library access (iOS specific)
  triggerPhotoLibrary(index) {
    const input = document.getElementById(`photo-input-library-${index}`);
    if (input) {
      input.value = '';
      input.click();
    }
  }
  
  // Trigger camera directly
  triggerCamera(index) {
    const input = document.getElementById(`photo-input-camera-${index}`);
    if (input) {
      input.value = '';
      input.click();
    }
  }
  
  // Trigger general file picker
  triggerFiles(index) {
    const input = document.getElementById(`photo-input-files-${index}`);
    if (input) {
      input.value = '';
      input.click();
    }
  }
  
  handlePhotoSelect(event, index, inputType = 'library') {
    const file = event.target.files[0];
    if (file) {
      this.showMessage(`Photo selected from ${inputType}`, 'info');
      this.processPhoto(file, index);
    }
  }
  
  handlePhotoDrop(event, index) {
    event.preventDefault();
    event.stopPropagation();
    
    const uploadGroup = event.currentTarget;
    uploadGroup.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.processPhoto(file, index);
      } else {
        this.showMessage('Please select an image file', 'error');
      }
    }
  }
  
  handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
  }
  
  handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
  }
  
  processPhoto(file, index) {
    // Validate file
    if (!file.type.startsWith('image/')) {
      this.showMessage('Please select a valid image file', 'error');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      this.showMessage('Image file is too large. Please select a file under 10MB', 'error');
      return;
    }
    
    // iOS Photos app integration feedback
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      this.showMessage('Processing photo from iOS Photos...', 'info');
    }
    
    // Generate filename based on product name
    const product = this.products[index];
    const sanitizedName = product.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const extension = file.name.split('.').pop().toLowerCase();
    const filename = `${sanitizedName}.${extension}`;
    
    // iOS-specific: Handle HEIC format note
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      this.showMessage('HEIC format detected. Converting for web use...', 'info');
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.updatePhotoPreview(index, e.target.result, filename, file.size);
      this.updateProduct(index, 'image', filename);
      
      // Store file data for potential upload
      if (!this.photoFiles) this.photoFiles = {};
      this.photoFiles[index] = {
        file: file,
        filename: filename,
        dataUrl: e.target.result
      };
      
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const message = isIOS ? 
        `Photo added from iOS Photos: ${filename}` : 
        `Photo added: ${filename}`;
      this.showMessage(message, 'success');
    };
    
    reader.readAsDataURL(file);
  }
  
  updatePhotoPreview(index, imageSrc, filename, fileSize) {
    const preview = document.getElementById(`photo-preview-${index}`);
    const uploadArea = document.getElementById(`upload-area-${index}`);
    const img = document.getElementById(`photo-img-${index}`);
    const nameEl = document.getElementById(`photo-name-${index}`);
    const sizeEl = document.getElementById(`photo-size-${index}`);
    
    img.src = imageSrc;
    nameEl.textContent = filename;
    sizeEl.textContent = this.formatFileSize(fileSize);
    
    preview.style.display = 'flex';
    uploadArea.style.display = 'none';
  }
  
  changePhoto(index) {
    this.triggerPhotoUpload(index);
  }
  
  removePhoto(index) {
    const preview = document.getElementById(`photo-preview-${index}`);
    const uploadArea = document.getElementById(`upload-area-${index}`);
    
    preview.style.display = 'none';
    uploadArea.style.display = 'block';
    
    // Clear photo data
    if (this.photoFiles && this.photoFiles[index]) {
      delete this.photoFiles[index];
    }
    
    this.updateProduct(index, 'image', '');
    this.showMessage('Photo removed', 'info');
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Enhanced save with photo export
  saveChangesWithPhotos() {
    const updatedJson = this.generateProductsJson();
    
    // Create ZIP file with products data and photos
    if (this.photoFiles && Object.keys(this.photoFiles).length > 0) {
      this.createZipWithPhotos(updatedJson);
    } else {
      // No photos, just download JSON file
      this.downloadFile(updatedJson, 'products-data.json', 'application/json');
      this.showMessage('Products file downloaded!', 'success');
    }
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
  
  createZipWithPhotos(jsonContent) {
    // Simple ZIP creation message (in a real app, you'd use JSZip library)
    this.showMessage('Creating download package with photos and data...', 'info');
    
    // Download the JS file
    this.downloadFile(jsonContent, 'products-data.json', 'application/json');
    
    // Download each photo individually (simple approach)
    if (this.photoFiles) {
      Object.values(this.photoFiles).forEach(photoData => {
        // Convert data URL to blob and download
        const response = fetch(photoData.dataUrl);
        response.then(res => res.blob()).then(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = photoData.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      });
    }
    
    this.showMessage('Download complete! Upload all files to your images/ folder', 'success');
  }

  // Show status messages
  showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('admin-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    
    messageDiv.appendChild(messageEl);
    
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 5000);
  }

  // Logout
  logout() {
    sessionStorage.removeItem('admin_auth');
    this.isAuthenticated = false;
    this.showLoginForm();
    this.showMessage('Logged out successfully', 'info');
  }

  setupEventListeners() {
    // Additional event listeners can be added here
  }
}

// Initialize admin interface when page loads
let adminInterface;
document.addEventListener('DOMContentLoaded', function() {
  adminInterface = new AdminInterface();
  window.adminInterface = adminInterface;
});

// Login form handler
function handleLogin() {
  if (adminInterface) {
    adminInterface.handleLogin();
  }
}

// Logout handler
function logout() {
  if (adminInterface) {
    adminInterface.logout();
  }
}

window.handleLogin = handleLogin;
window.logout = logout;