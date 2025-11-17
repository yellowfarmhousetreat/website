// Order page - load cart and display items
(function() {
    'use strict';

    // Basic sanitizer (defensive; we mostly use textContent already)
    function sanitize(str) {
        return String(str).replace(/[<>]/g, '');
    }

    // Load cart from localStorage (secure DOM creation)
    function loadCartToOrder() {
        const cart = JSON.parse(localStorage.getItem('yfhs_cart') || '[]');
        const orderItemsDiv = document.getElementById('orderItems');
        const orderSummaryInput = document.getElementById('orderSummary');

        if (!orderItemsDiv) return;

        // Empty state
        if (cart.length === 0) {
            orderItemsDiv.textContent = '';
            const empty = document.createElement('div');
            empty.className = 'empty-items';
            empty.appendChild(document.createTextNode('Your cart is empty. '));
            const link = document.createElement('a');
            link.href = 'menu.html';
            link.textContent = 'Browse the menu';
            empty.appendChild(link);
            empty.appendChild(document.createTextNode(' to add items.'));
            orderItemsDiv.appendChild(empty);
            if (orderSummaryInput) orderSummaryInput.value = '';
            updateOrderSummary(0, 0);
            return;
        }

        // Container for cart items
        orderItemsDiv.textContent = '';
        const listWrapper = document.createElement('div');
        listWrapper.className = 'cart-items-list';

        let subtotal = 0;
        let orderSummaryText = '';

        cart.forEach((item, index) => {
            const safeName = sanitize(item.name);
            const safeSize = item.size ? sanitize(item.size) : '';
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.dataset.index = String(index);

            // Details section
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'cart-item-details';

            const nameStrong = document.createElement('strong');
            nameStrong.textContent = safeName;
            detailsDiv.appendChild(nameStrong);

            if (safeSize) {
                const sizeSpan = document.createElement('span');
                sizeSpan.className = 'item-size';
                sizeSpan.textContent = safeSize;
                detailsDiv.appendChild(sizeSpan);
            }
            if (item.isGF) {
                const gfSpan = document.createElement('span');
                gfSpan.className = 'dietary-badge';
                gfSpan.textContent = 'GF';
                detailsDiv.appendChild(gfSpan);
            }
            if (item.isSF) {
                const sfSpan = document.createElement('span');
                sfSpan.className = 'dietary-badge';
                sfSpan.textContent = 'SF';
                detailsDiv.appendChild(sfSpan);
            }
            const priceLine = document.createElement('div');
            priceLine.className = 'item-price-line';
            priceLine.textContent = '$' + item.price.toFixed(2) + ' each';
            detailsDiv.appendChild(priceLine);

            // Controls section
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'cart-item-controls';

            const qtyControls = document.createElement('div');
            qtyControls.className = 'quantity-controls';
            const decBtn = document.createElement('button');
            decBtn.type = 'button';
            decBtn.className = 'qty-btn qty-decrease';
            decBtn.setAttribute('aria-label', 'Decrease quantity');
            decBtn.textContent = '−';
            decBtn.addEventListener('click', () => window.updateCartQuantity(index, -1));
            const qtyDisplay = document.createElement('span');
            qtyDisplay.className = 'qty-display';
            qtyDisplay.textContent = String(item.quantity);
            const incBtn = document.createElement('button');
            incBtn.type = 'button';
            incBtn.className = 'qty-btn qty-increase';
            incBtn.setAttribute('aria-label', 'Increase quantity');
            incBtn.textContent = '+';
            incBtn.addEventListener('click', () => window.updateCartQuantity(index, 1));
            qtyControls.appendChild(decBtn);
            qtyControls.appendChild(qtyDisplay);
            qtyControls.appendChild(incBtn);

            const totalDiv = document.createElement('div');
            totalDiv.className = 'item-total';
            totalDiv.textContent = '$' + itemTotal.toFixed(2);

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-item-subtle';
            removeBtn.setAttribute('aria-label', 'Remove item');
            removeBtn.title = 'Remove from cart';
            const removeIcon = document.createElement('span');
            removeIcon.className = 'remove-icon';
            removeIcon.textContent = '✕';
            removeBtn.appendChild(removeIcon);
            removeBtn.addEventListener('click', () => window.removeCartItem(index));

            controlsDiv.appendChild(qtyControls);
            controlsDiv.appendChild(totalDiv);
            controlsDiv.appendChild(removeBtn);

            itemDiv.appendChild(detailsDiv);
            itemDiv.appendChild(controlsDiv);
            listWrapper.appendChild(itemDiv);

            // Order summary text (not HTML injected anywhere except hidden field)
            const dietary = [item.isGF ? 'GF' : '', item.isSF ? 'SF' : ''].filter(Boolean).join(', ');
            orderSummaryText += `${item.quantity}x ${safeName}`;
            if (safeSize) orderSummaryText += ` (${safeSize})`;
            if (dietary) orderSummaryText += ` [${dietary}]`;
            orderSummaryText += ` - $${itemTotal.toFixed(2)}\n`;
        });

        orderItemsDiv.appendChild(listWrapper);
        if (orderSummaryInput) orderSummaryInput.value = orderSummaryText;
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
