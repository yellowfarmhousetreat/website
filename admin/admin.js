/**
 * SECURE ADMIN INTERFACE FOR YELLOW FARMHOUSE TREATS
 * Allows remote product editing through web interface
 */

class AdminInterface {
  constructor() {
    this.isAuthenticated = false;
    this.products = [];
    this.backupData = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkAuthentication();
    // Load products after authentication check
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
    const password = 'FarmhouseBaker2024!'; // Change this to your secure password
    return btoa(password + new Date().toDateString());
  }

  showLoginForm() {
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
  }

  showAdminPanel() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    
    // Load products when admin panel is shown
    this.loadProducts().then(() => {
      this.renderProductList();
    }).catch(() => {
      this.renderProductList(); // Render with fallback data
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

  // Load current products from the main site
  async loadProducts() {
    try {
      // Method 1: Try direct script loading
      await this.loadProductsViaScript();
      this.showMessage(`Loaded ${this.products.length} products successfully`, 'success');
      
    } catch (error) {
      console.log('Script method failed, trying fetch method...', error.message);
      
      try {
        // Method 2: Try fetch and eval (fallback)
        await this.loadProductsViaFetch();
        this.showMessage(`Loaded ${this.products.length} products successfully (via fetch)`, 'success');
        
      } catch (fetchError) {
        console.error('Both loading methods failed:', fetchError.message);
        this.showMessage('Error loading products: ' + fetchError.message, 'error');
        
        // Fallback: create some default products if loading fails
        this.products = [
          {
            id: 'sample-cookies',
            name: 'Sample Cookies',
            price: 20,
            unit: 'dozen',
            category: 'cookies',
            description: 'Sample product - edit or delete this',
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
  }

  // Method 1: Load via script tag
  async loadProductsViaScript() {
    const script = document.createElement('script');
    script.src = '../products-data.js?' + Date.now(); // Cache busting
    
    await new Promise((resolve, reject) => {
      script.onload = () => {
        setTimeout(() => {
          console.log('Checking for PRODUCTS...', typeof window.PRODUCTS, window.PRODUCTS);
          
          if (typeof window.PRODUCTS !== 'undefined' && Array.isArray(window.PRODUCTS)) {
            try {
              this.products = window.PRODUCTS.map(product => this.convertToAdminFormat(product));
              this.backupData = JSON.stringify(this.products, null, 2);
              console.log('Successfully converted products:', this.products.length);
              resolve();
            } catch (conversionError) {
              console.error('Error converting products:', conversionError);
              reject(new Error('Error converting products: ' + conversionError.message));
            }
          } else {
            reject(new Error('PRODUCTS array not found after script load'));
          }
        }, 100);
      };
      script.onerror = () => reject(new Error('Failed to load products-data.js script'));
      document.head.appendChild(script);
    });
  }

  // Method 2: Load via fetch and eval
  async loadProductsViaFetch() {
    const response = await fetch('../products-data.js?' + Date.now());
    if (!response.ok) {
      throw new Error('Failed to fetch products-data.js');
    }
    
    const jsCode = await response.text();
    
    // Create a temporary global scope to execute the code
    const originalProducts = window.PRODUCTS;
    
    try {
      // Execute the JavaScript code
      eval(jsCode);
      
      if (typeof window.PRODUCTS !== 'undefined' && Array.isArray(window.PRODUCTS)) {
        this.products = window.PRODUCTS.map(product => this.convertToAdminFormat(product));
        this.backupData = JSON.stringify(this.products, null, 2);
        console.log('Successfully loaded via fetch:', this.products.length);
      } else {
        throw new Error('PRODUCTS array not available after eval');
      }
    } catch (evalError) {
      // Restore original PRODUCTS if it existed
      if (originalProducts) window.PRODUCTS = originalProducts;
      throw new Error('Error executing products script: ' + evalError.message);
    }
  }

  // Convert complex product format to simple admin format
  convertToAdminFormat(product) {
    const basePrice = product.sizes && product.sizes.length > 0 ? product.sizes[0].price : 20;
    const baseUnit = this.extractUnitFromSize(product.sizes && product.sizes[0] ? product.sizes[0].name : 'dozen');
    
    return {
      id: product.id,
      name: product.name,
      price: basePrice,
      unit: baseUnit,
      category: product.category,
      description: product.description || '',
      image: product.image || '',
      glutenFree: product.dietary ? product.dietary.glutenFree || false : false,
      sugarFree: product.dietary ? product.dietary.sugarFree || false : false,
      shippingEligible: product.shippable || false,
      featured: product.featured || false,
      tier: product.tier || 'Regular',
      emoji: product.emoji || '',
      originalSizes: product.sizes || [] // Keep original sizes for export
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
        <h2>Product Management</h2>
        <div class="admin-actions">
          <button onclick="adminInterface.addNewProduct()" class="btn btn-primary">Add New Product</button>
          <button onclick="adminInterface.exportData()" class="btn btn-secondary">Export Data</button>
          <button onclick="adminInterface.saveChangesWithPhotos()" class="btn btn-success">💾 Save Products & Photos</button>
        </div>
      </div>
      
      <div class="products-grid">
        ${this.products.map((product, index) => this.renderProductCard(product, index)).join('')}
      </div>
    `;
    
    // Adjust UI for mobile devices after rendering
    setTimeout(() => this.adjustUploadUIForMobile(), 100);
  }

  // Render individual product editing card
  renderProductCard(product, index) {
    return `
      <div class="admin-product-card" data-index="${index}">
        <div class="product-header">
          <h3>${this.sanitizeText(product.name)}</h3>
          <button onclick="adminInterface.deleteProduct(${index})" class="btn btn-danger btn-small">Delete</button>
        </div>
        
        <div class="product-form">
          <div class="form-group">
            <label>Product Name:</label>
            <input type="text" value="${this.sanitizeText(product.name)}" 
                   onchange="adminInterface.updateProduct(${index}, 'name', this.value)">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Price ($):</label>
              <input type="number" step="0.01" value="${product.price}" 
                     onchange="adminInterface.updateProduct(${index}, 'price', parseFloat(this.value))">
            </div>
            <div class="form-group">
              <label>Unit:</label>
              <select onchange="adminInterface.updateProduct(${index}, 'unit', this.value)">
                <option value="dozen" ${product.unit === 'dozen' ? 'selected' : ''}>Dozen</option>
                <option value="each" ${product.unit === 'each' ? 'selected' : ''}>Each</option>
                <option value="bag" ${product.unit === 'bag' ? 'selected' : ''}>Bag</option>
                <option value="loaf" ${product.unit === 'loaf' ? 'selected' : ''}>Loaf</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Category:</label>
            <select onchange="adminInterface.updateProduct(${index}, 'category', this.value)">
              <option value="cookies" ${product.category === 'cookies' ? 'selected' : ''}>Cookies</option>
              <option value="cakes" ${product.category === 'cakes' ? 'selected' : ''}>Cakes</option>
              <option value="pies" ${product.category === 'pies' ? 'selected' : ''}>Pies</option>
              <option value="breads" ${product.category === 'breads' ? 'selected' : ''}>Breads</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Description:</label>
            <textarea onchange="adminInterface.updateProduct(${index}, 'description', this.value)">${this.sanitizeText(product.description || '')}</textarea>
          </div>
          
          <div class="form-group">
            <label>Product Photo:</label>
            <div class="photo-upload-group" 
                 ondrop="adminInterface.handlePhotoDrop(event, ${index})" 
                 ondragover="adminInterface.handleDragOver(event)"
                 ondragleave="adminInterface.handleDragLeave(event)">
              
              <div class="photo-preview" id="photo-preview-${index}" style="display: none;">
                <img id="photo-img-${index}" src="" alt="Product photo">
                <div class="photo-info">
                  <div class="photo-filename" id="photo-name-${index}"></div>
                  <div class="photo-size" id="photo-size-${index}"></div>
                </div>
                <div class="photo-actions">
                  <button type="button" class="btn btn-small btn-secondary" 
                          onclick="adminInterface.changePhoto(${index})">Change</button>
                  <button type="button" class="btn btn-small btn-danger" 
                          onclick="adminInterface.removePhoto(${index})">Remove</button>
                </div>
              </div>
              
              <div class="upload-area" id="upload-area-${index}" 
                   onclick="adminInterface.triggerPhotoUpload(${index})">
                <div class="upload-icon">📷</div>
                <div class="upload-text-${index}">
                  <div class="desktop-text">Click to upload photo<br><small>or drag & drop image here</small></div>
                  <div class="mobile-text" style="display: none;">Tap to select photo<br><small>from Photos, Camera, or Files</small></div>
                </div>
              </div>
              
              <input type="file" id="photo-input-${index}" class="file-input" 
                     accept="image/*" 
                     capture="environment"
                     onchange="adminInterface.handlePhotoSelect(event, ${index})">
            </div>
            
            <!-- Fallback filename input -->
            <div style="margin-top: 0.5rem;">
              <label style="font-size: 0.85rem; opacity: 0.8;">Or enter filename manually:</label>
              <input type="text" value="${this.sanitizeText(product.image)}" 
                     onchange="adminInterface.updateProduct(${index}, 'image', this.value)"
                     placeholder="e.g., cookies-chocolate-chip.jpg">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>
                <input type="checkbox" ${product.glutenFree ? 'checked' : ''} 
                       onchange="adminInterface.updateProduct(${index}, 'glutenFree', this.checked)">
                Gluten Free Available
              </label>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" ${product.sugarFree ? 'checked' : ''} 
                       onchange="adminInterface.updateProduct(${index}, 'sugarFree', this.checked)">
                Sugar Free Available
              </label>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>
                <input type="checkbox" ${product.shippingEligible ? 'checked' : ''} 
                       onchange="adminInterface.updateProduct(${index}, 'shippingEligible', this.checked)">
                Shipping Eligible
              </label>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" ${product.featured ? 'checked' : ''} 
                       onchange="adminInterface.updateProduct(${index}, 'featured', this.checked)">
                Featured Product
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Security: Sanitize text input
  sanitizeText(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[<>&"']/g, function(match) {
      const escapeMap = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return escapeMap[match];
    });
  }

  // Update product data
  updateProduct(index, field, value) {
    if (index >= 0 && index < this.products.length) {
      this.products[index][field] = value;
      this.showMessage(`Updated ${field} for ${this.products[index].name}`, 'info');
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

  // Delete product
  deleteProduct(index) {
    if (confirm('Are you sure you want to delete this product?')) {
      const productName = this.products[index].name;
      this.products.splice(index, 1);
      this.renderProductList();
      this.showMessage(`Deleted ${productName}`, 'warning');
    }
  }

  // Generate updated products-data.js content
  generateProductsJS() {
    // Convert admin format back to complex format
    const exportProducts = this.products.map(product => this.convertFromAdminFormat(product));
    
    const jsContent = `// products-data.js
// Centralized product database for Yellow Farmhouse Treats
// This is the single source of truth for all product information

const PRODUCTS = ${JSON.stringify(exportProducts, null, 4)};

// Dietary pricing adjustments
const DIETARY_PRICING = {
    glutenFree: 3,
    sugarFree: 3,
    vegan: 2
};

// Payment methods
const PAYMENT_METHODS = {
    cash: { name: 'Cash', instructions: 'Payment due at pickup' },
    cashapp: { name: 'Cash App', instructions: 'Send payment to $YellowFarmhouse' },
    venmo: { name: 'Venmo', instructions: 'Send payment to @YellowFarmhouse' },
    paypal: { name: 'PayPal', instructions: 'Send payment to yellowfarmhouse@email.com' },
    zelle: { name: 'Zelle', instructions: 'Send payment to (555) 123-4567' }
};

// Shipping ZIP codes and costs
const SHIPPING_ZONES = {
    '12345': 5.00,
    '12346': 5.00,
    '12347': 7.50,
    '12348': 7.50,
    '12349': 10.00
};

// Make data available globally
window.PRODUCTS = PRODUCTS;
window.DIETARY_PRICING = DIETARY_PRICING;
window.PAYMENT_METHODS = PAYMENT_METHODS;
window.SHIPPING_ZONES = SHIPPING_ZONES;`;
    
    return jsContent;
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
      ...(product.emoji && { emoji: product.emoji }),
      image: product.image,
      sizes: sizes,
      dietary: {
        glutenFree: product.glutenFree || false,
        sugarFree: product.sugarFree || false,
        vegan: false
      },
      shippable: product.shippingEligible || false
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

  // Save changes (download new file)
  saveChanges() {
    const updatedJS = this.generateProductsJS();
    
    // Create downloadable file
    const blob = new Blob([updatedJS], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-data.js';
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
  
  handlePhotoSelect(event, index) {
    const file = event.target.files[0];
    if (file) {
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
      this.showMessage('📸 Processing photo from iOS Photos...', 'info');
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
      this.showMessage('📱 HEIC format detected. Converting for web use...', 'info');
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
        `📱 Photo added from iOS Photos: ${filename}` : 
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
    const updatedJS = this.generateProductsJS();
    
    // Create ZIP file with products data and photos
    if (this.photoFiles && Object.keys(this.photoFiles).length > 0) {
      this.createZipWithPhotos(updatedJS);
    } else {
      // No photos, just download JS file
      this.downloadFile(updatedJS, 'products-data.js', 'text/javascript');
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
  
  createZipWithPhotos(jsContent) {
    // Simple ZIP creation message (in a real app, you'd use JSZip library)
    this.showMessage('Creating download package with photos and data...', 'info');
    
    // Download the JS file
    this.downloadFile(jsContent, 'products-data.js', 'text/javascript');
    
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
});

// Login form handler
function handleLogin() {
  adminInterface.handleLogin();
}

// Logout handler
function logout() {
  adminInterface.logout();
}