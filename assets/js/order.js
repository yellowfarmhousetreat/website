// Order page - load cart and display items
(function() {
    'use strict';

    // Load cart from localStorage
    function loadCartToOrder() {
        const cart = JSON.parse(localStorage.getItem('yfhs_cart') || '[]');
        const orderItemsDiv = document.getElementById('orderItems');
        const orderSummaryInput = document.getElementById('orderSummary');
        
        if (cart.length === 0) {
            orderItemsDiv.innerHTML = '<div class="empty-items">No items added yet. <a href="menu.html">Go to Menu</a></div>';
            orderSummaryInput.value = '';
            updateOrderSummary(0, 0);
            return;
        }

        // Build visible cart display
        let itemsHTML = '<div class="cart-items-list">';
        let orderSummaryText = '';
        let subtotal = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            // Build display HTML
            itemsHTML += `
                <div class="cart-item" data-index="${index}">
                    <div class="cart-item-details">
                        <strong>${item.name}</strong>
                        ${item.size ? `<span class="item-size">${item.size}</span>` : ''}
                        ${item.isGF ? '<span class="dietary-badge">GF</span>' : ''}
                        ${item.isSF ? '<span class="dietary-badge">SF</span>' : ''}
                        <div class="item-qty-price">
                            Qty: ${item.quantity} × $${item.price.toFixed(2)} = $${itemTotal.toFixed(2)}
                        </div>
                    </div>
                    <button type="button" class="remove-item" onclick="removeCartItem(${index})" aria-label="Remove item">×</button>
                </div>
            `;

            // Build text for form submission
            const dietary = [item.isGF ? 'GF' : '', item.isSF ? 'SF' : ''].filter(Boolean).join(', ');
            orderSummaryText += `${item.quantity}x ${item.name}`;
            if (item.size) orderSummaryText += ` (${item.size})`;
            if (dietary) orderSummaryText += ` [${dietary}]`;
            orderSummaryText += ` - $${itemTotal.toFixed(2)}\n`;
        });

        itemsHTML += '</div>';
        orderItemsDiv.innerHTML = itemsHTML;
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
        const deposit = document.getElementById('summaryDeposit').textContent;
        
        let method = '';
        let details = '';
        
        if (document.getElementById('paymentCash').checked) {
            method = 'Cash';
            details = `<p>Please bring ${deposit} cash as your deposit when you arrive for pickup. The remaining balance is due at pickup.</p>`;
        } else if (document.getElementById('paymentCashApp').checked) {
            method = 'Cash App';
            details = `<p>Send ${deposit} to <strong>$DanaBlueMoonHaven</strong> and include your order name in the note.</p>`;
        } else if (document.getElementById('paymentVenmo').checked) {
            method = 'Venmo';
            details = `<p>Send ${deposit} to <strong>@BlueMoonHaven</strong> and include your order name in the note.</p>`;
        } else if (document.getElementById('paymentPayPal').checked) {
            method = 'PayPal';
            details = `<p>Send ${deposit} to <strong>@BlueMoonHaven</strong> and include your order name in the note.</p>`;
        } else if (document.getElementById('paymentZelle').checked) {
            method = 'Zelle';
            details = `<p>Send ${deposit} to <strong>805-709-4686</strong> and include your order name in the note.</p>`;
        }
        
        if (method) {
            paymentContent.innerHTML = details;
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
