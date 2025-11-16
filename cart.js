// cart.js
// Cart logic for Yellow Farmhouse Stand

// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getCart() {
    try {
        const cart = localStorage.getItem('yfhs_cart');
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error('Error reading cart:', e);
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
    const glutenFree = document.getElementById(gfId).checked;
    const sugarFree = document.getElementById(sfId).checked;
    
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

function removeFromCart(index) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
        const item = cart[index];
        cart.splice(index, 1);
        saveCart(cart);
        renderCart();
        updateCartCount();
        showToast(`Removed ${item.name} from cart.`);
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

