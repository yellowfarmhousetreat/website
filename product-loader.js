// product-loader.js
// Fetches structured product data (JSON), renders cards, and syncs with cart logic

class ProductLoader {
    constructor(options = {}) {
        this.dataUrl = options.dataUrl || 'data/products-data.json';
        this.cacheKey = options.cacheKey || 'yfhs_product_payload';
        this.cacheMetaKey = `${this.cacheKey}_meta`;
        this.cacheTtlMs = options.cacheTtlMs || (1000 * 60 * 30); // 30 minutes
        this.products = [];
        this.dietaryPricing = {};
        this.metadata = {};
        this.ordersPaused = false;
        this.dataPromise = null;
    }

    async ready(forceRefresh = false) {
        if (!this.dataPromise || forceRefresh) {
            this.dataPromise = this.loadData(forceRefresh);
        }
        return this.dataPromise;
    }

    async loadData(forceRefresh = false) {
        if (!forceRefresh) {
            const cached = this.getCachedData();
            if (cached) {
                this.applyData(cached);
                return cached;
            }
        }

        const response = await fetch(this.dataUrl, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('Failed to load product catalog.');
        }

        const payload = await response.json();
        this.applySiteConfig(payload);
        this.applyData(payload);
        this.setCachedData(payload);
        return payload;
    }

    applySiteConfig(payload) {
        if (!window.siteConfig || typeof window.siteConfig.get !== 'function') {
            this.ordersPaused = false;
            return;
        }

        const config = window.siteConfig.get();
        this.ordersPaused = Boolean(config.ordersPaused);
        const soldOutIds = Array.isArray(config.soldOutProducts) ? config.soldOutProducts : [];

        if (Array.isArray(payload.products)) {
            payload.products = payload.products.map(product => ({
                ...product,
                soldOut: soldOutIds.includes(product.id)
            }));
        }
    }

    applyData(payload) {
        this.products = Array.isArray(payload.products) ? payload.products : [];
        this.dietaryPricing = payload.dietaryPricing || {};
        this.metadata = payload.metadata || {};

        // Maintain backwards compatibility for scripts that relied on globals
        window.PRODUCTS = this.products;
        window.DIETARY_PRICING = this.dietaryPricing;
        window.PRODUCTS_VERSION = payload.version || null;
    }

    getCachedData() {
        try {
            const rawMeta = localStorage.getItem(this.cacheMetaKey);
            const rawPayload = localStorage.getItem(this.cacheKey);
            if (!rawMeta || !rawPayload) return null;

            const meta = JSON.parse(rawMeta);
            if (!meta || !meta.cachedAt || (Date.now() - meta.cachedAt) > this.cacheTtlMs) {
                this.clearCache();
                return null;
            }

            return JSON.parse(rawPayload);
        } catch (error) {
            console.warn('Product data cache unavailable:', error);
            return null;
        }
    }

    setCachedData(payload) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(payload));
            localStorage.setItem(this.cacheMetaKey, JSON.stringify({ cachedAt: Date.now() }));
        } catch (error) {
            console.warn('Unable to cache product data:', error);
            this.clearCache();
        }
    }

    clearCache() {
        try {
            localStorage.removeItem(this.cacheKey);
            localStorage.removeItem(this.cacheMetaKey);
        } catch (error) {
            console.warn('Unable to clear product cache:', error);
        }
    }

    async loadProducts(category = 'all') {
        await this.ready();

        const container = document.getElementById('products-container');
        if (!container) {
            console.error('Products container not found');
            return;
        }

        if (category === 'all' && container.dataset.category) {
            category = container.dataset.category;
        }

        const products = category === 'all'
            ? this.products
            : this.products.filter(product => product.category === category);

        container.innerHTML = '';

        if (this.ordersPaused) {
            const pausedBanner = document.createElement('div');
            pausedBanner.className = 'orders-paused-banner';
            pausedBanner.textContent = 'Ordering is temporarily paused. Please check back soon.';
            container.appendChild(pausedBanner);
        }

        if (!products.length) {
            const emptyState = document.createElement('p');
            emptyState.className = 'empty-products';
            emptyState.textContent = 'No products available in this category yet.';
            container.appendChild(emptyState);
            return;
        }

        const gridWrapper = document.createElement('div');
        gridWrapper.className = 'products-grid';

        products.forEach(product => {
            const card = this.generateProductCard(product);
            gridWrapper.appendChild(card);
        });

        container.appendChild(gridWrapper);
        this.initializeEventListeners();
        this.notifyProductCardsRendered(category, products.length);
    }

    generateProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.productId = product.id;

        const sizeOptions = (product.sizes || []).map((size, index) =>
            `<option value="${index}" data-price="${size.price}">${size.name} - $${size.price}</option>`
        ).join('');

        const dietaryOptions = this.generateDietaryOptions(product);
        const shippingBadge = product.shippable
            ? '<div class="shipping-badge"><span class="icon solid fa-truck"></span> Ships Nationwide</div>'
            : '';

        const shippingDetails = product.shippable
            ? '<div class="shipping-info"><span class="icon solid fa-truck"></span>Ships to select ZIP codes within 2-5 days.</div>'
            : '';

        const unavailable = this.ordersPaused || product.soldOut;
        const buttonLabel = product.soldOut
            ? 'Sold Out'
            : this.ordersPaused
                ? 'Orders Paused'
                : 'Add to Cart';

        const availabilityNote = product.soldOut
            ? '<p class="product-status">Currently sold out.</p>'
            : '';

        card.innerHTML = `
            ${shippingBadge}
            <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='images/placeholder.jpg'">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description || ''}</p>
                ${product.ingredients ? `<div class="ingredients-info"><strong>Ingredients:</strong> ${product.ingredients}</div>` : ''}
                ${product.allergens && product.allergens.length ? `<div class="allergen-info"><strong>Contains:</strong> ${product.allergens.join(', ')}</div>` : ''}
                ${shippingDetails}
                <div class="legal-disclaimer"><small><strong>Idaho Home Kitchen:</strong> This product was produced in a home kitchen not subject to public health inspection that may also process common food allergens.</small></div>
                ${availabilityNote}
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
                    <button class="add-to-cart-btn" ${unavailable ? 'disabled' : ''} data-product-id="${product.id}">
                        ${buttonLabel}
                    </button>
                </div>
            </div>
        `;

        return card;
    }

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

    initializeEventListeners() {
        document.querySelectorAll('.size-selector').forEach(selector => {
            selector.addEventListener('change', (event) => {
                this.updateDisplayPrice(event.target);
            });
        });

        document.querySelectorAll('.dietary-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                const sizeSelector = event.target.closest('.product-card').querySelector('.size-selector');
                this.updateDisplayPrice(sizeSelector);
            });
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.dataset.productId;
                this.addToCart(productId);
            });
        });
    }

    updateDisplayPrice(sizeSelector) {
        if (!sizeSelector) return;
        const productCard = sizeSelector.closest('.product-card');
        const selectedOption = sizeSelector.selectedOptions[0];
        if (!selectedOption) return;

        const basePrice = parseFloat(selectedOption.dataset.price);
        let dietaryTotal = 0;
        productCard.querySelectorAll('.dietary-options input[type="checkbox"]:checked').forEach(checkbox => {
            dietaryTotal += parseFloat(checkbox.dataset.price || '0');
        });

        const totalPrice = basePrice + dietaryTotal;
        const priceTarget = productCard.querySelector('.current-price');
        if (priceTarget) {
            priceTarget.textContent = `$${totalPrice.toFixed(2)}`;
        }
    }

    async addToCart(productId) {
        if (this.ordersPaused) {
            this.showMessage('Ordering is paused. Please check back soon.', 'error');
            return;
        }

        await this.ready();

        const product = this.products.find(item => item.id === productId);
        if (!product) {
            this.showMessage('Product not found.', 'error');
            return;
        }

        if (product.soldOut) {
            this.showMessage('This product is currently sold out.', 'error');
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

    showMessage(message, type = 'success') {
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
        setTimeout(() => (toast.style.opacity = '1'), 100);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    notifyProductCardsRendered(category, count) {
        try {
            const detail = { category, count };
            document.dispatchEvent(new CustomEvent('yf:product-cards-rendered', { detail }));
        } catch (error) {
            console.warn('Unable to dispatch product card event', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.productLoader = new ProductLoader();
    const container = document.getElementById('products-container');

    if (container) {
        window.productLoader.loadProducts().catch(error => {
            console.error('Unable to load products:', error);
            container.innerHTML = '<p class="error">Unable to load products right now. Please refresh the page.</p>';
        });
    }
});
