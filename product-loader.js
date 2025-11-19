// product-loader.js
// Dynamic product loading system for Yellow Farmhouse Treats
// Loads products from products-data.js and renders them based on category

class ProductLoader {
    constructor() {
        this.products = window.PRODUCTS || [];
        this.dietaryPricing = window.DIETARY_PRICING || {};
    }

    // Load products for a specific category
    loadProducts(category = 'all') {
        const container = document.getElementById('products-container');
        if (!container) {
            console.error('Products container not found');
            return;
        }

        // Get category from data attribute if not provided
        if (category === 'all' && container.dataset.category) {
            category = container.dataset.category;
        }

        // Filter products by category
        let filteredProducts = this.products;
        if (category !== 'all') {
            filteredProducts = this.products.filter(product => product.category === category);
        }

        // Clear container
        container.innerHTML = '';

        // Add products grid wrapper
        const gridWrapper = document.createElement('div');
        gridWrapper.className = 'products-grid';

        // Render products
        filteredProducts.forEach(product => {
            const productCard = this.generateProductCard(product);
            gridWrapper.appendChild(productCard);
        });

        container.appendChild(gridWrapper);

        // Initialize event listeners
        this.initializeEventListeners();
    }

    // Generate HTML for a single product card
    generateProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.productId = product.id;

        const sizeOptions = product.sizes.map((size, index) => 
            `<option value="${index}" data-price="${size.price}">${size.name} - $${size.price}</option>`
        ).join('');

        const dietaryOptions = this.generateDietaryOptions(product);

        card.innerHTML = `
            ${product.shippable ? '<div class="shipping-badge"><span class="icon">🚚</span>We Ship!</div>' : ''}
            <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='images/placeholder.jpg'">
            <div class="product-info">
                <h3>${product.name} ${product.emoji || ''}</h3>
                <p>${product.description}</p>
                ${product.ingredients ? `<div class="ingredients-info"><strong>Ingredients:</strong> ${product.ingredients}</div>` : ''}
                ${product.allergens && product.allergens.length > 0 ? `<div class="allergen-info"><strong>Contains:</strong> ${product.allergens.join(', ')}</div>` : ''}
                ${product.shippable ? '<div class="shipping-info"><span>🚚</span>Ships to 48 US states • 2-5 days • Fresh arrival guaranteed</div>' : ''}
                <div class="legal-disclaimer"><small><strong>Idaho Home Kitchen:</strong> This product was produced in a home kitchen not subject to public health inspection that may also process common food allergens.</small></div>
                <div class="product-details">
                    <div class="size-price-selector">
                        <label for="${product.id}-size">Size & Price:</label>
                        <select id="${product.id}-size" class="size-selector">
                            ${sizeOptions}
                        </select>
                    </div>
                    ${dietaryOptions}
                    <div class="quantity-selector">
                        <label for="${product.id}-qty">Quantity:</label>
                        <input type="number" id="${product.id}-qty" class="qty-input" min="1" max="10" value="1">
                    </div>
                    <button class="add-to-cart-btn" onclick="productLoader.addToCart('${product.id}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    // Generate dietary options HTML
    generateDietaryOptions(product) {
        if (!product.dietary) return '';

        let optionsHTML = '<div class="dietary-options">';
        
        if (product.dietary.glutenFree) {
            optionsHTML += `
                <label class="dietary-option">
                    <input type="checkbox" id="${product.id}-gf" data-price="${this.dietaryPricing.glutenFree || 0}">
                    Gluten Free (+$${this.dietaryPricing.glutenFree || 0})
                </label>
            `;
        }
        
        if (product.dietary.sugarFree) {
            optionsHTML += `
                <label class="dietary-option">
                    <input type="checkbox" id="${product.id}-sf" data-price="${this.dietaryPricing.sugarFree || 0}">
                    Sugar Free (+$${this.dietaryPricing.sugarFree || 0})
                </label>
            `;
        }
        
        if (product.dietary.vegan) {
            optionsHTML += `
                <label class="dietary-option">
                    <input type="checkbox" id="${product.id}-vegan" data-price="${this.dietaryPricing.vegan || 0}">
                    Vegan (+$${this.dietaryPricing.vegan || 0})
                </label>
            `;
        }

        optionsHTML += '</div>';
        return optionsHTML;
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Update price when size changes
        document.querySelectorAll('.size-selector').forEach(selector => {
            selector.addEventListener('change', (e) => {
                this.updateDisplayPrice(e.target);
            });
        });

        // Update price when dietary options change
        document.querySelectorAll('.dietary-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const sizeSelector = e.target.closest('.product-card').querySelector('.size-selector');
                this.updateDisplayPrice(sizeSelector);
            });
        });
    }

    // Update displayed price based on selections
    updateDisplayPrice(sizeSelector) {
        const productCard = sizeSelector.closest('.product-card');
        const selectedOption = sizeSelector.selectedOptions[0];
        const basePrice = parseFloat(selectedOption.dataset.price);
        
        // Calculate dietary additions
        let dietaryTotal = 0;
        productCard.querySelectorAll('.dietary-options input[type="checkbox"]:checked').forEach(checkbox => {
            dietaryTotal += parseFloat(checkbox.dataset.price);
        });

        // Update price display (you can add a price display element if needed)
        const totalPrice = basePrice + dietaryTotal;
        
        // You could add a price display element here
        // const priceDisplay = productCard.querySelector('.current-price');
        // if (priceDisplay) {
        //     priceDisplay.textContent = `$${totalPrice.toFixed(2)}`;
        // }
    }

    // Add product to cart
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            console.error('Product not found:', productId);
            return;
        }

        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (!productCard) {
            console.error('Product card not found for', productId);
            return;
        }

        const sizeSelector = productCard.querySelector('.size-selector');
        const qtyInput = productCard.querySelector('.qty-input');
        
        const selectedSizeIndex = parseInt(sizeSelector.value, 10);
        const selectedSize = product.sizes[selectedSizeIndex];
        if (!selectedSize) {
            this.showMessage('Please choose a size option.', 'error');
            return;
        }

        let unitPrice = selectedSize.price;
        const dietaryOptions = [];
        productCard.querySelectorAll('.dietary-options input[type="checkbox"]:checked').forEach(checkbox => {
            const optionName = checkbox.id.split('-').pop();
            dietaryOptions.push(optionName);
            unitPrice += parseFloat(checkbox.dataset.price || '0');
        });

        let quantity = parseInt(qtyInput.value, 10);
        if (isNaN(quantity) || quantity < 1) {
            quantity = 1;
            qtyInput.value = '1';
        }

        const flags = {
            glutenFree: dietaryOptions.includes('gf'),
            sugarFree: dietaryOptions.includes('sf'),
            vegan: dietaryOptions.includes('vegan')
        };

        const cartItem = {
            id: productId,
            name: `${product.name} (${selectedSize.name})`,
            baseName: product.name,
            size: selectedSize.name,
            price: unitPrice,
            quantity,
            glutenFree: flags.glutenFree,
            sugarFree: flags.sugarFree,
            vegan: flags.vegan,
            isGF: flags.glutenFree,
            isSF: flags.sugarFree,
            isVegan: flags.vegan
        };

        this.saveCartItem(cartItem);
    }

    saveCartItem(cartItem) {
        try {
            const cart = JSON.parse(localStorage.getItem('yfhs_cart') || '[]');
            const matchIndex = cart.findIndex(item =>
                item &&
                item.name === cartItem.name &&
                Boolean(item.glutenFree) === cartItem.glutenFree &&
                Boolean(item.sugarFree) === cartItem.sugarFree
            );

            if (matchIndex > -1) {
                cart[matchIndex].quantity += cartItem.quantity;
            } else {
                cart.push(cartItem);
            }

            localStorage.setItem('yfhs_cart', JSON.stringify(cart));

            if (typeof updateCartCount === 'function') {
                updateCartCount();
            }

            this.showMessage(`Added ${cartItem.quantity} ${cartItem.name} to cart!`);
        } catch (error) {
            console.error('Failed to update cart', error);
            this.showMessage('Could not add item to cart. Please try again.', 'error');
        }
    }

    // Show success/error messages
    showMessage(message, type = 'success') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.style.opacity = '1', 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
}

// Initialize product loader when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.productLoader = new ProductLoader();
    
    // Auto-load products if products container exists
    const container = document.getElementById('products-container');
    if (container) {
        window.productLoader.loadProducts();
    }
});

// Make ProductLoader available globally
window.ProductLoader = ProductLoader;