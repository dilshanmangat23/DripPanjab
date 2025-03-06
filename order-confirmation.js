// Order Confirmation Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get order number from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('order');
    
    // If no order number in URL, check for most recent order
    if (!orderNumber) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        
        if (orders.length > 0) {
            // Sort orders by date (newest first)
            orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            
            // Get most recent order
            displayOrderDetails(orders[0]);
        } else {
            // No orders found, redirect to home
            window.location.href = 'index.html';
        }
    } else {
        // Find the order with the matching order number
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const order = orders.find(o => o.orderNumber === orderNumber);
        
        if (order) {
            displayOrderDetails(order);
        } else {
            // Order not found, show error message
            showErrorMessage();
        }
    }
    
    // Display order details
    function displayOrderDetails(order) {
        // Order information
        document.getElementById('order-number').textContent = order.orderNumber;
        
        // Format date
        const orderDate = new Date(order.orderDate);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        document.getElementById('order-date').textContent = formattedDate;
        document.getElementById('order-placed-date').textContent = formattedDate;
        
        // Payment method
        let paymentMethod = 'Credit Card';
        if (order.payment === 'paypal') {
            paymentMethod = 'PayPal';
        } else if (order.payment === 'apple-pay') {
            paymentMethod = 'Apple Pay';
        }
        document.getElementById('payment-method').textContent = paymentMethod;
        
        // Shipping method
        let shippingMethod = 'Standard Shipping (3-5 business days)';
        if (order.shipping === 'express') {
            shippingMethod = 'Express Shipping (1-2 business days)';
        }
        document.getElementById('shipping-method').textContent = shippingMethod;
        
        // Customer email
        if (order.email) {
            document.getElementById('customer-email').textContent = order.email;
        }
        
        // Shipping address
        const shippingAddressDetails = document.getElementById('shipping-address-details');
        if (shippingAddressDetails) {
            shippingAddressDetails.innerHTML = `
                <p>${order.firstName} ${order.lastName}</p>
                <p>${order.address}</p>
                ${order.apartment ? `<p>${order.apartment}</p>` : ''}
                <p>${order.city}, ${order.province} ${order.postalCode}</p>
                <p>${order.country}</p>
                <p>${order.phone}</p>
            `;
        }
        
        // Billing address
        const billingAddressDetails = document.getElementById('billing-address-details');
        if (billingAddressDetails) {
            if (order.sameAsBilling === 'on') {
                // Same as shipping
                billingAddressDetails.innerHTML = `
                    <p>${order.firstName} ${order.lastName}</p>
                    <p>${order.address}</p>
                    ${order.apartment ? `<p>${order.apartment}</p>` : ''}
                    <p>${order.city}, ${order.province} ${order.postalCode}</p>
                    <p>${order.country}</p>
                    <p>${order.phone}</p>
                `;
            } else {
                // Different billing address
                billingAddressDetails.innerHTML = `
                    <p>${order.billingFirstName} ${order.billingLastName}</p>
                    <p>${order.billingAddress}</p>
                    ${order.billingApartment ? `<p>${order.billingApartment}</p>` : ''}
                    <p>${order.billingCity}, ${order.billingProvince} ${order.billingPostalCode}</p>
                    <p>${order.billingCountry}</p>
                `;
            }
        }
        
        // Order items
        const orderItems = document.getElementById('order-items');
        if (orderItems && order.items) {
            orderItems.innerHTML = '';
            
            order.items.forEach(item => {
                const orderItem = document.createElement('div');
                orderItem.classList.add('order-item');
                
                orderItem.innerHTML = `
                    <div class="order-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="order-item-details">
                        <h4>${item.name}</h4>
                        <p>Size: ${item.size || 'M'} | Color: ${item.color || 'Default'}</p>
                    </div>
                    <div class="order-item-price">$${item.price.toFixed(2)}</div>
                    <div class="order-item-quantity">Qty: ${item.quantity}</div>
                `;
                
                orderItems.appendChild(orderItem);
            });
        }
        
        // Order totals
        if (order.totals) {
            document.getElementById('order-subtotal').textContent = `$${order.totals.subtotal.toFixed(2)}`;
            
            // Shipping
            const shippingCost = order.totals.shippingCost;
            document.getElementById('order-shipping').textContent = shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`;
            
            // Discount
            if (order.discount) {
                document.getElementById('discount-row').style.display = 'flex';
                document.getElementById('discount-label').textContent = `Discount (${order.discount.percent}%)`;
                document.getElementById('order-discount').textContent = `-$${order.discount.amount.toFixed(2)}`;
            }
            
            // Tax
            document.getElementById('order-tax').textContent = `$${order.totals.tax.toFixed(2)}`;
            
            // Total
            document.getElementById('order-total').textContent = `$${order.totals.total.toFixed(2)}`;
        }
    }
    
    // Show error message
    function showErrorMessage() {
        const confirmationHeader = document.querySelector('.confirmation-header');
        if (confirmationHeader) {
            confirmationHeader.innerHTML = `
                <div class="confirmation-icon" style="background-color: #ff4d4d;">❗</div>
                <h1 style="color: #ff4d4d;">Order Not Found</h1>
                <p>We couldn't find the order you're looking for. Please check your order number or contact customer service.</p>
            `;
        }
        
        const orderDetails = document.querySelector('.order-details');
        if (orderDetails) {
            orderDetails.style.display = 'none';
        }
    }
    
    // Add event listeners for "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const productId = this.getAttribute('data-id');
            const productCard = this.closest('.product-card');
            
            if (productCard) {
                const productName = productCard.querySelector('h3').textContent;
                const productPrice = parseFloat(productCard.querySelector('.price').textContent.replace('$', ''));
                const productImage = productCard.querySelector('img').src;
                
                // Create cart item
                const cartItem = {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1,
                    size: 'M',
                    color: 'Default'
                };
                
                // Add to cart
                addToCart(cartItem);
                
                // Show notification
                showNotification('Product added to cart!', 'success');
            }
        });
    });
    
    // Add to cart function
    function addToCart(item) {
        // Get existing cart
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if item already exists
        const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
        
        if (existingItemIndex !== -1) {
            // Increase quantity of existing item
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item
            cart.push(item);
        }
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount(cart);
    }
    
    // Update cart count
    function updateCartCount(cart) {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        
        // Create or update cart count element
        const cartCountElement = document.createElement('span');
        cartCountElement.classList.add('cart-count');
        cartCountElement.textContent = count;
        
        // Get cart icon
        const cartIcon = document.querySelector('.header-icons a[href="cart.html"]');
        
        if (cartIcon) {
            // Remove existing cart count
            const existingCount = cartIcon.querySelector('.cart-count');
            if (existingCount) {
                cartIcon.removeChild(existingCount);
            }
            
            // Add new cart count
            if (count > 0) {
                cartIcon.appendChild(cartCountElement);
            }
        }
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        // Create notification
        const notification = document.createElement('div');
        notification.classList.add('notification', `notification-${type}`);
        
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add to body
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
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                if (notification.parentNode === document.body) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Add styles for notification
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
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
        
        .cart-count {
            position: absolute;
            top: -8px;
            right: -8px;
            background-color: var(--primary);
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            font-weight: bold;
        }
    `;
    
    document.head.appendChild(notificationStyle);
    
    // Initialize cart count on page load
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount(cart);
});