// Cart Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSummary = document.getElementById('cart-summary');
    const emptyCart = document.getElementById('empty-cart');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    // Cart data from localStorage
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Initialize cart
    function initCart() {
        // Check if cart is empty
        if (cartItems.length === 0) {
            if (cartItemsContainer) cartItemsContainer.style.display = 'none';
            if (cartSummary) cartSummary.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            if (checkoutBtn) checkoutBtn.classList.add('disabled');
        } else {
            renderCartItems();
            updateCartSummary();
            if (checkoutBtn) checkoutBtn.classList.remove('disabled');
        }
        
        // Add event listeners
        addEventListeners();
    }
    
    // Render cart items
    function renderCartItems() {
        if (!cartItemsContainer) return;
        
        // Clear cart items (except header)
        const header = cartItemsContainer.querySelector('.cart-header');
        cartItemsContainer.innerHTML = '';
        if (header) cartItemsContainer.appendChild(header);
        
        // Add each item
        cartItems.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.dataset.id = item.id;
            
            cartItem.innerHTML = `
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Size: ${item.size || 'M'} | Color: ${item.color || 'Default'}</p>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn decrease">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10">
                    <button class="quantity-btn increase">+</button>
                </div>
                <div class="item-price">$${item.price.toFixed(2)}</div>
                <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                <div class="remove-item">&times;</div>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        });
    }
    
    // Update cart summary
    function updateCartSummary() {
        if (!cartSummary) return;
        
        // Calculate subtotal
        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Calculate tax (10%)
        const tax = subtotal * 0.10;
        
        // Calculate total
        const total = subtotal + tax;
        
        // Update DOM
        const summaryRows = cartSummary.querySelectorAll('.summary-row');
        summaryRows[0].querySelector('div:last-child').textContent = `$${subtotal.toFixed(2)}`;
        summaryRows[2].querySelector('div:last-child').textContent = `$${tax.toFixed(2)}`;
        summaryRows[3].querySelector('div:last-child').textContent = `$${total.toFixed(2)}`;
        
        // Update checkout button text with total
        if (checkoutBtn) {
            checkoutBtn.textContent = `Proceed to Checkout ($${total.toFixed(2)})`;
        }
    }
    
    // Add event listeners
    function addEventListeners() {
        // Quantity increase buttons
        document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
            btn.addEventListener('click', function() {
                const item = this.closest('.cart-item');
                const id = item.dataset.id;
                const input = item.querySelector('.quantity-input');
                
                if (input.value < 10) {
                    input.value = parseInt(input.value) + 1;
                    updateCartItemQuantity(id, parseInt(input.value));
                }
            });
        });
        
        // Quantity decrease buttons
        document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
            btn.addEventListener('click', function() {
                const item = this.closest('.cart-item');
                const id = item.dataset.id;
                const input = item.querySelector('.quantity-input');
                
                if (input.value > 1) {
                    input.value = parseInt(input.value) - 1;
                    updateCartItemQuantity(id, parseInt(input.value));
                }
            });
        });
        
        // Quantity input changes
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', function() {
                const item = this.closest('.cart-item');
                const id = item.dataset.id;
                
                let quantity = parseInt(this.value);
                if (isNaN(quantity) || quantity < 1) {
                    quantity = 1;
                    this.value = 1;
                } else if (quantity > 10) {
                    quantity = 10;
                    this.value = 10;
                }
                
                updateCartItemQuantity(id, quantity);
            });
        });
        
        // Remove item buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const item = this.closest('.cart-item');
                const id = item.dataset.id;
                
                if (confirm('Are you sure you want to remove this item from your cart?')) {
                    removeCartItem(id);
                }
            });
        });
        
        // Continue shopping button
        const continueShoppingBtn = document.querySelector('.continue-shopping');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'shop.html';
            });
        }
        
        // Checkout button
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (cartItems.length === 0) {
                    showNotification('Your cart is empty. Add some items first!', 'error');
                    return;
                }
                
                window.location.href = 'checkout.html';
            });
        }
        
        // Add a bulk remove button
        const bulkRemoveBtn = document.createElement('button');
        bulkRemoveBtn.classList.add('btn', 'btn-outline', 'bulk-remove-btn');
        bulkRemoveBtn.textContent = 'Clear Cart';
        
        // Insert after "Continue Shopping" button
        const continueShoppingButton = document.querySelector('.continue-shopping');
        if (continueShoppingButton && cartItems.length > 0) {
            const parentElement = continueShoppingButton.parentElement;
            if (parentElement) {
                parentElement.insertBefore(bulkRemoveBtn, continueShoppingButton.nextSibling);
                
                // Add event listener for bulk remove
                bulkRemoveBtn.addEventListener('click', function() {
                    if (confirm('Are you sure you want to clear your cart? This cannot be undone.')) {
                        clearCart();
                    }
                });
            }
        }
    }
    
    // Update cart item quantity
    function updateCartItemQuantity(id, quantity) {
        // Find item in cart
        const itemIndex = cartItems.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
            // Update quantity
            cartItems[itemIndex].quantity = quantity;
            
            // Update item total
            const item = document.querySelector(`.cart-item[data-id="${id}"]`);
            const total = cartItems[itemIndex].price * quantity;
            item.querySelector('.item-total').textContent = `$${total.toFixed(2)}`;
            
            // Update cart summary
            updateCartSummary();
            
            // Save cart
            saveCart();
            
            // Update cart count in header
            updateCartCount();
            
            // Show notification
            showNotification('Cart updated!', 'success');
        }
    }
    
    // Remove cart item
    function removeCartItem(id) {
        // Remove item from cart
        cartItems = cartItems.filter(item => item.id !== id);
        
        // Remove from DOM
        const item = document.querySelector(`.cart-item[data-id="${id}"]`);
        item.remove();
        
        // Update cart summary
        updateCartSummary();
        
        // Check if cart is empty
        if (cartItems.length === 0) {
            if (cartItemsContainer) cartItemsContainer.style.display = 'none';
            if (cartSummary) cartSummary.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            if (checkoutBtn) checkoutBtn.classList.add('disabled');
            
            // Remove bulk remove button
            const bulkRemoveBtn = document.querySelector('.bulk-remove-btn');
            if (bulkRemoveBtn) {
                bulkRemoveBtn.remove();
            }
        }
        
        // Save cart
        saveCart();
        
        // Update cart count in header
        updateCartCount();
        
        // Show notification
        showNotification('Item removed from cart!', 'info');
    }
    
    // Clear entire cart
    function clearCart() {
        // Clear cart data
        cartItems = [];
        
        // Clear DOM
        if (cartItemsContainer) {
            // Keep header
            const header = cartItemsContainer.querySelector('.cart-header');
            cartItemsContainer.innerHTML = '';
            if (header) cartItemsContainer.appendChild(header);
            
            cartItemsContainer.style.display = 'none';
        }
        
        if (cartSummary) cartSummary.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
        if (checkoutBtn) checkoutBtn.classList.add('disabled');
        
        // Remove bulk remove button
        const bulkRemoveBtn = document.querySelector('.bulk-remove-btn');
        if (bulkRemoveBtn) {
            bulkRemoveBtn.remove();
        }
        
        // Save cart (empty)
        saveCart();
        
        // Update cart count in header
        updateCartCount();
        
        // Show notification
        showNotification('Cart cleared!', 'info');
    }
    
    // Save cart
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }
    
    // Update cart count in header
    function updateCartCount() {
        const count = cartItems.reduce((total, item) => total + item.quantity, 0);
        
        // Create or update cart count element
        const cartCountElement = document.createElement('span');
        cartCountElement.classList.add('cart-count');
        
        // Get cart icon
        const cartIcon = document.querySelector('.header-icons a[href="cart.html"]');
        
        if (cartIcon) {
            // Remove existing cart count
            const existingCount = cartIcon.querySelector('.cart-count');
            if (existingCount) {
                cartIcon.removeChild(existingCount);
            }
            
            // Add new cart count if there are items
            if (count > 0) {
                cartCountElement.textContent = count;
                cartIcon.appendChild(cartCountElement);
            }
        }
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
        }, 3000);
    }
    
    // Add styles for notification
    const style = document.createElement('style');
    style.textContent = `
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
        
        .bulk-remove-btn {
            margin-left: 10px;
        }
        
        .disabled {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
        }
    `;
    
    document.head.appendChild(style);
    
    // Add a "Save for Later" feature
    function createSaveForLaterSection() {
        // Check if we're on the cart page
        if (!cartItemsContainer) return;
        
        // Get saved items from localStorage
        const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
        
        // Don't create section if no saved items
        if (savedItems.length === 0) return;
        
        // Check if section already exists
        if (document.querySelector('.saved-items-section')) return;
        
        // Create the section
        const savedItemsSection = document.createElement('div');
        savedItemsSection.classList.add('saved-items-section');
        
        savedItemsSection.innerHTML = `
            <h2 class="section-title">Saved For Later</h2>
            <div class="saved-items-container"></div>
        `;
        
        // Insert before newsletter section
        const newsletterSection = document.querySelector('.newsletter');
        if (newsletterSection) {
            newsletterSection.parentElement.insertBefore(savedItemsSection, newsletterSection);
        } else {
            // Otherwise append to container
            document.querySelector('.container').appendChild(savedItemsSection);
        }
        
        // Populate saved items
        const savedItemsContainer = document.querySelector('.saved-items-container');
        
        savedItems.forEach(item => {
            const savedItem = document.createElement('div');
            savedItem.classList.add('saved-item');
            savedItem.dataset.id = item.id;
            
            savedItem.innerHTML = `
                <div class="saved-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="saved-item-info">
                    <h3>${item.name}</h3>
                    <p>Size: ${item.size || 'M'} | Color: ${item.color || 'Default'}</p>
                    <div class="saved-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="saved-item-actions">
                    <button class="btn move-to-cart">Add to Cart</button>
                    <button class="btn btn-outline remove-saved">Remove</button>
                </div>
            `;
            
            savedItemsContainer.appendChild(savedItem);
        });
        
        // Add event listeners for saved items
        document.querySelectorAll('.move-to-cart').forEach(btn => {
            btn.addEventListener('click', function() {
                const savedItem = this.closest('.saved-item');
                const id = savedItem.dataset.id;
                
                moveToCart(id);
            });
        });
        
        document.querySelectorAll('.remove-saved').forEach(btn => {
            btn.addEventListener('click', function() {
                const savedItem = this.closest('.saved-item');
                const id = savedItem.dataset.id;
                
                removeSavedItem(id);
            });
        });
        
        // Add styles for saved items
        const savedItemsStyle = document.createElement('style');
        savedItemsStyle.textContent = `
            .saved-items-section {
                margin: 60px 0;
            }
            
            .saved-items-container {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
            }
            
            .saved-item {
                display: flex;
                flex-direction: column;
                background-color: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                padding: 15px;
            }
            
            .saved-item-image {
                width: 100%;
                height: 200px;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 15px;
            }
            
            .saved-item-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .saved-item-info {
                margin-bottom: 15px;
            }
            
            .saved-item-info h3 {
                margin-bottom: 5px;
            }
            
            .saved-item-info p {
                color: #666;
                font-size: 0.9rem;
                margin-bottom: 5px;
            }
            
            .saved-item-price {
                font-weight: 600;
                color: var(--primary);
            }
            
            .saved-item-actions {
                display: flex;
                gap: 10px;
                margin-top: auto;
            }
            
            .saved-item-actions button {
                flex: 1;
                padding: 8px;
                font-size: 0.9rem;
            }
        `;
        
        document.head.appendChild(savedItemsStyle);
    }
    
    // Move saved item to cart
    function moveToCart(id) {
        // Get saved items
        const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
        
        // Find the saved item
        const itemIndex = savedItems.findIndex(item => item.id === id);
        
        if (itemIndex !== -1) {
            // Add to cart
            const item = savedItems[itemIndex];
            item.quantity = 1; // Reset quantity
            cartItems.push(item);
            
            // Remove from saved items
            savedItems.splice(itemIndex, 1);
            
            // Save to localStorage
            localStorage.setItem('savedItems', JSON.stringify(savedItems));
            saveCart();
            
            // Update UI
            const savedItem = document.querySelector(`.saved-item[data-id="${id}"]`);
            if (savedItem) {
                savedItem.remove();
            }
            
            // If no more saved items, remove section
            if (savedItems.length === 0) {
                const savedItemsSection = document.querySelector('.saved-items-section');
                if (savedItemsSection) {
                    savedItemsSection.remove();
                }
            }
            
            // Update cart
            renderCartItems();
            updateCartSummary();
            updateCartCount();
            
            // Show cart if it was empty
            if (cartItems.length === 1) {
                if (cartItemsContainer) cartItemsContainer.style.display = 'block';
                if (cartSummary) cartSummary.style.display = 'block';
                if (emptyCart) emptyCart.style.display = 'none';
                if (checkoutBtn) checkoutBtn.classList.remove('disabled');
            }
            
            // Show notification
            showNotification('Item moved to cart!', 'success');
        }
    }
    
    // Remove saved item
    function removeSavedItem(id) {
        // Get saved items
        const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
        
        // Filter out the item
        const updatedSavedItems = savedItems.filter(item => item.id !== id);
        
        // Save to localStorage
        localStorage.setItem('savedItems', JSON.stringify(updatedSavedItems));
        
        // Update UI
        const savedItem = document.querySelector(`.saved-item[data-id="${id}"]`);
        if (savedItem) {
            savedItem.remove();
        }
        
        // If no more saved items, remove section
        if (updatedSavedItems.length === 0) {
            const savedItemsSection = document.querySelector('.saved-items-section');
            if (savedItemsSection) {
                savedItemsSection.remove();
            }
        }
        
        // Show notification
        showNotification('Item removed from saved items!', 'info');
    }
    
    // Save item for later
    function saveForLater(id) {
        // Find item in cart
        const itemIndex = cartItems.findIndex(item => item.id === id);
        
        if (itemIndex !== -1) {
            // Get saved items
            const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
            
            // Add to saved items
            const item = cartItems[itemIndex];
            savedItems.push(item);
            
            // Remove from cart
            cartItems.splice(itemIndex, 1);
            
            // Save to localStorage
            localStorage.setItem('savedItems', JSON.stringify(savedItems));
            saveCart();
            
            // Update UI
            const cartItem = document.querySelector(`.cart-item[data-id="${id}"]`);
            if (cartItem) {
                cartItem.remove();
            }
            
            // Check if cart is empty
            if (cartItems.length === 0) {
                if (cartItemsContainer) cartItemsContainer.style.display = 'none';
                if (cartSummary) cartSummary.style.display = 'none';
                if (emptyCart) emptyCart.style.display = 'block';
                if (checkoutBtn) checkoutBtn.classList.add('disabled');
                
                // Remove bulk remove button
                const bulkRemoveBtn = document.querySelector('.bulk-remove-btn');
                if (bulkRemoveBtn) {
                    bulkRemoveBtn.remove();
                }
            }
            
            // Update cart summary and counts
            updateCartSummary();
            updateCartCount();
            
            // Update/create saved items section
            createSaveForLaterSection();
            
            // Show notification
            showNotification('Item saved for later!', 'success');
        }
    }
    
    // Add "Save for Later" buttons to cart items
    function addSaveForLaterButtons() {
        if (!cartItemsContainer) return;
        
        const cartItems = cartItemsContainer.querySelectorAll('.cart-item');
        
        cartItems.forEach(item => {
            // Check if button already exists
            if (item.querySelector('.save-for-later')) return;
            
            const itemDetails = item.querySelector('.item-details');
            
            if (itemDetails) {
                const saveButton = document.createElement('button');
                saveButton.classList.add('save-for-later');
                saveButton.textContent = 'Save for Later';
                
                itemDetails.appendChild(saveButton);
                
                // Add event listener
                saveButton.addEventListener('click', function() {
                    const id = item.dataset.id;
                    saveForLater(id);
                });
            }
        });
        
        // Add styles for save for later button
        const saveButtonStyle = document.createElement('style');
        saveButtonStyle.textContent = `
            .save-for-later {
                background: none;
                border: none;
                color: var(--accent);
                font-size: 0.8rem;
                cursor: pointer;
                padding: 0;
                margin-top: 5px;
                text-decoration: underline;
            }
            
            .save-for-later:hover {
                color: var(--primary);
            }
        `;
        
        document.head.appendChild(saveButtonStyle);
    }
    
    // Initialize cart on page load
    initCart();
    
    // Create saved items section if there are saved items
    createSaveForLaterSection();
    
    // Add "Save for Later" buttons to cart items
    addSaveForLaterButtons();
});