// Product Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Product Image Gallery
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    if (thumbnails.length > 0 && mainImage) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                // Update main image
                const imagePath = this.getAttribute('data-image');
                if (imagePath) {
                    mainImage.src = imagePath;
                }
                
                // Update active thumbnail
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    // Size Selection
    const sizeButtons = document.querySelectorAll('.size-options .option-btn');
    
    if (sizeButtons.length > 0) {
        sizeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active size
                sizeButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    // Color Selection
    const colorButtons = document.querySelectorAll('.color-options .option-btn');
    
    if (colorButtons.length > 0) {
        colorButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active color
                colorButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    // Quantity Controls
    const quantityInput = document.querySelector('.quantity-input');
    const decreaseBtn = document.querySelector('.quantity-btn.decrease');
    const increaseBtn = document.querySelector('.quantity-btn.increase');
    
    if (quantityInput && decreaseBtn && increaseBtn) {
        decreaseBtn.addEventListener('click', function() {
            let quantity = parseInt(quantityInput.value);
            if (quantity > 1) {
                quantityInput.value = quantity - 1;
            }
        });
        
        increaseBtn.addEventListener('click', function() {
            let quantity = parseInt(quantityInput.value);
            if (quantity < 10) {
                quantityInput.value = quantity + 1;
            }
        });
        
        quantityInput.addEventListener('change', function() {
            let quantity = parseInt(this.value);
            if (isNaN(quantity) || quantity < 1) {
                this.value = 1;
            } else if (quantity > 10) {
                this.value = 10;
            }
        });
    }
    
    // Add to Cart Button
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            // Get selected options
            const selectedSize = document.querySelector('.size-options .option-btn.active')?.getAttribute('data-size') || 'M';
            const selectedColor = document.querySelector('.color-options .option-btn.active')?.getAttribute('data-color') || 'Default';
            const quantity = parseInt(quantityInput?.value || 1);
            
            // Product info
            const productName = document.querySelector('.product-info h1')?.textContent || 'Product';
            const productPrice = parseFloat(document.querySelector('.product-price')?.textContent.replace('$', '') || 0);
            const productImage = mainImage?.src || '';
            
            // Create cart item object
            const cartItem = {
                id: new Date().getTime(), // Using timestamp as temporary ID
                name: productName,
                price: productPrice,
                size: selectedSize,
                color: selectedColor,
                quantity: quantity,
                image: productImage
            };
            
            // Add to cart (in a real application, this would add to localStorage or send to backend)
            addItemToCart(cartItem);
            
            // Show success message
            alert('Product added to cart successfully!');
        });
    }
    
    // Add to cart function
    function addItemToCart(item) {
        // Get existing cart from localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Add new item to cart
        cart.push(item);
        
        // Save cart back to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart icon (optional)
        updateCartCount();
    }
    
    // Update cart count
    function updateCartCount() {
        // Get cart from localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let count = cart.reduce((total, item) => total + item.quantity, 0);
        
        // Update cart icon if it has a count indicator
        const cartIcon = document.querySelector('.header-icons a[href="cart.html"]');
        
        if (cartIcon) {
            // Check if cart count element exists
            let cartCount = cartIcon.querySelector('.cart-count');
            
            if (!cartCount) {
                // Create cart count element if it doesn't exist
                cartCount = document.createElement('span');
                cartCount.classList.add('cart-count');
                cartIcon.appendChild(cartCount);
            }
            
            // Update cart count
            if (count > 0) {
                cartCount.textContent = count;
                cartCount.style.display = 'block';
            } else {
                cartCount.style.display = 'none';
            }
        }
    }
    
    // Product Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    if (tabButtons.length > 0 && tabPanes.length > 0) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active tab button
                tabButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Show active tab pane
                const tabId = this.getAttribute('data-tab');
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.id === tabId) {
                        pane.classList.add('active');
                    }
                });
            });
        });
    }
    
    // Review Form Rating Select
    const ratingStars = document.querySelectorAll('.rating-star');
    let selectedRating = 0;
    
    if (ratingStars.length > 0) {
        ratingStars.forEach(star => {
            // Hover effect
            star.addEventListener('mouseover', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                highlightStars(rating);
            });
            
            // Mouse leave effect
            star.addEventListener('mouseleave', function() {
                highlightStars(selectedRating);
            });
            
            // Click effect
            star.addEventListener('click', function() {
                selectedRating = parseInt(this.getAttribute('data-rating'));
                highlightStars(selectedRating);
                
                // Add hidden input for form submission
                const ratingInput = document.querySelector('input[name="rating"]');
                if (ratingInput) {
                    ratingInput.value = selectedRating;
                } else {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'rating';
                    input.value = selectedRating;
                    const reviewForm = document.querySelector('.review-form');
                    if (reviewForm) {
                        reviewForm.appendChild(input);
                    }
                }
            });
        });
    }
    
    // Function to highlight stars up to a specific rating
    function highlightStars(rating) {
        ratingStars.forEach(star => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            if (starRating <= rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
    
    // Initialize cart count on page load
    updateCartCount();
    
    // Add to recently viewed
    const productTitle = document.querySelector('.product-info h1');
    
    if (productTitle) {
        // Get product details
        const productName = productTitle.textContent;
        const productPrice = document.querySelector('.product-price')?.textContent || '';
        const productImage = mainImage?.src || '';
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
});