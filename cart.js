// cart.js
// Cart logic for Yellow Farmhouse Treats

// Undo system state management
const undoSystem = {
    actions: [], // Store recent actions for undo
    maxActions: 5, // Maximum number of undo actions to keep
    timeoutDuration: 10000, // 10 seconds to undo
    
    addAction(action) {
        // Add timestamp to action
        action.timestamp = Date.now();
        action.id = Math.random().toString(36).substr(2, 9);
        
        // Add to front of array
        this.actions.unshift(action);
        
        // Keep only recent actions
        if (this.actions.length > this.maxActions) {
            this.actions = this.actions.slice(0, this.maxActions);
        }
        
        // Clean up expired actions
        this.cleanupExpired();
    },
    
    cleanupExpired() {
        const now = Date.now();
        this.actions = this.actions.filter(action => 
            (now - action.timestamp) < this.timeoutDuration
        );
    },
    
    executeUndo(actionId) {
        const actionIndex = this.actions.findIndex(action => action.id === actionId);
        if (actionIndex === -1) {
            showToast('Undo action expired.', 'error');
            return false;
        }
        
        const action = this.actions[actionIndex];
        let success = false;
        
        try {
            switch (action.type) {
                case 'remove':
                    success = this.undoRemove(action);
                    break;
                case 'clear':
                    success = this.undoClear(action);
                    break;
            }
            
            if (success) {
                // Remove the action from undo history
                this.actions.splice(actionIndex, 1);
            }
        } catch (error) {
            console.error('Undo error:', error);
            showToast('Undo failed. Please try again.', 'error');
        }
        
        return success;
    },
    
    undoRemove(action) {
        const cart = getCart();
        
        // Restore the item at its original position
        if (action.index >= 0 && action.index <= cart.length) {
            cart.splice(action.index, 0, action.item);
        } else {
            // If original position is invalid, add to end
            cart.push(action.item);
        }
        
        saveCart(cart);
        renderCart();
        updateCartCount();
        
        const itemName = String(action.item.name || '').replace(/[<>&"']/g, '');
        showToast(`Restored ${itemName} to cart.`, 'success');
        return true;
    },
    
    undoClear(action) {
        // Restore the entire cart
        saveCart(action.cartData);
        renderCart();
        updateCartCount();
        
        const itemCount = action.cartData.length;
        showToast(`Restored ${itemCount} item${itemCount !== 1 ? 's' : ''} to cart.`, 'success');
        return true;
    }
};

// Enhanced toast notification system with undo support
function showToast(message, type = 'success', undoAction = null) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Security: Double sanitization - input validation + safe DOM insertion
    const sanitizedMessage = String(message).replace(/[<>&"']/g, '').substring(0, 200);
    
    // Create toast content container
    const messageContainer = document.createElement('div');
    messageContainer.className = 'toast-message';
    messageContainer.textContent = sanitizedMessage;
    toast.appendChild(messageContainer);
    
    // Add undo button if undo action is provided
    if (undoAction && undoAction.id) {
        const undoContainer = document.createElement('div');
        undoContainer.className = 'toast-undo-container';
        
        const undoButton = document.createElement('button');
        undoButton.className = 'toast-undo-btn';
        undoButton.textContent = 'Undo';
        undoButton.setAttribute('aria-label', 'Undo last action');
        undoButton.title = 'Click to undo this action';
        
        undoButton.onclick = (e) => {
            e.stopPropagation();
            const success = undoSystem.executeUndo(undoAction.id);
            if (success) {
                // Remove the toast immediately on successful undo
                toast.remove();
            }
        };
        
        undoContainer.appendChild(undoButton);
        toast.appendChild(undoContainer);
        
        // Add special styling for undo toasts
        toast.classList.add('toast-with-undo');
    }
    
    // Apply toast styling
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff4757' : type === 'warning' ? '#ffa502' : '#2ed573'};
        color: white;
        padding: ${undoAction ? '12px 16px' : '12px 20px'};
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        font-size: 14px;
        line-height: 1.4;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: ${undoAction ? '12px' : '0'};
        justify-content: ${undoAction ? 'space-between' : 'center'};
    `;
    
    // Add styles for undo button
    if (undoAction) {
        const style = document.createElement('style');
        style.textContent = `
            .toast-undo-btn {
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 4px 12px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
            }
            .toast-undo-btn:hover {
                background: rgba(255,255,255,0.3);
                border-color: rgba(255,255,255,0.5);
                transform: translateY(-1px);
            }
            .toast-undo-btn:active {
                transform: translateY(0);
            }
            .toast-message {
                flex: 1;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Validate toast element before DOM insertion
    if (document.body) {
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto-remove toast (longer duration for undo toasts)
        const duration = undoAction ? undoSystem.timeoutDuration : 3000;
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, duration);
    }
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
        
        // Store undo action before making changes
        const undoAction = {
            type: 'remove',
            item: { ...item }, // Create a copy of the item
            index: index
        };
        undoSystem.addAction(undoAction);
        
        // Remove item from cart
        cart.splice(index, 1);
        saveCart(cart);
        renderCart();
        updateCartCount();
        
        // Sanitize item name to prevent XSS
        const sanitizedName = String(item.name || '').replace(/[<>&"']/g, '');
        showToast(`Removed ${sanitizedName} from cart.`, 'warning', undoAction);
    }
}

function clearCart() {
    const cart = getCart();
    
    if (cart.length === 0) {
        showToast('Cart is already empty.', 'warning');
        return;
    }
    
    if (confirm('Are you sure you want to clear your entire cart?')) {
        // Store undo action before clearing
        const undoAction = {
            type: 'clear',
            cartData: [...cart] // Create a copy of the entire cart
        };
        undoSystem.addAction(undoAction);
        
        // Clear the cart
        localStorage.removeItem('yfhs_cart');
        renderCart();
        updateCartCount();
        
        const itemCount = cart.length;
        showToast(`Cleared ${itemCount} item${itemCount !== 1 ? 's' : ''} from cart.`, 'warning', undoAction);
    }
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = count;
        // Hide badge when count is 0
        badge.style.display = count > 0 ? 'inline' : 'none';
    }
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

