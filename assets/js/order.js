// Order page - load cart and display items
(function() {
    'use strict';

    // Load cart from localStorage
    function loadCartToOrder() {
        const cart = JSON.parse(localStorage.getItem('yfhs_cart') || '[]');
        const orderItemsDiv = document.getElementById('orderItems');
        const orderSummaryInput = document.getElementById('orderSummary');
        
        if (cart.length === 0) {
            orderItemsDiv.innerHTML = '<div class="empty-items">Your cart is empty. <a href="menu.html">Browse the menu</a> to add items.</div>';
            orderSummaryInput.value = '';
            updateOrderSummary(0, 0);
            return;
        }

        // Build visible cart display
        let itemsHTML = '<div class="cart-items-list">';
        let orderSummaryText = '';
        let subtotal = 0;

        // Create container for cart items using safe DOM methods
        const cartContainer = document.createElement('div');
        cartContainer.className = 'cart-items-list';

        cart.forEach((item, index) => {
            // Validate and sanitize item data
            const sanitizedItem = {
                name: String(item.name || '').replace(/[<>&"']/g, ''),
                size: String(item.size || '').replace(/[<>&"']/g, ''),
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 0,
                isGF: Boolean(item.isGF),
                isSF: Boolean(item.isSF)
            };

            if (sanitizedItem.quantity <= 0 || sanitizedItem.price <= 0) {
                return; // Skip invalid items
            }

            const itemTotal = sanitizedItem.price * sanitizedItem.quantity;
            subtotal += itemTotal;

            // Create cart item using safe DOM methods
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.dataset.index = index;

            const itemDetails = document.createElement('div');
            itemDetails.className = 'cart-item-details';

            const itemName = document.createElement('strong');
            itemName.textContent = sanitizedItem.name;
            itemDetails.appendChild(itemName);

            if (sanitizedItem.size) {
                const sizeSpan = document.createElement('span');
                sizeSpan.className = 'item-size';
                sizeSpan.textContent = sanitizedItem.size;
                itemDetails.appendChild(sizeSpan);
            }

            if (sanitizedItem.isGF) {
                const gfBadge = document.createElement('span');
                gfBadge.className = 'dietary-badge';
                gfBadge.textContent = 'GF';
                itemDetails.appendChild(gfBadge);
            }

            if (sanitizedItem.isSF) {
                const sfBadge = document.createElement('span');
                sfBadge.className = 'dietary-badge';
                sfBadge.textContent = 'SF';
                itemDetails.appendChild(sfBadge);
            }

            const priceLine = document.createElement('div');
            priceLine.className = 'item-price-line';
            priceLine.textContent = `$${sanitizedItem.price.toFixed(2)} each`;
            itemDetails.appendChild(priceLine);

            const itemControls = document.createElement('div');
            itemControls.className = 'cart-item-controls';

            // Quantity controls
            const qtyControls = document.createElement('div');
            qtyControls.className = 'quantity-controls';

            const decreaseBtn = document.createElement('button');
            decreaseBtn.type = 'button';
            decreaseBtn.className = 'qty-btn qty-decrease';
            decreaseBtn.setAttribute('aria-label', 'Decrease quantity');
            decreaseBtn.textContent = '−';
            decreaseBtn.onclick = () => updateCartQuantity(index, -1);

            const qtyDisplay = document.createElement('span');
            qtyDisplay.className = 'qty-display';
            qtyDisplay.textContent = sanitizedItem.quantity;

            const increaseBtn = document.createElement('button');
            increaseBtn.type = 'button';
            increaseBtn.className = 'qty-btn qty-increase';
            increaseBtn.setAttribute('aria-label', 'Increase quantity');
            increaseBtn.textContent = '+';
            increaseBtn.onclick = () => updateCartQuantity(index, 1);

            qtyControls.appendChild(decreaseBtn);
            qtyControls.appendChild(qtyDisplay);
            qtyControls.appendChild(increaseBtn);

            const totalDiv = document.createElement('div');
            totalDiv.className = 'item-total';
            totalDiv.textContent = `$${itemTotal.toFixed(2)}`;

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-item-subtle';
            removeBtn.setAttribute('aria-label', 'Remove item');
            removeBtn.setAttribute('title', 'Remove from cart');
            removeBtn.onclick = () => removeCartItem(index);
            const removeIcon = document.createElement('span');
            removeIcon.className = 'remove-icon';
            removeIcon.textContent = '✕';
            removeBtn.appendChild(removeIcon);

            itemControls.appendChild(qtyControls);
            itemControls.appendChild(totalDiv);
            itemControls.appendChild(removeBtn);

            cartItem.appendChild(itemDetails);
            cartItem.appendChild(itemControls);
            cartContainer.appendChild(cartItem);

            // Build text for form submission (already sanitized)
            const dietary = [sanitizedItem.isGF ? 'GF' : '', sanitizedItem.isSF ? 'SF' : ''].filter(Boolean).join(', ');
            orderSummaryText += `${sanitizedItem.quantity}x ${sanitizedItem.name}`;
            if (sanitizedItem.size) orderSummaryText += ` (${sanitizedItem.size})`;
            if (dietary) orderSummaryText += ` [${dietary}]`;
            orderSummaryText += ` - $${itemTotal.toFixed(2)}\n`;
        });

        // Clear and append safe content
        orderItemsDiv.innerHTML = '';
        orderItemsDiv.appendChild(cartContainer);
        orderSummaryInput.value = orderSummaryText;

        // Update order summary totals
        updateOrderSummary(subtotal, 0);
    }

    // Update order summary section
    function updateOrderSummary(subtotal, shipping) {
        const total = subtotal + shipping;
        const deposit = total * 0.5;
        const balance = total - deposit;

        document.getElementById('summarySubtotal').textContent = '$' + subtotal.toFixed(2);
        document.getElementById('summaryTotal').textContent = '$' + total.toFixed(2);
        document.getElementById('summaryDeposit').textContent = '$' + deposit.toFixed(2);
        document.getElementById('summaryBalance').textContent = '$' + balance.toFixed(2);
        
        // Update payment amount displays
        if (document.getElementById('depositAmountDisplay')) {
            document.getElementById('depositAmountDisplay').textContent = '$' + deposit.toFixed(2);
        }
        if (document.getElementById('fullAmountDisplay')) {
            document.getElementById('fullAmountDisplay').textContent = '$' + total.toFixed(2);
        }
        
        if (shipping > 0) {
            document.getElementById('summaryShipping').textContent = '$' + shipping.toFixed(2);
            document.getElementById('summaryShippingRow').style.display = 'flex';
        } else {
            document.getElementById('summaryShippingRow').style.display = 'none';
        }

        // Show/hide deposit info
        if (subtotal > 0) {
            document.getElementById('depositPickupInfo').style.display = 'block';
            document.getElementById('depositDisplayAmount').textContent = '$' + deposit.toFixed(2);
            document.getElementById('balanceDisplayAmount').textContent = '$' + balance.toFixed(2);
        } else {
            document.getElementById('depositPickupInfo').style.display = 'none';
        }
    }

    // Enhanced toast system with undo support (simplified version for order page)
    function showOrderToast(message, type = 'success', undoAction = null) {
        const toast = document.createElement('div');
        toast.className = `order-toast ${type}`;
        
        const sanitizedMessage = String(message).replace(/[<>&"']/g, '').substring(0, 200);
        
        const messageContainer = document.createElement('div');
        messageContainer.textContent = sanitizedMessage;
        toast.appendChild(messageContainer);
        
        // Add undo button if undo action is provided
        if (undoAction && undoAction.id) {
            const undoButton = document.createElement('button');
            undoButton.textContent = 'Undo';
            undoButton.style.cssText = `
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                cursor: pointer;
                margin-left: 10px;
            `;
            
            undoButton.onclick = (e) => {
                e.stopPropagation();
                const success = executeOrderUndo(undoAction);
                if (success) {
                    toast.remove();
                }
            };
            
            toast.appendChild(undoButton);
        }
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4757' : type === 'warning' ? '#ffa502' : '#2ed573'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 350px;
            font-size: 13px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        const duration = undoAction ? 8000 : 3000;
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }
    
    // Simple undo system for order page
    const orderUndoActions = [];
    
    function addOrderUndoAction(action) {
        action.timestamp = Date.now();
        action.id = Math.random().toString(36).substr(2, 9);
        orderUndoActions.unshift(action);
        
        // Keep only recent actions (max 3 for order page)
        if (orderUndoActions.length > 3) {
            orderUndoActions.splice(3);
        }
    }
    
    function executeOrderUndo(undoAction) {
        const actionIndex = orderUndoActions.findIndex(action => action.id === undoAction.id);
        if (actionIndex === -1) {
            showOrderToast('Undo action expired.', 'error');
            return false;
        }
        
        const action = orderUndoActions[actionIndex];
        
        try {
            if (action.type === 'remove') {
                // Restore item to cart
                const cart = JSON.parse(localStorage.getItem('yfhs_cart') || '[]');
                
                if (action.index >= 0 && action.index <= cart.length) {
                    cart.splice(action.index, 0, action.item);
                } else {
                    cart.push(action.item);
                }
                
                localStorage.setItem('yfhs_cart', JSON.stringify(cart));
                loadCartToOrder();
                updateCartCount();
                
                const itemName = String(action.item.name || '').replace(/[<>&"']/g, '');
                showOrderToast(`Restored ${itemName} to cart.`, 'success');
                
                // Remove action from history
                orderUndoActions.splice(actionIndex, 1);
                return true;
            } else if (action.type === 'reset') {
                // Restore form data and cart
                localStorage.setItem('yfhs_cart', JSON.stringify(action.cartData));
                
                // Restore form fields
                const form = document.getElementById('orderForm');
                if (form && action.formData) {
                    Object.keys(action.formData).forEach(fieldName => {
                        const field = form.elements[fieldName];
                        if (field) {
                            field.value = action.formData[fieldName];
                        }
                    });
                }
                
                loadCartToOrder();
                updateCartCount();
                
                const itemCount = action.cartData.length;
                showOrderToast(`Restored ${itemCount} item${itemCount !== 1 ? 's' : ''} and form data.`, 'success');
                
                orderUndoActions.splice(actionIndex, 1);
                return true;
            }
        } catch (error) {
            console.error('Undo error:', error);
            showOrderToast('Undo failed.', 'error');
        }
        
        return false;
    }
    
    // Remove item from cart with undo support
    window.removeCartItem = function(index) {
        const cart = JSON.parse(localStorage.getItem('yfhs_cart') || '[]');
        
        if (index >= 0 && index < cart.length) {
            const item = cart[index];
            
            // Store undo action
            const undoAction = {
                type: 'remove',
                item: { ...item },
                index: index
            };
            addOrderUndoAction(undoAction);
            
            // Remove item
            cart.splice(index, 1);
            localStorage.setItem('yfhs_cart', JSON.stringify(cart));
            loadCartToOrder();
            updateCartCount();
            
            const itemName = String(item.name || '').replace(/[<>&"']/g, '');
            showOrderToast(`Removed ${itemName} from order.`, 'warning', undoAction);
        }
    };

    // Update quantity in cart
    window.updateCartQuantity = function(index, change) {
        const cart = JSON.parse(localStorage.getItem('yfhs_cart') || '[]');
        if (cart[index]) {
            cart[index].quantity += change;
            
            // Remove item if quantity goes to 0
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            
            localStorage.setItem('yfhs_cart', JSON.stringify(cart));
            loadCartToOrder();
            updateCartCount();
        }
    };

    // Update cart count badge
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('yfhs_cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'inline' : 'none';
        }
    }

    // Handle fulfillment method change
    window.handleFulfillmentChange = function() {
        const isPickup = document.getElementById('fulfillmentPickup').checked;
        const pickupSection = document.getElementById('pickupSection');
        const shippingSection = document.getElementById('shippingSection');
        
        if (isPickup) {
            pickupSection.style.display = 'block';
            shippingSection.style.display = 'none';
            // Reset shipping cost
            updateOrderSummary(parseFloat(document.getElementById('summarySubtotal').textContent.replace('$', '')), 0);
        } else {
            pickupSection.style.display = 'none';
            shippingSection.style.display = 'block';
        }
    };

    // US States with their ZIP code ranges and abbreviations
    const US_STATES = {
        'AL': { name: 'Alabama', zipRanges: [[35000, 36999]] },
        'AK': { name: 'Alaska', zipRanges: [[99500, 99999]] },
        'AZ': { name: 'Arizona', zipRanges: [[85000, 86999]] },
        'AR': { name: 'Arkansas', zipRanges: [[71600, 72999]] },
        'CA': { name: 'California', zipRanges: [[90000, 96199]] },
        'CO': { name: 'Colorado', zipRanges: [[80000, 81999]] },
        'CT': { name: 'Connecticut', zipRanges: [[6000, 6999]] },
        'DE': { name: 'Delaware', zipRanges: [[19700, 19999]] },
        'FL': { name: 'Florida', zipRanges: [[32000, 34999]] },
        'GA': { name: 'Georgia', zipRanges: [[30000, 31999]] },
        'HI': { name: 'Hawaii', zipRanges: [[96700, 96999]] },
        'ID': { name: 'Idaho', zipRanges: [[83200, 83999]] },
        'IL': { name: 'Illinois', zipRanges: [[60000, 62999]] },
        'IN': { name: 'Indiana', zipRanges: [[46000, 47999]] },
        'IA': { name: 'Iowa', zipRanges: [[50000, 52999]] },
        'KS': { name: 'Kansas', zipRanges: [[66000, 67999]] },
        'KY': { name: 'Kentucky', zipRanges: [[40000, 42999]] },
        'LA': { name: 'Louisiana', zipRanges: [[70000, 71599]] },
        'ME': { name: 'Maine', zipRanges: [[3900, 4999]] },
        'MD': { name: 'Maryland', zipRanges: [[20600, 21999]] },
        'MA': { name: 'Massachusetts', zipRanges: [[1000, 2799]] },
        'MI': { name: 'Michigan', zipRanges: [[48000, 49999]] },
        'MN': { name: 'Minnesota', zipRanges: [[55000, 56999]] },
        'MS': { name: 'Mississippi', zipRanges: [[38600, 39999]] },
        'MO': { name: 'Missouri', zipRanges: [[63000, 65999]] },
        'MT': { name: 'Montana', zipRanges: [[59000, 59999]] },
        'NE': { name: 'Nebraska', zipRanges: [[68000, 69999]] },
        'NV': { name: 'Nevada', zipRanges: [[88900, 89999]] },
        'NH': { name: 'New Hampshire', zipRanges: [[3000, 3899]] },
        'NJ': { name: 'New Jersey', zipRanges: [[7000, 8999]] },
        'NM': { name: 'New Mexico', zipRanges: [[87000, 88499]] },
        'NY': { name: 'New York', zipRanges: [[10000, 14999]] },
        'NC': { name: 'North Carolina', zipRanges: [[27000, 28999]] },
        'ND': { name: 'North Dakota', zipRanges: [[58000, 58999]] },
        'OH': { name: 'Ohio', zipRanges: [[43000, 45999]] },
        'OK': { name: 'Oklahoma', zipRanges: [[73000, 74999]] },
        'OR': { name: 'Oregon', zipRanges: [[97000, 97999]] },
        'PA': { name: 'Pennsylvania', zipRanges: [[15000, 19699]] },
        'RI': { name: 'Rhode Island', zipRanges: [[2800, 2999]] },
        'SC': { name: 'South Carolina', zipRanges: [[29000, 29999]] },
        'SD': { name: 'South Dakota', zipRanges: [[57000, 57999]] },
        'TN': { name: 'Tennessee', zipRanges: [[37000, 38599]] },
        'TX': { name: 'Texas', zipRanges: [[73300, 73399], [75000, 79999], [88500, 88599]] },
        'UT': { name: 'Utah', zipRanges: [[84000, 84999]] },
        'VT': { name: 'Vermont', zipRanges: [[5000, 5999]] },
        'VA': { name: 'Virginia', zipRanges: [[20100, 20199], [22000, 24699]] },
        'WA': { name: 'Washington', zipRanges: [[98000, 99499]] },
        'WV': { name: 'West Virginia', zipRanges: [[24700, 26999]] },
        'WI': { name: 'Wisconsin', zipRanges: [[53000, 54999]] },
        'WY': { name: 'Wyoming', zipRanges: [[82000, 83199]] }
    };

    // Validate ZIP code format
    function validateZipFormat(zip) {
        return /^\d{5}(-\d{4})?$/.test(zip);
    }

    // Get state from ZIP code
    function getStateFromZip(zip) {
        const zipNum = parseInt(zip.substring(0, 5));
        for (const [stateCode, stateData] of Object.entries(US_STATES)) {
            for (const [min, max] of stateData.zipRanges) {
                if (zipNum >= min && zipNum <= max) {
                    return stateCode;
                }
            }
        }
        return null;
    }

    // Validate state abbreviation
    function validateState(state) {
        return US_STATES.hasOwnProperty(state.toUpperCase());
    }

    // Cross-validate ZIP and state
    function validateZipStateMatch(zip, state) {
        if (!zip || !state) return false;
        const derivedState = getStateFromZip(zip);
        return derivedState === state.toUpperCase();
    }

    // Show validation error
    function showValidationError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const existingError = field.parentNode.querySelector('.validation-error');
        
        if (existingError) {
            existingError.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error';
        errorDiv.style.cssText = `
            color: #ff4757;
            font-size: 0.85rem;
            margin-top: 4px;
            padding: 6px 10px;
            background: rgba(255, 71, 87, 0.1);
            border: 1px solid rgba(255, 71, 87, 0.3);
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
        `;
        errorDiv.innerHTML = `<span>⚠️</span><span>${message}</span>`;
        
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
        field.style.borderColor = '#ff4757';
    }

    // Clear validation error
    function clearValidationError(fieldId) {
        const field = document.getElementById(fieldId);
        const existingError = field.parentNode.querySelector('.validation-error');
        
        if (existingError) {
            existingError.remove();
        }
        
        field.style.borderColor = '';
    }

    // Show validation success
    function showValidationSuccess(fieldId, message) {
        const field = document.getElementById(fieldId);
        clearValidationError(fieldId);
        
        const successDiv = document.createElement('div');
        successDiv.className = 'validation-success';
        successDiv.style.cssText = `
            color: #2ed573;
            font-size: 0.85rem;
            margin-top: 4px;
            padding: 4px 10px;
            background: rgba(46, 213, 115, 0.1);
            border: 1px solid rgba(46, 213, 115, 0.3);
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
        `;
        successDiv.innerHTML = `<span>✅</span><span>${message}</span>`;
        
        field.parentNode.insertBefore(successDiv, field.nextSibling);
        field.style.borderColor = '#2ed573';
        
        // Auto-remove success message after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
                field.style.borderColor = '';
            }
        }, 3000);
    }

    // Validate ZIP code with comprehensive checks
    window.validateZipCode = function() {
        const zipInput = document.getElementById('shippingZip');
        const stateInput = document.getElementById('shippingState');
        const zip = zipInput.value.trim();
        
        clearValidationError('shippingZip');
        
        if (!zip) {
            return false;
        }
        
        // Format validation
        if (!validateZipFormat(zip)) {
            showValidationError('shippingZip', 'Please enter a valid 5-digit ZIP code (e.g., 12345)');
            return false;
        }
        
        // Check if ZIP is in supported range
        const derivedState = getStateFromZip(zip);
        if (!derivedState) {
            showValidationError('shippingZip', 'Sorry, we currently only ship to the 48 contiguous US states');
            return false;
        }
        
        // Cross-validation with state if both are filled
        const currentState = stateInput.value.trim().toUpperCase();
        if (currentState && !validateZipStateMatch(zip, currentState)) {
            showValidationError('shippingZip', `ZIP code ${zip} does not match state ${currentState}. Expected state: ${derivedState}`);
            return false;
        }
        
        // Auto-fill state if empty
        if (!currentState) {
            stateInput.value = derivedState;
            showValidationSuccess('shippingState', `Auto-filled: ${US_STATES[derivedState].name}`);
        }
        
        showValidationSuccess('shippingZip', `Valid ZIP code for ${US_STATES[derivedState].name}`);
        return true;
    };

    // Validate state abbreviation
    window.validateStateCode = function() {
        const stateInput = document.getElementById('shippingState');
        const zipInput = document.getElementById('shippingZip');
        const state = stateInput.value.trim().toUpperCase();
        
        clearValidationError('shippingState');
        
        if (!state) {
            return false;
        }
        
        // Format validation
        if (state.length !== 2) {
            showValidationError('shippingState', 'Please enter a 2-letter state abbreviation (e.g., ID, CA, TX)');
            return false;
        }
        
        // Valid state check
        if (!validateState(state)) {
            showValidationError('shippingState', `"${state}" is not a valid US state abbreviation`);
            return false;
        }
        
        // Normalize case
        stateInput.value = state;
        
        // Cross-validation with ZIP if both are filled
        const currentZip = zipInput.value.trim();
        if (currentZip && validateZipFormat(currentZip)) {
            if (!validateZipStateMatch(currentZip, state)) {
                const correctState = getStateFromZip(currentZip);
                showValidationError('shippingState', `State ${state} does not match ZIP code ${currentZip}. Expected: ${correctState}`);
                return false;
            }
        }
        
        showValidationSuccess('shippingState', `Valid state: ${US_STATES[state].name}`);
        return true;
    };

    // Calculate shipping with enhanced validation
    window.calculateShipping = function() {
        const zip = document.getElementById('shippingZip').value.trim();
        const state = document.getElementById('shippingState').value.trim();
        let shippingCost = 0;
        
        // Clear previous shipping cost
        document.getElementById('shippingCost').textContent = '$0.00';
        
        // Validate both fields
        const zipValid = validateZipCode();
        const stateValid = validateStateCode();
        
        if (!zipValid || !stateValid) {
            const subtotal = parseFloat(document.getElementById('summarySubtotal').textContent.replace('$', ''));
            updateOrderSummary(subtotal, 0);
            return;
        }
        
        // Calculate shipping cost based on ZIP code zones
        if (zip.length >= 5) {
            const firstDigit = parseInt(zip.charAt(0));
            const secondDigit = parseInt(zip.charAt(1));
            
            // Enhanced shipping calculation based on actual USPS zones
            if (firstDigit === 0) { // Northeast (CT, MA, ME, NH, NJ, RI, VT)
                shippingCost = 14;
            } else if (firstDigit === 1) { // NY, PA
                shippingCost = 13;
            } else if (firstDigit === 2) { // DC, DE, MD, NC, SC, VA, WV
                shippingCost = 12;
            } else if (firstDigit === 3) { // AL, FL, GA, MS, TN, parts of KY
                shippingCost = 13;
            } else if (firstDigit === 4) { // IN, KY, MI, OH
                shippingCost = 11;
            } else if (firstDigit === 5) { // IA, MN, MT, ND, SD, WI
                shippingCost = 10;
            } else if (firstDigit === 6) { // IL, KS, MO, NE
                shippingCost = 9;
            } else if (firstDigit === 7) { // AR, LA, OK, TX
                shippingCost = 11;
            } else if (firstDigit === 8) { // AZ, CO, ID, NM, NV, UT, WY
                // Special handling for Idaho (our home state)
                if (state.toUpperCase() === 'ID') {
                    shippingCost = 8; // Reduced rate for local shipping
                } else {
                    shippingCost = 15;
                }
            } else if (firstDigit === 9) { // AK, CA, HI, OR, WA
                if (state.toUpperCase() === 'HI' || state.toUpperCase() === 'AK') {
                    // Show error for non-contiguous states
                    showValidationError('shippingZip', 'Sorry, we currently only ship to the 48 contiguous US states');
                    const subtotal = parseFloat(document.getElementById('summarySubtotal').textContent.replace('$', ''));
                    updateOrderSummary(subtotal, 0);
                    return;
                } else {
                    shippingCost = 18; // West Coast
                }
            }
            
            // Add weight-based shipping for heavier items (base rate + per-pound)
            const cart = JSON.parse(localStorage.getItem('yfhs_cart') || '[]');
            const hasHeavyItems = cart.some(item => 
                item.name.includes('Toffee') || 
                item.name.includes('Bread') || 
                item.quantity > 3
            );
            
            if (hasHeavyItems) {
                shippingCost += 3; // Additional handling fee
            }
        }
        
        document.getElementById('shippingCost').textContent = '$' + shippingCost.toFixed(2);
        const subtotal = parseFloat(document.getElementById('summarySubtotal').textContent.replace('$', ''));
        updateOrderSummary(subtotal, shippingCost);
        
        // Show shipping confirmation
        if (shippingCost > 0) {
            const shippingDisplay = document.getElementById('shippingCost');
            shippingDisplay.style.color = '#2ed573';
            shippingDisplay.style.fontWeight = 'bold';
        }
    };

    // Update payment details display
    window.updatePaymentDetails = function() {
        const paymentDetails = document.getElementById('paymentDetails');
        const paymentContent = document.getElementById('paymentDetailsContent');
        const customerName = document.getElementById('customerName').value || 'YourName';
        
        // Get selected payment amount
        const isDeposit = document.getElementById('payDeposit')?.checked;
        const total = parseFloat(document.getElementById('summaryTotal').textContent.replace('$', ''));
        const deposit = parseFloat(document.getElementById('summaryDeposit').textContent.replace('$', ''));
        const amount = isDeposit ? deposit : total;
        const amountLabel = isDeposit ? '50% Deposit' : 'Full Amount';
        
        let method = '';
        let details = '';
        let payNowButton = '';
        
        if (document.getElementById('paymentCash').checked) {
            method = 'Cash';
            details = `<p>Please bring $${amount.toFixed(2)} (${amountLabel}) in cash when you arrive for pickup.</p>`;
        } else if (document.getElementById('paymentCashApp').checked) {
            method = 'Cash App';
            const cashtag = 'DanaBlueMoonHaven';
            const note = encodeURIComponent(`${customerName} - Yellow Farmhouse Order`);
            const cashAppUrl = `https://cash.app/$${cashtag}/${amount.toFixed(2)}?note=${note}`;
            
            details = `
                <p><strong>Send ${amountLabel}:</strong> $${amount.toFixed(2)}</p>
                <p><strong>To:</strong> $${cashtag}</p>
                <p><strong>Note:</strong> ${customerName} - Yellow Farmhouse Order</p>
            `;
            payNowButton = `<a href="${cashAppUrl}" class="button primary pay-now-btn" target="_blank">Pay Now with Cash App</a>`;
        } else if (document.getElementById('paymentVenmo').checked) {
            method = 'Venmo';
            const venmoHandle = 'BlueMoonHaven';
            const note = encodeURIComponent(`${customerName} - Yellow Farmhouse Order`);
            const venmoUrl = `https://venmo.com/${venmoHandle}?txn=pay&amount=${amount.toFixed(2)}&note=${note}`;
            
            details = `
                <p><strong>Send ${amountLabel}:</strong> $${amount.toFixed(2)}</p>
                <p><strong>To:</strong> @${venmoHandle}</p>
                <p><strong>Note:</strong> ${customerName} - Yellow Farmhouse Order</p>
            `;
            payNowButton = `<a href="${venmoUrl}" class="button primary pay-now-btn" target="_blank">Pay Now with Venmo</a>`;
        } else if (document.getElementById('paymentPayPal').checked) {
            method = 'PayPal';
            const paypalMe = 'BlueMoonHaven';
            const paypalUrl = `https://paypal.me/${paypalMe}/${amount.toFixed(2)}USD`;
            
            details = `
                <p><strong>Send ${amountLabel}:</strong> $${amount.toFixed(2)}</p>
                <p><strong>To:</strong> PayPal.Me/${paypalMe}</p>
                <p><strong>Note:</strong> Include "${customerName} - Yellow Farmhouse Order" in payment note</p>
            `;
            payNowButton = `<a href="${paypalUrl}" class="button primary pay-now-btn" target="_blank">Pay Now with PayPal</a>`;
        } else if (document.getElementById('paymentZelle').checked) {
            method = 'Zelle';
            const zellePhone = '805-709-4686';
            
            details = `
                <p><strong>Send ${amountLabel}:</strong> $${amount.toFixed(2)}</p>
                <p><strong>To:</strong> ${zellePhone}</p>
                <p><strong>Note:</strong> ${customerName} - Yellow Farmhouse Order</p>
                <p><em>Open your banking app and select Zelle to send payment.</em></p>
            `;
        }
        
        if (method) {
            paymentContent.innerHTML = details + (payNowButton || '');
            paymentDetails.style.display = 'block';
        } else {
            paymentDetails.style.display = 'none';
        }
    };

    // Clear form completely with undo support
    window.resetFormComplete = function() {
        const cart = JSON.parse(localStorage.getItem('yfhs_cart') || '[]');
        const form = document.getElementById('orderForm');
        
        if (cart.length === 0 && (!form || isFormEmpty(form))) {
            showOrderToast('Form and cart are already empty.', 'warning');
            return;
        }
        
        if (confirm('Clear the entire form and remove all items from cart?')) {
            // Capture current form data for undo
            const formData = {};
            if (form) {
                const formDataObj = new FormData(form);
                for (let [key, value] of formDataObj.entries()) {
                    formData[key] = value;
                }
            }
            
            // Store undo action
            const undoAction = {
                type: 'reset',
                cartData: [...cart],
                formData: formData
            };
            addOrderUndoAction(undoAction);
            
            // Clear everything
            localStorage.removeItem('yfhs_cart');
            if (form) form.reset();
            loadCartToOrder();
            updateCartCount();
            
            const itemCount = cart.length;
            const message = itemCount > 0 ? 
                `Cleared form and ${itemCount} item${itemCount !== 1 ? 's' : ''} from cart.` : 
                'Cleared form data.';
            showOrderToast(message, 'warning', undoAction);
        }
    };
    
    // Helper function to check if form is empty
    function isFormEmpty(form) {
        const formData = new FormData(form);
        for (let [key, value] of formData.entries()) {
            if (value && value.trim() !== '') {
                return false;
            }
        }
        return true;
    }

    // Validate shipping form before submission
    window.validateShippingForm = function() {
        const fulfillmentMethod = document.querySelector('input[name="fulfillment_method"]:checked')?.value;
        
        if (fulfillmentMethod === 'Shipping') {
            const zipValid = validateZipCode();
            const stateValid = validateStateCode();
            const address = document.getElementById('shippingAddress').value.trim();
            const city = document.getElementById('shippingCity').value.trim();
            
            if (!address) {
                showValidationError('shippingAddress', 'Shipping address is required');
                return false;
            }
            
            if (!city) {
                showValidationError('shippingCity', 'City is required');
                return false;
            }
            
            if (!zipValid || !stateValid) {
                return false;
            }
        }
        
        return true;
    };

    // Add form validation on submission
    function addFormValidation() {
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', function(e) {
                if (!validateShippingForm()) {
                    e.preventDefault();
                    alert('Please fix the shipping information errors before submitting.');
                    return false;
                }
            });
        }
    }

    // Initialize function
    function initializeOrderPage() {
        loadCartToOrder();
        updateCartCount();
        addFormValidation();
        
        // Set minimum pickup date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateInput = document.getElementById('pickupDate');
        if (dateInput) {
            dateInput.min = tomorrow.toISOString().split('T')[0];
        }
        
        // Add real-time validation to shipping fields
        const zipInput = document.getElementById('shippingZip');
        const stateInput = document.getElementById('shippingState');
        
        if (zipInput) {
            zipInput.addEventListener('input', function() {
                // Only validate when we have a complete ZIP
                if (this.value.length === 5) {
                    validateZipCode();
                    calculateShipping();
                }
            });
            
            zipInput.addEventListener('blur', function() {
                if (this.value.trim()) {
                    validateZipCode();
                    calculateShipping();
                }
            });
        }
        
        if (stateInput) {
            stateInput.addEventListener('input', function() {
                // Convert to uppercase as user types
                this.value = this.value.toUpperCase();
                
                // Validate when we have 2 characters
                if (this.value.length === 2) {
                    validateStateCode();
                    calculateShipping();
                }
            });
            
            stateInput.addEventListener('blur', function() {
                if (this.value.trim()) {
                    validateStateCode();
                    calculateShipping();
                }
            });
        }
    }
    
    // Initialize on page load - handle both scenarios (DOM ready and late load)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeOrderPage);
    } else {
        // DOM already loaded (module imported after page load)
        initializeOrderPage();
    }

})();
