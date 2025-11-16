// cart.js
// Cart logic for Yellow Farmhouse Stand

function getCart() {
    const cart = localStorage.getItem('yfhs_cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('yfhs_cart', JSON.stringify(cart));
}

function addToCart(name, price, gfId, sfId, qtyId) {
    const cart = getCart();
    const quantity = parseInt(document.getElementById(qtyId).value) || 1;
    const glutenFree = document.getElementById(gfId).checked;
    const sugarFree = document.getElementById(sfId).checked;
    // Check if item already exists (same name, GF/SF)
    const idx = cart.findIndex(item => item.name === name && item.glutenFree === glutenFree && item.sugarFree === sugarFree);
    if (idx > -1) {
        cart[idx].quantity += quantity;
    } else {
        cart.push({ name, price, glutenFree, sugarFree, quantity });
    }
    saveCart(cart);
    updateCartCount();
    alert('Added to cart!');
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    // Optionally update a cart count badge
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = count;
}

function renderCart() {
    const cart = getCart();
    const cartItemsDiv = document.getElementById('cart-items');
    if (!cartItemsDiv) return;
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
        document.getElementById('cart-total').textContent = '0.00';
        return;
    }
    let html = '<ul class="cart-list">';
    let total = 0;
    cart.forEach((item, idx) => {
        const gf = item.glutenFree ? 'GF' : '';
        const sf = item.sugarFree ? 'SF' : '';
        html += `<li>${item.name} ${gf} ${sf} - $${item.price} x ${item.quantity} <button onclick="removeFromCart(${idx})">Remove</button></li>`;
        total += item.price * item.quantity;
    });
    html += '</ul>';
    cartItemsDiv.innerHTML = html;
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    updateCartCount();
    // PayPal checkout button (dummy)
    const paypalBtn = document.getElementById('paypal-checkout');
    if (paypalBtn) {
        paypalBtn.onclick = function() {
            alert('Redirecting to PayPal...');
            // Integrate PayPal checkout here
        };
    }
});
