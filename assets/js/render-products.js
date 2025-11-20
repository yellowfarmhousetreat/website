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
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);

    // Dietary options as checkboxes (default unchecked - opt-in)
    let dietaryHtml = '';
    if (product.dietary?.glutenFree || product.dietary?.sugarFree) {
      dietaryHtml = '<div class="dietary-options">';
      if (product.dietary?.glutenFree) {
        dietaryHtml += `<label class="dietary-checkbox"><input type="checkbox" class="gf-checkbox"> Gluten-Free (+$3)</label>`;
      }
      if (product.dietary?.sugarFree) {
        dietaryHtml += `<label class="dietary-checkbox"><input type="checkbox" class="sf-checkbox"> Sugar-Free (+$3)</label>`;
      }
      dietaryHtml += '</div>';
    }

    // Size options as clickable list items
    const sizeHtml = (product.sizes || [])
      .map((s, idx) => `<li data-size-index="${idx}" data-price="${s.price}">${s.name}: $${s.price}</li>`)
      .join('');

    const soldOutBadge = product.soldOut ? '<div class="sold-out-badge">SOLD OUT</div>' : '';
    
    // Handle image path - support both old 'image' property and new 'images.primary' structure
    const imagePath = product.images?.primary 
      ? `/images/products/${product.images.primary}`
      : product.image || '/images/placeholder.jpg';
    
    const imageAlt = product.images?.alt || product.name;
    
    // Handle ingredients - convert array to string if needed
    const ingredientsText = Array.isArray(product.ingredients)
      ? product.ingredients.join(', ')
      : product.ingredients || 'Ingredients information not available';
    
    // Handle allergens - format the allergens object
    const allergensText = product.allergens?.contains
      ? product.allergens.contains.join(', ')
      : product.allergens || 'See package for details';

    card.innerHTML = `
      <div class="product-card-inner">
        <!-- FRONT -->
        <div class="product-card-front">
          ${soldOutBadge}
          <img src="${imagePath}" alt="${imageAlt}" class="product-image">
          <div class="product-info-front">
            <h3 class="product-name">${product.name}</h3>
            
            ${dietaryHtml}
            
            <ul class="sizes-list">${sizeHtml}</ul>
            
            <button class="add-to-cart-btn" ${product.soldOut ? 'disabled' : ''}>
              ${product.soldOut ? 'Out of Stock' : 'Add to Cart'}
            </button>
            
            <div class="quantity-selector">
              <label for="qty-${product.id}">Qty:</label>
              <input type="number" id="qty-${product.id}" class="qty-input" value="1" min="1" max="100">
            </div>
            
            <p class="product-description">${product.description}</p>
            
            <div class="info-toggle" role="button" tabindex="0" aria-label="View ingredients"></div>
          </div>
        </div>

        <!-- BACK -->
        <div class="product-card-back">
          <div class="back-content">
            <h4>Ingredients & Allergens</h4>
            <div class="allergen-warning">
              Made in a kitchen that processes: nuts, dairy, gluten
            </div>
            <div class="ingredients-section">
              <p class="ingredients">${ingredientsText}</p>
            </div>
            <div class="allergen-info">
              <strong>Contains:</strong> ${allergensText}
            </div>
            <div class="info-toggle" role="button" tabindex="0" aria-label="Return to front"></div>
          </div>
        </div>
      </div>
    `;

    // Size selection handler
    const sizeItems = card.querySelectorAll('.sizes-list li');
    sizeItems.forEach(item => {
      item.addEventListener('click', () => {
        sizeItems.forEach(li => li.classList.remove('selected'));
        item.classList.add('selected');
        card.dataset.selectedSize = item.dataset.sizeIndex;
        card.dataset.selectedPrice = item.dataset.price;
      });
    });

    // Pre-select first size
    if (sizeItems.length > 0) {
      sizeItems[0].classList.add('selected');
      card.dataset.selectedSize = '0';
      card.dataset.selectedPrice = sizeItems[0].dataset.price;
    }

    // Flip animation - only flip when clicking info toggle, not the whole card
    const infoToggles = card.querySelectorAll('.info-toggle');
    infoToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.toggle('flipped');
      });
      
      // Keyboard accessibility
      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.classList.toggle('flipped');
        }
      });
    });

    // Add to cart handler
    const addBtn = card.querySelector('.add-to-cart-btn');
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (product.soldOut) return;
      
      const qty = parseInt(card.querySelector('.qty-input').value);
      const sizeIndex = parseInt(card.dataset.selectedSize);
      const selectedSize = product.sizes[sizeIndex];
      
      // Check dietary checkboxes (default to both checked)
      const gfCheckbox = card.querySelector('.gf-checkbox');
      const sfCheckbox = card.querySelector('.sf-checkbox');
      const isGF = gfCheckbox?.checked || false;
      const isSF = sfCheckbox?.checked || false;
      
      // Add to cart using the cart.js API
      if (typeof window.addSimpleProductToCart === 'function') {
        const itemName = `${product.name} (${selectedSize.name})`;
        const cart = JSON.parse(localStorage.getItem('yfhs_cart') || '[]');
        
        // Calculate price with dietary modifications
        let finalPrice = selectedSize.price;
        const dietaryModifiers = [];
        if (isGF && product.dietary?.glutenFree) {
          dietaryModifiers.push('GF');
          finalPrice += 3;
        }
        if (isSF && product.dietary?.sugarFree) {
          dietaryModifiers.push('SF');
          finalPrice += 3;
        }
        
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

    return card;
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
