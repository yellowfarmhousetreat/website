// cart.js
// Cart logic for Yellow Farmhouse Stand

// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    // Security: Double sanitization - input validation + safe DOM insertion
    const sanitizedMessage = String(message).replace(/[<>&"']/g, '').substring(0, 200);
    // Use textContent (not innerHTML) to prevent XSS injection
    toast.textContent = sanitizedMessage;
    
    // Validate toast element before DOM insertion
    if (toast.textContent === sanitizedMessage && document.body) {
        document.body.appendChild(toast);
    }
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getCart() {
    try {
        const cart = localStorage.getItem('yfhs_cart');
        if (!cart) return [];
        
        const parsedCart = JSON.parse(cart);
        
        // Validate and sanitize cart data
        if (!Array.isArray(parsedCart)) return [];
        
        return parsedCart.filter(item => {
            // Basic validation - ensure required fields exist and are valid types
            return item && 
                   typeof item.name === 'string' && item.name.length > 0 &&
                   typeof item.price === 'number' && item.price > 0 &&
                   typeof item.quantity === 'number' && item.quantity > 0;
        }).map(item => ({
            // Advanced sanitization - strip ALL potentially dangerous characters
            name: String(item.name).replace(/[^\w\s\-().]/g, '').substring(0, 100),
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity),
            glutenFree: Boolean(item.glutenFree),
            sugarFree: Boolean(item.sugarFree),
            size: item.size ? String(item.size).replace(/[^\w\s\-().]/g, '').substring(0, 50) : undefined
        }));
    } catch (e) {
        console.error('Error reading cart:', e);
        // Clear potentially corrupted cart data
        localStorage.removeItem('yfhs_cart');
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem('yfhs_cart', JSON.stringify(cart));
    } catch (e) {
        console.error('Error saving cart:', e);
        showToast('Error saving cart. Please try again.', 'error');
    }
}

// Validate price format
function isValidPrice(price) {
    const num = parseFloat(price);
    return !isNaN(num) && num > 0;
}

function addToCart(name, price, gfId, sfId, qtyId) {
    // Validate inputs
    if (!name || !isValidPrice(price)) {
        showToast('Invalid product information.', 'error');
        return;
    }
    
    const qtyInput = document.getElementById(qtyId);
    const quantity = parseInt(qtyInput.value);
    
    // Validate quantity
    if (isNaN(quantity) || quantity < 1) {
        qtyInput.value = 1;
        showToast('Quantity must be at least 1.', 'error');
        return;
    }
    
    const cart = getCart();
    const glutenFree = gfId ? !!(document.getElementById(gfId) && document.getElementById(gfId).checked) : false;
    const sugarFree = sfId ? !!(document.getElementById(sfId) && document.getElementById(sfId).checked) : false;
    
    // Check if item already exists (same name, GF/SF)
    const idx = cart.findIndex(item => 
        item.name === name && 
        item.glutenFree === glutenFree && 
        item.sugarFree === sugarFree
    );
    
    if (idx > -1) {
        cart[idx].quantity += quantity;
    } else {
        cart.push({ 
            name, 
            price: parseFloat(price), 
            glutenFree, 
            sugarFree, 
            quantity 
        });
    }
    
    saveCart(cart);
    updateCartCount();
    showToast(`Added ${quantity}x ${name} to cart!`);
    qtyInput.value = 1;
}

// New function for cookies with size/quantity options
function addCookiesToCart(name, sizeRadioName, gfId, sfId, qtyId) {
    // Get selected size
    const sizeRadio = document.querySelector(`input[name="${sizeRadioName}"]:checked`);
    if (!sizeRadio) {
        showToast('Please select a size.', 'error');
        return;
    }
    
    const price = parseFloat(sizeRadio.getAttribute('data-price'));
    const sizeLabel = sizeRadio.parentElement.textContent.trim();
    
    if (!isValidPrice(price)) {
        showToast('Invalid price information.', 'error');
        return;
    }
    
    const qtyInput = document.getElementById(qtyId);
    const quantity = parseInt(qtyInput.value);
    
    // Validate quantity
    if (isNaN(quantity) || quantity < 1) {
        qtyInput.value = 1;
        showToast('Quantity must be at least 1.', 'error');
        return;
    }
    
    const cart = getCart();
    const glutenFree = gfId ? !!(document.getElementById(gfId) && document.getElementById(gfId).checked) : false;
    const sugarFree = sfId ? !!(document.getElementById(sfId) && document.getElementById(sfId).checked) : false;
    
    // Create unique item name with size
    const itemName = `${name} (${sizeLabel.split(' - ')[0].trim()})`;
    
    // Check if item already exists (same name, size, GF/SF)
    const idx = cart.findIndex(item => 
        item.name === itemName && 
        item.glutenFree === glutenFree && 
        item.sugarFree === sugarFree
    );
    
    if (idx > -1) {
        cart[idx].quantity += quantity;
    } else {
        cart.push({ 
            name: itemName, 
            price: price, 
            glutenFree, 
            sugarFree, 
            quantity 
        });
    }
    
    saveCart(cart);
    updateCartCount();
    showToast(`Added ${quantity}x ${itemName} to cart!`);
    qtyInput.value = 1;
}

// Helpers for menu page additions
function getSelectedRadioByName(name) {
    return document.querySelector(`input[name="${name}"]:checked`);
}

function ensureMinQty(qtyId) {
    const el = document.getElementById(qtyId);
    let q = parseInt(el && el.value ? el.value : 1, 10);
    if (isNaN(q) || q < 1) q = 1;
    if (el) el.value = q;
    return q;
}

// Generic sized product (e.g., Mini Cakes, Pretzels, Cinnamon Rolls)
function addSizedProductToCart(name, sizeRadioName, qtyId) {
    const sel = getSelectedRadioByName(sizeRadioName);
    if (!sel) { showToast('Please choose a size.','error'); return; }
    const price = parseFloat(sel.value) || parseFloat(sel.getAttribute('data-price'));
    if (!isValidPrice(price)) { showToast('Invalid price information.','error'); return; }
    const sizeText = sel.parentElement ? sel.parentElement.textContent.trim() : '';
    const quantity = ensureMinQty(qtyId);

    const cart = getCart();
    const itemName = `${name} (${sizeText.split(' - ')[0].trim()})`;
    const idx = cart.findIndex(item => item.name === itemName);
    if (idx > -1) cart[idx].quantity += quantity; else cart.push({ name: itemName, price, quantity });
    saveCart(cart); updateCartCount(); showToast(`Added ${quantity}x ${itemName} to cart!`);
}

function addSimpleProductToCart(name, price, qtyId) {
    if (!isValidPrice(price)) { showToast('Invalid price information.','error'); return; }
    const quantity = ensureMinQty(qtyId);
    const cart = getCart();
    const idx = cart.findIndex(i => i.name === name && i.price === price);
    if (idx > -1) cart[idx].quantity += quantity; else cart.push({ name, price, quantity });
    saveCart(cart); updateCartCount(); showToast(`Added ${quantity}x ${name} to cart!`);
}

function addPieToCart(name, price, qtyId) {
    if (!isValidPrice(price)) { showToast('Invalid price information.','error'); return; }
    const quantity = ensureMinQty(qtyId);
    const cart = getCart();
    const idx = cart.findIndex(i => i.name === name && i.price === price);
    if (idx > -1) cart[idx].quantity += quantity; else cart.push({ name, price, quantity });
    saveCart(cart); updateCartCount(); showToast(`Added ${quantity}x ${name} to cart! ($5 deposit per item)`);
}

function addCrispToCart(name, price, gfId, sfId, qtyId) {
    if (!isValidPrice(price)) { showToast('Invalid price information.','error'); return; }
    const quantity = ensureMinQty(qtyId);
    const gf = gfId ? !!(document.getElementById(gfId) && document.getElementById(gfId).checked) : false;
    const sf = sfId ? !!(document.getElementById(sfId) && document.getElementById(sfId).checked) : false;
    const cart = getCart();
    const nameKey = `${name}${gf?' [GF]':''}${sf?' [SF]':''}`;
    const idx = cart.findIndex(i => i.name === nameKey && i.price === price);
    if (idx > -1) cart[idx].quantity += quantity; else cart.push({ name: nameKey, price, quantity, glutenFree: gf, sugarFree: sf });
    saveCart(cart); updateCartCount(); showToast(`Added ${quantity}x ${nameKey} to cart! ($5 deposit per item)`);
}

function addBrowniesToCart(name, price, gfId, qtyId) {
    if (!isValidPrice(price)) { showToast('Invalid price information.','error'); return; }
    const quantity = ensureMinQty(qtyId);
    const gf = gfId ? !!(document.getElementById(gfId) && document.getElementById(gfId).checked) : false;
    const cart = getCart();
    const nameKey = `${name}${gf?' [GF]':''}`;
    const idx = cart.findIndex(i => i.name === nameKey && i.price === price);
    if (idx > -1) cart[idx].quantity += quantity; else cart.push({ name: nameKey, price, quantity, glutenFree: gf });
    saveCart(cart); updateCartCount(); showToast(`Added ${quantity}x ${nameKey} to cart!`);
}

function addCupcakesToCart(name, sizeRadioName, gfId, sfId, qtyId) {
    const sel = getSelectedRadioByName(sizeRadioName);
    if (!sel) { showToast('Please choose Half Dozen or Dozen.','error'); return; }
    const price = parseFloat(sel.value) || parseFloat(sel.getAttribute('data-price'));
    if (!isValidPrice(price)) { showToast('Invalid price information.','error'); return; }
    const sizeText = sel.parentElement ? sel.parentElement.textContent.trim() : '';
    const quantity = ensureMinQty(qtyId);
    const gf = gfId ? !!(document.getElementById(gfId) && document.getElementById(gfId).checked) : false;
    const sf = sfId ? !!(document.getElementById(sfId) && document.getElementById(sfId).checked) : false;

    const cart = getCart();
    const itemName = `${name} (${sizeText.split(' - ')[0].trim()})${gf?' [GF]':''}${sf?' [SF]':''}`;
    const idx = cart.findIndex(i => i.name === itemName && i.price === price);
    if (idx > -1) cart[idx].quantity += quantity; else cart.push({ name: itemName, price, quantity, glutenFree: gf, sugarFree: sf });
    saveCart(cart); updateCartCount(); showToast(`Added ${quantity}x ${itemName} to cart!`);
}

function removeFromCart(index) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
        const item = cart[index];
        cart.splice(index, 1);
        saveCart(cart);
        renderCart();
        updateCartCount();
        // Sanitize item name to prevent XSS
        const sanitizedName = String(item.name || '').replace(/[<>&"']/g, '');
        showToast(`Removed ${sanitizedName} from cart.`);
    }
}

function clearCart() {
    if (confirm('Are you sure you want to clear your entire cart?')) {
        localStorage.removeItem('yfhs_cart');
        renderCart();
        updateCartCount();
        showToast('Cart cleared.');
    }
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;
}

function renderCart() {
    const cart = getCart();
    const cartItemsDiv = document.getElementById('cart-items');
    if (!cartItemsDiv) return;
    
    if (cart.length === 0) {
        cartItemsDiv.textContent = 'Your cart is empty.';
        const totalSpan = document.getElementById('cart-total');
        if (totalSpan) totalSpan.textContent = '0.00';
        return;
    }
    
    const ul = document.createElement('ul');
    ul.className = 'cart-list';
    let total = 0;
    
    cart.forEach((item, idx) => {
        // Validate item data
        if (!item.name || !isValidPrice(item.price) || item.quantity < 1) {
            return; // Skip invalid items
        }
        
        const li = document.createElement('li');
        const gf = item.glutenFree ? ' (GF)' : '';
        const sf = item.sugarFree ? ' (SF)' : '';
        const itemPrice = (item.price * item.quantity).toFixed(2);
        
        const itemText = document.createTextNode(
            `${item.name}${gf}${sf} - $${item.price} x ${item.quantity} = $${itemPrice}`
        );
        li.appendChild(itemText);
        
        const btn = document.createElement('button');
        btn.textContent = 'Remove';
        btn.setAttribute('aria-label', `Remove ${item.name} from cart`);
        btn.onclick = () => removeFromCart(idx);
        li.appendChild(btn);
        
        ul.appendChild(li);
        total += item.price * item.quantity;
    });
    
    cartItemsDiv.textContent = '';
    cartItemsDiv.appendChild(ul);
    
    const totalSpan = document.getElementById('cart-total');
    if (totalSpan) totalSpan.textContent = total.toFixed(2);
}

function initializePayPalButton() {
    const paypalBtn = document.getElementById('paypal-checkout');
    if (!paypalBtn) return;
    
    paypalBtn.onclick = function(e) {
        e.preventDefault();
        const cart = getCart();
        
        if (cart.length === 0) {
            showToast('Your cart is empty.', 'error');
            return;
        }
        
        // TODO: Integrate with PayPal SDK
        // For now, show a confirmation
        showToast('Redirecting to PayPal checkout...');
        console.log('Cart items for checkout:', cart);
        // window.location.href = 'https://www.paypal.com/...';
    };
}

document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    updateCartCount();
    initializePayPalButton();
});

