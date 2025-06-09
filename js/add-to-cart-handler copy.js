// This is a reference for what add-to-cart-handler.js should contain.
// DO NOT replace its entire content without merging your existing logic.

document.addEventListener("DOMContentLoaded", function() {
    const CART_KEY = "shoppingCart";
    const minicartNotification = document.querySelector(".minicart-btn .notification");
  
    // Helper functions for localStorage
    function getCart() {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    }
  
    function setCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartNotification();
    }
  
    // Function to update the small notification bubble in the header
    window.updateCartNotification = function() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        if (minicartNotification) {
            minicartNotification.textContent = totalItems > 0 ? totalItems : "";
            minicartNotification.style.display = totalItems > 0 ? "inline-block" : "none";
        }
    };
  
    // Main logic for adding to cart from anywhere
    document.body.addEventListener("click", function(event) {
        // Handle "Add to Cart" button clicks
        const addToCartBtn = event.target.closest(".add-to-cart-btn");
        if (addToCartBtn) {
            event.preventDefault(); // Prevent default link behavior
  
            const productId = addToCartBtn.dataset.id;
            const productTitle = addToCartBtn.dataset.title;
            const productPrice = addToCartBtn.dataset.price;
            const productImage = addToCartBtn.dataset.img;
            // Get size: from button if available, or from dropdown if on product details page
            let productSize = addToCartBtn.dataset.size || "6"; // Default size for listing pages
  
            let cart = getCart();
            let addedToCart = false;
  
            // Check if this is the product details page and size is selected
            if (document.body.classList.contains('product-details-page')) {
                // On product details page, size selection is mandatory and handled by product-details.js
                // This handler should ideally be triggered by product-details.js which gets the selected size.
                // For simplicity here, assuming product-details.js updates a hidden input or global var.
                // Or, the add-to-cart-btn on product details page should have the selected size data.
                const selectedSizeElement = document.querySelector('.pro-details-size-content .product-size-active');
                if (selectedSizeElement) {
                    productSize = selectedSizeElement.textContent.trim();
                } else {
                    alert("Please select a size before adding to cart.");
                    return; // Stop if no size is selected on product details page
                }
  
                // Get quantity from product details page
                const qtyInput = document.querySelector('.pro-qty input');
                let quantity = qtyInput ? parseInt(qtyInput.value, 10) : 1;
                if (isNaN(quantity) || quantity < 1) quantity = 1;
  
                const existingItemIndex = cart.findIndex(
                    item => String(item.id) === String(productId) && String(item.size) === String(productSize)
                );
  
                if (existingItemIndex > -1) {
                    cart[existingItemIndex].qty += quantity;
                } else {
                    cart.push({
                        id: productId,
                        title: productTitle,
                        price: productPrice,
                        img: productImage,
                        size: productSize,
                        qty: quantity
                    });
                }
                addedToCart = true;
  
            } else {
                // For listing pages (index.html, shop.html), default to the size provided by data-size (usually first available or "Default")
                // If a product has multiple sizes but no size is selected on a listing, we use data-size.
                const existingItemIndex = cart.findIndex(
                    item => String(item.id) === String(productId) && String(item.size) === String(productSize)
                );
  
                if (existingItemIndex > -1) {
                    alert("This item is already in your cart (size: 6). You can adjust quantity in the cart.");
                } else {
                    cart.push({
                        id: productId,
                        title: productTitle,
                        price: productPrice,
                        img: productImage,
                        size: productSize, // Use default size for listing page
                        qty: 1
                    });
                    addedToCart = true;
                }
            }
  
            if (addedToCart) {
                setCart(cart);
                alert(`${productTitle} (Size: ${productSize}) added to cart!`);
                // Optionally, trigger a mini cart popup if you have one
            }
        }
    });
  
    // Initialize notification on page load
    updateCartNotification();
  });