/**
 * Flip Card Product Renderer
 * Renders products with flip animation showing product info on front,
 * ingredients & allergens on back
 */

class FlipCardRenderer {
  constructor(containerId, productsDataUrl = '/data/products-data.json') {
    this.container = document.getElementById(containerId);
    this.productsDataUrl = productsDataUrl;
    this.products = [];
  }

  async init() {
    try {
      const response = await fetch(this.productsDataUrl);
      const data = await response.json();
      this.products = data.products;
    } catch (error) {
      console.error('Failed to load products data:', error);
    }
  }

  filterByCategory(category) {
    return this.products.filter(p => p.category === category);
  }

  renderCard(product) {
    const card = document.createElement('div');
    card.className = 'flip-card';
    card.setAttribute('data-product-id', product.id);

    // Get min and max price from sizes
    const prices = product.sizes.map(s => s.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceDisplay = minPrice === maxPrice ? `$${minPrice}` : `$${minPrice}-$${maxPrice}`;

    // Build size options display
    const sizeOptionsHtml = product.sizes
      .map(s => `<li>${s.name}: $${s.price}</li>`)
      .join('');

    // Build dietary tags
    const dietaryTags = [];
    if (product.dietary?.glutenFree) dietaryTags.push('GF');
    if (product.dietary?.sugarFree) dietaryTags.push('SF');
    if (product.dietary?.vegan) dietaryTags.push('V');
    const dietaryHtml = dietaryTags.length > 0
      ? `<div class="dietary-tags">${dietaryTags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`
      : '';

    // Sold out badge
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
            <ul class="sizes-list">${sizeOptionsHtml}</ul>
            <button class="add-to-cart-btn" onclick="addToCart('${product.id}')" ${product.soldOut ? 'disabled' : ''}>
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

    // Add flip animation listener
    card.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart-btn')) return; // Don't flip on button click
      card.classList.toggle('flipped');
    });

    return card;
  }

  renderProducts(products) {
    this.container.innerHTML = '';
    products.forEach(product => {
      const card = this.renderCard(product);
      this.container.appendChild(card);
    });
  }

  renderByCategory(category) {
    const filteredProducts = this.filterByCategory(category);
    this.renderProducts(filteredProducts);
  }

  renderAll() {
    this.renderProducts(this.products);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FlipCardRenderer;
}
