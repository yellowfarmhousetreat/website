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
    card.className = 'flip-card';
    card.setAttribute('data-product-id', product.id);

    // Price calculation
    const prices = (product.sizes || []).map(s => s.price);
    const minPrice = prices.length ? Math.min(...prices) : 'TBD';
    const maxPrice = prices.length ? Math.max(...prices) : 'TBD';
    const priceDisplay = minPrice === maxPrice ? `$${minPrice}` : `$${minPrice}-$${maxPrice}`;

    // Size options
    const sizeHtml = (product.sizes || [])
      .map(s => `<li>${s.name}: $${s.price}</li>`)
      .join('');

    // Dietary tags
    const dietaryTags = [];
    if (product.dietary?.glutenFree) dietaryTags.push('GF');
    if (product.dietary?.sugarFree) dietaryTags.push('SF');
    if (product.dietary?.vegan) dietaryTags.push('V');
    const dietaryHtml = dietaryTags.length
      ? `<div class="dietary-tags">${dietaryTags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`
      : '';

    const soldOutBadge = product.soldOut ? '<div class="sold-out-badge">SOLD OUT</div>' : '';

    card.innerHTML = `
      <div class="flip-card-inner">
        <!-- FRONT -->
        <div class="flip-card-front">
          ${soldOutBadge}
          <img src="${product.image}" alt="${product.name}" class="product-image">
          <div class="product-info-front">
            <h3 class="product-name">${product.name}</h3>
            ${dietaryHtml}
            <p class="product-description">${product.description}</p>
            <div class="price-section">
              <span class="price">${priceDisplay}</span>
            </div>
            <ul class="sizes-list">${sizeHtml}</ul>
            <button class="add-to-cart-btn" ${product.soldOut ? 'disabled' : ''}>
              ${product.soldOut ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <div class="flip-hint">Click to see ingredients</div>
          </div>
        </div>
        <!-- BACK -->
        <div class="flip-card-back">
          <div class="back-content">
            <h4>Ingredients & Allergens</h4>
            <div class="allergen-warning">
              Made in a kitchen that processes: nuts, dairy, gluten
            </div>
            <div class="ingredients-section">
              <p class="ingredients">${product.ingredients || 'Ingredients information not available'}</p>
            </div>
            <div class="allergen-info">
              <strong>Contains:</strong> ${product.allergens || 'See package for details'}
            </div>
            <div class="flip-hint">Click to return</div>
          </div>
        </div>
      </div>
    `;

    // Flip animation
    card.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart-btn')) return;
      card.classList.toggle('flipped');
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
