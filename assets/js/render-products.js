/**
 * Simple Product Renderer
 * Renders product flip cards directly from products-data.json
 * No dependencies, just works.
 */

class SimpleProductRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.products = [];
    this.dataUrl = '/data/products-data.json';
  }

  // Load products from JSON
  async load() {
    try {
      const response = await fetch(this.dataUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      this.products = data.products || [];
      this.metadata = data.metadata || {};
      console.log(`Loaded ${this.products.length} products`);
      return true;
    } catch (error) {
      console.error('Failed to load products:', error.message);
      return false;
    }
  }

  // Filter by category
  getByCategory(category) {
    return this.products.filter(p => p.category === category);
  }

  // Create a single product card
  createCard(product) {
    const container = document.createElement('div');
    container.className = 'product-container';
    container.setAttribute('data-product-id', product.id);

    const card = document.createElement('div');
    card.className = 'product-card';
    // Mark as ready so product-card-info.js doesn't try to re-wrap it
    card.dataset.flipReady = 'true';

    // Dietary options as checkboxes (only show if product CAN be made that way)
    let dietaryHtml = '';
    if (product.dietary) {
      const canBeGF = product.dietary.glutenFree === true;
      const canBeSF = product.dietary.sugarFree === true;
      
      if (canBeGF || canBeSF) {
        dietaryHtml = '<div class="dietary-options">';
        if (canBeGF) {
          dietaryHtml += `<label class="dietary-checkbox"><input type="checkbox" class="gf-checkbox"> Gluten-Free</label>`;
        }
        if (canBeSF) {
          dietaryHtml += `<label class="dietary-checkbox"><input type="checkbox" class="sf-checkbox"> Sugar-Free</label>`;
        }
        dietaryHtml += '</div>';
      }
    }

    // Size options as clickable list items
    const sizeHtml = (product.sizes || [])
      .map((s, idx) => `<li data-size-index="${idx}" data-price="${s.price}">${s.name}: $${s.price}</li>`)
      .join('');

    const soldOutBadge = product.soldOut ? '<div class="sold-out-badge">SOLD OUT</div>' : '';
    
    // Handle image path - support both old 'image' property and new 'images.primary' structure
    let imagePath = '/images/placeholder.jpg'; // Fallback
    if (product.images && product.images.primary) {
      const basePath = this.metadata?.imageBasePath || '/images/products/';
      imagePath = `${basePath}${product.images.primary}`;
    } else if (product.image) {
      imagePath = product.image;
    }
    
    const imageAlt = product.images?.alt || product.name;
    
    // Handle ingredients - convert array to string if needed
    const ingredientsText = Array.isArray(product.ingredients)
      ? product.ingredients.join(', ')
      : product.ingredients || 'Ingredients information not available';
    
    // Handle allergens - format all allergen information
    const containsText = product.allergens?.contains
      ? product.allergens.contains.join(', ')
      : 'See package for details';
    
    const mayContainText = product.allergens?.mayContain
      ? product.allergens.mayContain.join(', ')
      : '';
    
    const facilityText = product.allergens?.facilityStatement || '';
    
    // Handle nutrition - use product specific or default
    const nutritionText = product.nutrition || 'Approx. 200–350 calories per serving. Contact us for detailed macros.';

    // 1. The Flippable Card (Visuals Only)
    // CRITICAL: Structure must be .product-card-inner > .product-card-front + .product-card-back (Siblings)
    card.innerHTML = `
      <div class="product-card-inner">
        <!-- FRONT FACE -->
        <div class="product-card-front">
          ${soldOutBadge}
          <img src="${imagePath}" alt="${imageAlt}" class="product-image">
          <div class="product-info-front">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="tap-hint">Tap card for ingredients</div>
          </div>
        </div>

        <!-- BACK FACE -->
        <div class="product-card-back">
          <div class="back-content">
            <h4>Ingredients & Allergens</h4>
            <div class="ingredients-section">
              <strong>Ingredients:</strong>
              <p class="ingredients">${ingredientsText}</p>
            </div>
            <div class="allergen-info">
              <strong>Contains:</strong> ${containsText}
              ${mayContainText ? `<br><strong>May Contain:</strong> ${mayContainText}` : ''}
              ${facilityText ? `<br><em class="facility-note">${facilityText}</em>` : ''}
            </div>
            <div class="nutrition-section">
              <h4>Nutrition Notes</h4>
              <p>${nutritionText}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // 2. The Controls (Static, below card)
    const controls = document.createElement('div');
    controls.className = 'product-controls';
    controls.innerHTML = `
      ${dietaryHtml}
      <ul class="sizes-list">${sizeHtml}</ul>
      
      <div class="cart-actions">
        <div class="quantity-selector">
          <label for="qty-${product.id}">Qty</label>
          <input type="number" id="qty-${product.id}" class="qty-input" value="1" min="1" max="100">
        </div>
        
        <button class="add-to-cart-btn" ${product.soldOut ? 'disabled' : ''}>
          ${product.soldOut ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    `;

    container.appendChild(card);
    container.appendChild(controls);

    // Size selection handler
    const sizeItems = controls.querySelectorAll('.sizes-list li');
    sizeItems.forEach(item => {
      item.addEventListener('click', () => {
        sizeItems.forEach(li => li.classList.remove('selected'));
        item.classList.add('selected');
        container.dataset.selectedSize = item.dataset.sizeIndex;
        container.dataset.selectedPrice = item.dataset.price;
      });
    });

    // Pre-select first size
    if (sizeItems.length > 0) {
      sizeItems[0].classList.add('selected');
      container.dataset.selectedSize = '0';
      container.dataset.selectedPrice = sizeItems[0].dataset.price;
    }

    // Flip animation - Click anywhere on card
    card.addEventListener('click', () => {
      console.log('Card clicked, toggling flip for:', product.name);
      card.classList.toggle('flipped');
    });

    // Add to cart handler
    const addBtn = controls.querySelector('.add-to-cart-btn');
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (product.soldOut) return;
      
      const qty = parseInt(controls.querySelector('.qty-input').value);
      const sizeIndex = parseInt(container.dataset.selectedSize);
      const selectedSize = product.sizes[sizeIndex];
      
      // Check dietary checkboxes
      const gfCheckbox = controls.querySelector('.gf-checkbox');
      const sfCheckbox = controls.querySelector('.sf-checkbox');
      const isGF = gfCheckbox?.checked || false;
      const isSF = sfCheckbox?.checked || false;
      
      // Add to cart using the cart.js API
      if (typeof window.addSimpleProductToCart === 'function') {
        const itemName = `${product.name} (${selectedSize.name})`;
        const cart = JSON.parse(localStorage.getItem('yfhs_cart') || '[]');
        
        // No price modifications - dietary options are free
        const finalPrice = selectedSize.price;
        const dietaryModifiers = [];
        if (isGF) dietaryModifiers.push('GF');
        if (isSF) dietaryModifiers.push('SF');
        
        const displayName = dietaryModifiers.length > 0 
          ? `${itemName} [${dietaryModifiers.join(', ')}]`
          : itemName;
        
        // Find existing item with same options
        const existingIndex = cart.findIndex(item => 
          item.name === product.name && 
          item.size === selectedSize.name &&
          item.isGF === isGF &&
          item.isSF === isSF
        );
        
        if (existingIndex > -1) {
          cart[existingIndex].quantity += qty;
        } else {
          cart.push({
            name: product.name,
            category: product.category,
            size: selectedSize.name,
            price: finalPrice,
            quantity: qty,
            isGF: isGF,
            isSF: isSF
          });
        }
        
        localStorage.setItem('yfhs_cart', JSON.stringify(cart));
        
        // Update cart count and show toast
        if (typeof window.updateCartCount === 'function') {
          window.updateCartCount();
        }
        
        if (typeof window.showToast === 'function') {
          window.showToast(`Added ${qty}x ${displayName} to cart!`, 'success');
        } else {
          alert(`Added ${qty} × ${displayName} to cart!`);
        }
      }
    });

    return container;
  }

  // Render all products
  renderAll() {
    this.container.innerHTML = '';
    this.products.forEach(product => {
      this.container.appendChild(this.createCard(product));
    });
    console.log(`Rendered ${this.products.length} products`);
  }

  // Render specific category
  renderCategory(category) {
    const filtered = this.getByCategory(category);
    this.container.innerHTML = '';
    filtered.forEach(product => {
      this.container.appendChild(this.createCard(product));
    });
    console.log(`Rendered ${filtered.length} products in category: ${category}`);
  }
}

// Global initialization
window.renderProducts = async function(containerId, category = null) {
  const renderer = new SimpleProductRenderer(containerId);
  const loaded = await renderer.load();
  
  if (!loaded) {
    console.error('Could not initialize product renderer');
    return;
  }
  
  if (category) {
    renderer.renderCategory(category);
  } else {
    renderer.renderAll();
  }
};
