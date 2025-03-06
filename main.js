// Main JavaScript File for Punjab Drip
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuIcon = document.querySelector('.menu-icon');
    const nav = document.querySelector('nav');
    
    if (menuIcon && nav) {
        menuIcon.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('nav ul li a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                nav.classList.remove('active');
            });
        });
    }
    
    // Search toggle
    const searchIcon = document.getElementById('search-icon');
    const searchContainer = document.getElementById('search-container');
    const closeSearch = document.getElementById('close-search');
    
    if (searchIcon && searchContainer && closeSearch) {
        searchIcon.addEventListener('click', function(e) {
            e.preventDefault();
            searchContainer.classList.toggle('active');
        });
        
        closeSearch.addEventListener('click', function() {
            searchContainer.classList.remove('active');
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href !== '#' && href.startsWith('#')) {
                e.preventDefault();
                
                const target = document.querySelector(this.getAttribute('href'));
                
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Add to cart functionality for product listings
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const productId = this.getAttribute('data-id');
                const productName = this.closest('.product-card').querySelector('h3').textContent;
                const productPrice = parseFloat(this.closest('.product-card').querySelector('.price').textContent.replace('$', ''));
                const productImage = this.closest('.product-card').querySelector('img').src;
                
                // Create cart item
                const cartItem = {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1,
                    size: 'M', // Default size
                    color: 'Default' // Default color
                };
                
                // Add to cart
                addToCart(cartItem);
                
                // Show notification
                showNotification('Product added to cart!');
            });
        });
    }
    
    // Add to cart function
    function addToCart(item) {
        // Get existing cart from localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
        
        if (existingItemIndex !== -1) {
            // Item exists, increase quantity
            cart[existingItemIndex].quantity += item.quantity;
        } else {
            // Item doesn't exist, add to cart
            cart.push(item);
        }
        
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
    }
    
    // Update cart count in header
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        
        // Check if cart count element exists
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
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.classList.add('notification');
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
    
    // Initialize cart count on page load
    updateCartCount();
    
    // Recently viewed products
    function addToRecentlyViewed() {
        // Check if we're on a product page
        const productTitle = document.querySelector('.product-info h1');
        
        if (productTitle) {
            const productName = productTitle.textContent;
            const productPrice = document.querySelector('.product-price').textContent;
            const productImage = document.querySelector('.main-image img').src;
            const productUrl = window.location.href;
            
            // Create product object
            const product = {
                name: productName,
                price: productPrice,
                image: productImage,
                url: productUrl
            };
            
            // Get existing recently viewed products
            let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
            
            // Check if product is already in the list
            const exists = recentlyViewed.some(item => item.name === product.name);
            
            if (!exists) {
                // Add to beginning of array
                recentlyViewed.unshift(product);
                
                // Limit to 4 items
                recentlyViewed = recentlyViewed.slice(0, 4);
                
                // Save to localStorage
                localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
            }
        }
    }
    
    // Display recently viewed products
    function displayRecentlyViewed() {
        const recentlyViewedContainer = document.querySelector('.recently-viewed .product-slider');
        
        if (recentlyViewedContainer) {
            const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
            
            if (recentlyViewed.length === 0) {
                // Show empty message
                recentlyViewedContainer.innerHTML = '<p class="empty-message">No recently viewed items</p>';
            } else {
                // Clear container
                recentlyViewedContainer.innerHTML = '';
                
                // Add products
                recentlyViewed.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card');
                    productCard.innerHTML = `
                        <div class="product-image">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                        <div class="product-info">
                            <h3><a href="${product.url}">${product.name}</a></h3>
                            <div class="product-price">${product.price}</div>
                        </div>
                    `;
                    
                    recentlyViewedContainer.appendChild(productCard);
                });
            }
        }
    }
    
    // Add to recently viewed on product page
    addToRecentlyViewed();
    
    // Display recently viewed products
    displayRecentlyViewed();
    
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
        }
        
        .notification.active {
            transform: translateX(0);
        }
        
        .notification-content {
            background-color: #333;
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
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
    
    document.head.appendChild(style);
});