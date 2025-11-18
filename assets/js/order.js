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

    // Remove item from cart
    window.removeCartItem = function(index) {
        const cart = JSON.parse(localStorage.getItem('yfhs_cart') || '[]');
        cart.splice(index, 1);
        localStorage.setItem('yfhs_cart', JSON.stringify(cart));
        loadCartToOrder();
        updateCartCount();
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

    // Calculate shipping based on ZIP
    window.calculateShipping = function() {
        const zip = document.getElementById('shippingZip').value;
        let shippingCost = 0;
        
        if (zip.length === 5) {
            // Simple shipping calculation - can be enhanced
            const firstDigit = parseInt(zip.charAt(0));
            if (firstDigit <= 3) shippingCost = 12; // Eastern US
            else if (firstDigit <= 6) shippingCost = 15; // Central US
            else shippingCost = 18; // Western US
        }
        
        document.getElementById('shippingCost').textContent = '$' + shippingCost.toFixed(2);
        const subtotal = parseFloat(document.getElementById('summarySubtotal').textContent.replace('$', ''));
        updateOrderSummary(subtotal, shippingCost);
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

    // Clear form completely
    window.resetFormComplete = function() {
        if (confirm('Clear the entire form and remove all items from cart?')) {
            localStorage.removeItem('yfhs_cart');
            document.getElementById('orderForm').reset();
            loadCartToOrder();
            updateCartCount();
        }
    };

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        loadCartToOrder();
        updateCartCount();
        
        // Set minimum pickup date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateInput = document.getElementById('pickupDate');
        if (dateInput) {
            dateInput.min = tomorrow.toISOString().split('T')[0];
        }
    });

})();
