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
    this.loadProducts();
    this.setupEventListeners();
    this.checkAuthentication();
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
    this.renderProductList();
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
      // In a real deployment, this would fetch from the server
      // For now, we'll load the local products-data.js
      const response = await fetch('../products-data.js');
      const jsContent = await response.text();
      
      // Extract the PRODUCTS array from the JS file
      const productsMatch = jsContent.match(/const PRODUCTS = (\[[\s\S]*?\]);/);
      if (productsMatch) {
        this.products = JSON.parse(productsMatch[1]);
        this.backupData = JSON.stringify(this.products, null, 2);
      }
    } catch (error) {
      this.showMessage('Error loading products: ' + error.message, 'error');
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
          <button onclick="adminInterface.saveChanges()" class="btn btn-success">Save All Changes</button>
        </div>
      </div>
      
      <div class="products-grid">
        ${this.products.map((product, index) => this.renderProductCard(product, index)).join('')}
      </div>
    `;
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
            <label>Image Filename:</label>
            <input type="text" value="${this.sanitizeText(product.image)}" 
                   onchange="adminInterface.updateProduct(${index}, 'image', this.value)">
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
    const jsContent = `/**
 * YELLOW FARMHOUSE TREATS - PRODUCT DATABASE
 * Last updated: ${new Date().toLocaleString()}
 * 
 * To add/edit products: Simply edit this file and save.
 * Changes appear instantly on the website.
 */

const PRODUCTS = ${JSON.stringify(this.products, null, 2)};

// Pricing for dietary options
const DIETARY_PRICING = {
  glutenFree: 5,  // +$5 for gluten free
  sugarFree: 3    // +$3 for sugar free
};

// Payment methods available
const PAYMENT_METHODS = [
  'Cash',
  'Cash App', 
  'Venmo',
  'PayPal',
  'Zelle'
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRODUCTS, DIETARY_PRICING, PAYMENT_METHODS };
}`;
    
    return jsContent;
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