// Checkout Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutShipping = document.getElementById('checkout-shipping');
    const checkoutTax = document.getElementById('checkout-tax');
    const checkoutTotal = document.getElementById('checkout-total');
    const checkoutForm = document.getElementById('checkoutForm');
    const sameAsBillingCheckbox = document.getElementById('sameAsBilling');
    const billingInfoSection = document.getElementById('billingInfoSection');
    const discountCodeInput = document.getElementById('discountCode');
    const applyDiscountBtn = document.querySelector('.btn-apply');
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const shippingRadios = document.querySelectorAll('input[name="shipping"]');
    
    // Cart data from localStorage
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    let discountApplied = false;
    let discountPercent = 0;
    
    // Initialize checkout
    function initCheckout() {
        // Check if cart is empty
        if (cartItems.length === 0) {
            // Redirect to cart page if cart is empty
            window.location.href = 'cart.html';
            return;
        }
        
        // Load cart items into checkout summary
        renderCheckoutItems();
        
        // Calculate and update totals
        updateCheckoutTotals();
        
        // Add event listeners
        addEventListeners();
    }
    
    // Render checkout items
    function renderCheckoutItems() {
        if (!checkoutItemsContainer) return;
        
        // Clear container
        checkoutItemsContainer.innerHTML = '';
        
        // Add each item
        cartItems.forEach(item => {
            const checkoutItem = document.createElement('div');
            checkoutItem.classList.add('checkout-item');
            
            checkoutItem.innerHTML = `
                <div class="checkout-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="checkout-item-info">
                    <h4>${item.name}</h4>
                    <p>Size: ${item.size} | Color: ${item.color}</p>
                    <div class="checkout-item-price">
                        <span class="quantity">${item.quantity}x</span>
                        <span class="price">$${item.price.toFixed(2)}</span>
                    </div>
                </div>
            `;
            
            checkoutItemsContainer.appendChild(checkoutItem);
        });
    }
    
    // Update checkout totals
    function updateCheckoutTotals() {
        // Calculate subtotal
        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Get shipping cost
        const shippingMethod = document.querySelector('input[name="shipping"]:checked').value;
        const shippingCost = shippingMethod === 'express' ? 12.99 : 0;
        
        // Apply discount if applicable
        let discountedSubtotal = subtotal;
        if (discountApplied && discountPercent > 0) {
            discountedSubtotal = subtotal * (1 - (discountPercent / 100));
        }
        
        // Calculate tax (10%)
        const tax = discountedSubtotal * 0.10;
        
        // Calculate total
        const total = discountedSubtotal + shippingCost + tax;
        
        // Update DOM
        if (checkoutSubtotal) checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (checkoutShipping) checkoutShipping.textContent = shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`;
        if (checkoutTax) checkoutTax.textContent = `$${tax.toFixed(2)}`;
        if (checkoutTotal) checkoutTotal.textContent = `$${total.toFixed(2)}`;
        
        // If there's a discount, show it
        const discountRow = document.querySelector('.discount-row');
        if (discountApplied && discountPercent > 0) {
            const discountAmount = subtotal * (discountPercent / 100);
            
            if (discountRow) {
                // Update existing discount row
                const discountValue = discountRow.querySelector('.discount-value');
                if (discountValue) {
                    discountValue.textContent = `-$${discountAmount.toFixed(2)}`;
                }
            } else {
                // Create new discount row
                const checkoutTotals = document.querySelector('.checkout-totals');
                const newDiscountRow = document.createElement('div');
                newDiscountRow.classList.add('checkout-row', 'discount-row');
                newDiscountRow.innerHTML = `
                    <span>Discount (${discountPercent}%)</span>
                    <span class="discount-value">-$${discountAmount.toFixed(2)}</span>
                `;
                
                // Insert before tax row
                const taxRow = checkoutTotals.querySelector('.checkout-row:nth-last-child(2)');
                if (taxRow) {
                    checkoutTotals.insertBefore(newDiscountRow, taxRow);
                } else {
                    checkoutTotals.appendChild(newDiscountRow);
                }
            }
        } else if (discountRow) {
            // Remove discount row if discount is not applied
            discountRow.remove();
        }
    }
    
    // Add event listeners
    function addEventListeners() {
        // Same as billing checkbox
        if (sameAsBillingCheckbox) {
            sameAsBillingCheckbox.addEventListener('change', function() {
                if (billingInfoSection) {
                    billingInfoSection.style.display = this.checked ? 'none' : 'block';
                    
                    // Toggle required attribute for billing fields
                    const billingInputs = billingInfoSection.querySelectorAll('input, select');
                    billingInputs.forEach(input => {
                        input.required = !this.checked;
                    });
                }
            });
        }
        
        // Payment method radios
        if (paymentRadios.length > 0) {
            paymentRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    // Hide all payment details
                    document.querySelectorAll('.payment-details').forEach(details => {
                        details.style.display = 'none';
                    });
                    
                    // Show selected payment details
                    const selectedPaymentDetails = document.getElementById(`${this.value}-details`);
                    if (selectedPaymentDetails) {
                        selectedPaymentDetails.style.display = 'block';
                    }
                    
                    // Toggle required attribute for payment fields
                    document.querySelectorAll('.payment-details input').forEach(input => {
                        input.required = false;
                    });
                    
                    // Set required for visible payment fields
                    if (selectedPaymentDetails) {
                        const visibleInputs = selectedPaymentDetails.querySelectorAll('input');
                        visibleInputs.forEach(input => {
                            if (input.hasAttribute('data-required')) {
                                input.required = true;
                            }
                        });
                    }
                });
            });
        }
        
        // Shipping method radios
        if (shippingRadios.length > 0) {
            shippingRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    updateCheckoutTotals();
                });
            });
        }
        
        // Apply discount button
        if (applyDiscountBtn && discountCodeInput) {
            applyDiscountBtn.addEventListener('click', function() {
                const code = discountCodeInput.value.trim();
                
                if (code) {
                    // Check if code is valid (for demo purposes)
                    if (code.toUpperCase() === 'PUNJAB10') {
                        discountApplied = true;
                        discountPercent = 10;
                        
                        // Update UI
                        applyDiscountBtn.textContent = 'Applied';
                        applyDiscountBtn.disabled = true;
                        discountCodeInput.disabled = true;
                        
                        // Show success message
                        showNotification('Discount code applied: 10% off!', 'success');
                        
                        // Update totals
                        updateCheckoutTotals();
                    } else if (code.toUpperCase() === 'WELCOME15') {
                        discountApplied = true;
                        discountPercent = 15;
                        
                        // Update UI
                        applyDiscountBtn.textContent = 'Applied';
                        applyDiscountBtn.disabled = true;
                        discountCodeInput.disabled = true;
                        
                        // Show success message
                        showNotification('Discount code applied: 15% off!', 'success');
                        
                        // Update totals
                        updateCheckoutTotals();
                    } else {
                        showNotification('Invalid discount code.', 'error');
                    }
                } else {
                    showNotification('Please enter a discount code.', 'error');
                }
            });
        }
        
        // Form submission
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Validate form data
                if (validateCheckoutForm()) {
                    // Process order
                    processOrder();
                }
            });
        }
        
        // Form field validation
        const formFields = checkoutForm.querySelectorAll('input, select');
        formFields.forEach(field => {
            field.addEventListener('input', function() {
                // Remove error class if field is not empty
                if (field.value.trim() !== '') {
                    field.classList.remove('error');
                }
            });
        });
        
        // Card number input formatting
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                let formattedValue = '';
                
                for (let i = 0; i < value.length; i++) {
                    if (i > 0 && i % 4 === 0) {
                        formattedValue += ' ';
                    }
                    formattedValue += value[i];
                }
                
                e.target.value = formattedValue;
            });
        }
        
        // Expiry date input formatting
        const expiryDateInput = document.getElementById('expiryDate');
        if (expiryDateInput) {
            expiryDateInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                
                e.target.value = value;
            });
        }
        
        // CVV input limiting
        const cvvInput = document.getElementById('cvv');
        if (cvvInput) {
            cvvInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                e.target.value = value.substring(0, 4); // Limit to 4 digits (some cards have 4-digit CVV)
            });
        }
        
        // Fill billing from shipping when "same as shipping" is checked
        if (sameAsBillingCheckbox) {
            // Save original shipping field values
            const billingFieldsMapping = {
                'firstName': 'billingFirstName',
                'lastName': 'billingLastName',
                'address': 'billingAddress',
                'apartment': 'billingApartment',
                'city': 'billingCity',
                'province': 'billingProvince',
                'postalCode': 'billingPostalCode',
                'country': 'billingCountry'
            };
            
            // Auto-fill billing fields when shipping fields change
            Object.keys(billingFieldsMapping).forEach(shippingField => {
                const shippingInput = document.getElementById(shippingField);
                if (shippingInput) {
                    shippingInput.addEventListener('change', function() {
                        if (sameAsBillingCheckbox.checked) {
                            const billingInput = document.getElementById(billingFieldsMapping[shippingField]);
                            if (billingInput) {
                                billingInput.value = shippingInput.value;
                            }
                        }
                    });
                }
            });
        }
    }
    
    // Validate checkout form
    function validateCheckoutForm() {
        let isValid = true;
        
        // Required fields
        const requiredFields = checkoutForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (field.value.trim() === '') {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        // Email validation
        const emailField = document.getElementById('email');
        if (emailField && emailField.value.trim() !== '') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailField.value)) {
                emailField.classList.add('error');
                showNotification('Please enter a valid email address.', 'error');
                isValid = false;
            }
        }
        
        // Phone validation
        const phoneField = document.getElementById('phone');
        if (phoneField && phoneField.value.trim() !== '') {
            const phonePattern = /^\d{10,15}$/;
            const phoneValue = phoneField.value.replace(/\D/g, '');
            if (!phonePattern.test(phoneValue)) {
                phoneField.classList.add('error');
                showNotification('Please enter a valid phone number.', 'error');
                isValid = false;
            }
        }
        
        // Credit card validation (if credit card payment is selected)
        const creditCardRadio = document.querySelector('input[name="payment"][value="credit-card"]');
        if (creditCardRadio && creditCardRadio.checked) {
            // Card number validation
            const cardNumberField = document.getElementById('cardNumber');
            if (cardNumberField) {
                const cardValue = cardNumberField.value.replace(/\D/g, '');
                if (cardValue.length < 13 || cardValue.length > 19) {
                    cardNumberField.classList.add('error');
                    showNotification('Please enter a valid card number.', 'error');
                    isValid = false;
                }
            }
            
            // Expiry date validation
            const expiryDateField = document.getElementById('expiryDate');
            if (expiryDateField) {
                const expiryValue = expiryDateField.value;
                
                if (!/^\d{2}\/\d{2}$/.test(expiryValue)) {
                    expiryDateField.classList.add('error');
                    showNotification('Please enter a valid expiry date (MM/YY).', 'error');
                    isValid = false;
                } else {
                    // Check if card is expired
                    const [month, year] = expiryValue.split('/').map(num => parseInt(num, 10));
                    const now = new Date();
                    const currentYear = now.getFullYear() % 100; // Last two digits
                    const currentMonth = now.getMonth() + 1; // 1-12
                    
                    if (year < currentYear || (year === currentYear && month < currentMonth) || month < 1 || month > 12) {
                        expiryDateField.classList.add('error');
                        showNotification('Your card appears to be expired.', 'error');
                        isValid = false;
                    }
                }
            }
            
            // CVV validation
            const cvvField = document.getElementById('cvv');
            if (cvvField) {
                const cvvValue = cvvField.value.replace(/\D/g, '');
                if (cvvValue.length < 3 || cvvValue.length > 4) {
                    cvvField.classList.add('error');
                    showNotification('Please enter a valid CVV.', 'error');
                    isValid = false;
                }
            }
        }
        
        // If any fields are invalid, scroll to the first error
        if (!isValid) {
            const firstError = document.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        
        return isValid;
    }
    
    // Process order
    function processOrder() {
        // Get form data
        const formData = new FormData(checkoutForm);
        const orderData = {};
        
        for (let [key, value] of formData.entries()) {
            orderData[key] = value;
        }
        
        // Add cart items to order data
        orderData.items = cartItems;
        
        // Add totals
        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shippingMethod = document.querySelector('input[name="shipping"]:checked').value;
        const shippingCost = shippingMethod === 'express' ? 12.99 : 0;
        
        // Apply discount if applicable
        let discountedSubtotal = subtotal;
        if (discountApplied && discountPercent > 0) {
            const discountAmount = subtotal * (discountPercent / 100);
            discountedSubtotal = subtotal - discountAmount;
            orderData.discount = {
                code: discountCodeInput.value,
                percent: discountPercent,
                amount: discountAmount
            };
        }
        
        const tax = discountedSubtotal * 0.10;
        const total = discountedSubtotal + shippingCost + tax;
        
        orderData.totals = {
            subtotal,
            shippingCost,
            tax,
            total
        };
        
        // Generate order number
        const orderNumber = 'PD' + Date.now().toString().slice(-8);
        orderData.orderNumber = orderNumber;
        orderData.orderDate = new Date().toISOString();
        
        // For demo purposes, just log the order data to console
        console.log('Order Processed:', orderData);
        
        // Save order to localStorage for reference
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Show success message
        showNotification('Order placed successfully!', 'success');
        
        // Redirect to confirmation page
        setTimeout(() => {
            window.location.href = `order-confirmation.html?order=${orderNumber}`;
        }, 1500);
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.classList.add('notification', `notification-${type}`);
        
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('active');
        }, 100);
        
        // Close button
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
        
        // Auto hide after a few seconds
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                if (notification.parentNode === document.body) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
    
    // Add styles for form error and notification
    const style = document.createElement('style');
    style.textContent = `
        .error {
            border-color: #ff4d4d !important;
            background-color: #fff2f2 !important;
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            transform: translateX(110%);
            transition: transform 0.3s ease;
            max-width: 300px;
        }
        
        .notification.active {
            transform: translateX(0);
        }
        
        .notification-content {
            padding: 15px 20px;
            border-radius: 4px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .notification-info .notification-content {
            background-color: #333;
            color: white;
        }
        
        .notification-success .notification-content {
            background-color: #4CAF50;
            color: white;
        }
        
        .notification-error .notification-content {
            background-color: #ff4d4d;
            color: white;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: inherit;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: 15px;
        }
        
        .checkout-progress {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }
        
        .progress-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 2;
        }
        
        .step-number {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            background-color: #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .progress-step.active .step-number {
            background-color: #FF9933;
            color: white;
        }
        
        .progress-step.completed .step-number {
            background-color: #4CAF50;
            color: white;
        }
        
        .progress-bar {
            flex: 1;
            height: 3px;
            background-color: #ddd;
            z-index: 1;
            margin: 0 15px;
        }
        
        .checkout-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
        }
        
        .checkout-form {
            background-color: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .checkout-summary {
            background-color: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            position: sticky;
            top: 100px;
        }
        
        .checkout-item {
            display: flex;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .checkout-item:last-child {
            border-bottom: none;
        }
        
        .checkout-item-image {
            width: 60px;
            height: 60px;
            border-radius: 5px;
            overflow: hidden;
            margin-right: 15px;
        }
        
        .checkout-item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .checkout-item-info {
            flex: 1;
        }
        
        .checkout-item-info h4 {
            margin-bottom: 5px;
            font-size: 0.9rem;
        }
        
        .checkout-item-info p {
            color: #666;
            font-size: 0.8rem;
            margin-bottom: 5px;
        }
        
        .checkout-item-price {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
        }
        
        .checkout-totals {
            margin-top: 20px;
            border-top: 1px solid #f0f0f0;
            padding-top: 15px;
        }
        
        .checkout-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .checkout-row.total {
            font-weight: bold;
            font-size: 1.2rem;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #f0f0f0;
        }
        
        .discount-code {
            display: flex;
            margin: 20px 0;
        }
        
        .discount-code input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px 0 0 4px;
        }
        
        .btn-apply {
            padding: 10px 15px;
            border-radius: 0 4px 4px 0;
        }
        
        .place-order-btn {
            width: 100%;
            padding: 15px;
            margin: 20px 0;
            font-size: 1.1rem;
        }
        
        .secure-checkout {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            color: #666;
        }
        
        .secure-icon {
            margin-right: 10px;
        }
        
        .accepted-payment {
            text-align: center;
            font-size: 0.9rem;
            color: #666;
        }
        
        .payment-icons {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 5px;
        }
        
        @media (max-width: 768px) {
            .checkout-grid {
                grid-template-columns: 1fr;
            }
            
            .checkout-summary {
                position: static;
                order: -1;
            }
        }
    `;
    
    document.head.appendChild(style);
    
    // Initialize checkout on page load
    initCheckout();
});