// js/add-to-cart-handler.js
// This file handles global cart functions, universal quantity buttons,
// and ALL Add to Cart functionality (listing pages, related products, AND main product details button).

document.addEventListener("DOMContentLoaded", function() {
    const CART_KEY = "shoppingCart";
    const minicartNotification = document.querySelector(".minicart-btn .notification");
    const toaster = document.getElementById("toaster-message");

    // Helper functions for localStorage - ATTACHED TO WINDOW
    window.getCart = function() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch (e) {
            console.error("Error parsing cart from localStorage:", e);
            return [];
        }
    };

    window.setCart = function(cartData) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cartData));
            window.updateCartNotification();
        } catch (e) {
            console.error("Error saving cart to localStorage:", e);
        }
    };

    // Function to update the small notification bubble in the header - ATTACHED TO WINDOW
    window.updateCartNotification = function() {
        const currentCart = window.getCart();
        const totalItems = currentCart.reduce((sum, item) => sum + item.qty, 0);
        if (minicartNotification) {
            minicartNotification.textContent = totalItems > 0 ? totalItems : "";
            minicartNotification.style.display = totalItems > 0 ? "inline-block" : "none";
        }
    };

    // Function to show the toaster message with optional color - ATTACHED TO WINDOW
    window.showToaster = function(message, isError = false) {
        if (toaster) {
            toaster.textContent = message;
            if (isError) {
                toaster.style.backgroundColor = "#ff7777"; // Light red for error
            } else {
                toaster.style.backgroundColor = "#4CAF50"; // Green for success
            }
            toaster.style.display = "block";
            toaster.style.opacity = 1;

            setTimeout(() => {
                toaster.style.opacity = 0;
                setTimeout(() => {
                    toaster.style.display = "none";
                }, 300);
            }, 3000);
        } else {
            console.warn("Toaster element not found. Message:", message);
            console.log("Toaster message (fallback):", message);
        }
    };

    // --- Quantity Button Logic (UNIVERSAL - works on all pages with .qtybtn) ---
    document.body.addEventListener('click', function(event) {
        const target = event.target;
        const proQtyContainer = target.closest('.pro-qty');

        if (target.classList.contains('qtybtn') && proQtyContainer) {
            event.preventDefault();
            const quantityInput = proQtyContainer.querySelector('input[type="text"]');

            if (quantityInput) {
                let currentQuantity = parseInt(quantityInput.value, 10);

                if (target.classList.contains('inc')) {
                    currentQuantity++;
                } else if (target.classList.contains('dec')) {
                    currentQuantity = Math.max(1, currentQuantity - 1);
                }

                quantityInput.value = currentQuantity;

                // If on product details page, and currentProduct is loaded, update the displayed price
                // This relies on product-details.js to define window.currentProduct and window.updateProductPagePrice
                if (document.body.classList.contains('product-details-page') && typeof window.updateProductPagePrice === 'function' && window.currentProduct) {
                    window.updateProductPagePrice(currentQuantity, window.currentProduct);
                }
            }
        }
    });

    // --- Add to Cart Button Logic (UNIVERSAL - handles all add-to-cart buttons) ---
    document.body.addEventListener("click", function(event) {
        const addToCartBtn = event.target.closest(".add-to-cart-btn");

        if (addToCartBtn) {
            event.preventDefault(); // Prevent default link behavior

            let cart = window.getCart();
            const productId = addToCartBtn.dataset.id;
            const productTitle = addToCartBtn.dataset.title;
            const productPrice = addToCartBtn.dataset.price;
            const productImage = addToCartBtn.dataset.img;
            let productSize = addToCartBtn.dataset.size || '6'; // Default for listing/related products

            let toasterMessage = "";
            let isToasterError = false;

            // --- CRUCIAL CHANGE HERE: Double-check the condition ---
            // Check if this is the main product details page's Add to Cart button
            // This combines the ID check with the page class check for robustness
            if (addToCartBtn.id === "main-product-add-to-cart-btn" && document.body.classList.contains('product-details-page')) {
                const sizeEl = document.querySelector(".shoe_size"); // Get the UL element for sizes
                const sizeWarning = document.querySelector(".size-warning"); // Get reference to the warning span
                const quantityInput = document.getElementById("product-quantity");

                // Get selected size from the LI with 'selected' class
                const selectedSizeLi = sizeEl ? sizeEl.querySelector('li.selected') : null;

                if (!selectedSizeLi || !selectedSizeLi.dataset.size) {
                    // Size is NOT selected, show warning and stop
                    if (sizeWarning) sizeWarning.classList.remove("d-none");
                    window.showToaster("Please select a size first!", true);
                    return; // Stop execution
                } else {
                    productSize = selectedSizeLi.dataset.size; // Use the selected size
                    if (sizeWarning) sizeWarning.classList.add("d-none"); // Hide warning if size is selected
                }

                const quantity = parseInt(quantityInput?.value || '1', 10);
                // Validate Quantity (still required, quantity must be at least 1)
                if (isNaN(quantity) || quantity < 1) {
                    window.showToaster("Please enter a valid quantity (at least 1)!", true);
                    return; // Stop execution
                }

                // Disable button to prevent double clicks
                addToCartBtn.disabled = true; // Re-enable later in try/catch or finally

                // Add/Update item in cart for main product details
                const existingItemIndex = cart.findIndex(
                    item => String(item.id) === String(productId) && String(item.size) === String(productSize)
                );

                if (existingItemIndex > -1) {
                    cart[existingItemIndex].qty += quantity;
                    toasterMessage = `Updated quantity for ${productTitle} (Size: ${productSize}) to ${cart[existingItemIndex].qty} in cart.`;
                } else {
                    cart.push({
                        id: productId,
                        title: productTitle,
                        price: parseFloat(productPrice).toFixed(2), // Ensure price is formatted
                        img: productImage,
                        size: productSize,
                        qty: quantity
                    });
                    toasterMessage = `${productTitle} (Size: ${productSize}) added to cart!`;
                }

                try {
                    window.setCart(cart);
                    window.showToaster(toasterMessage, isToasterError);
                    // Redirect to cart page after a short delay to allow toaster to show
                    setTimeout(() => {
                         window.location.href = "cart.html";
                    }, 500); // Redirect after 0.5 seconds
                } catch (e) {
                    console.error("Failed to update cart:", e);
                    window.showToaster("There was an issue updating your cart. Please try again.", true);
                    addToCartBtn.disabled = false; // Re-enable button on failure
                }

            } else {
                // Logic for listing pages and related products (non-main product details buttons)
                // This section remains as it was to prevent re-adding duplicates from listing pages.
                const existingItemIndex = cart.findIndex(
                    item => String(item.id) === String(productId) && String(item.size) === String(productSize)
                );

                if (existingItemIndex > -1) {
                    toasterMessage = `The product is already added to the cart. You can't add the same product multiple times from here. Go to the product details page to update quantity or select other sizes.`;
                    isToasterError = true;
                } else {
                    cart.push({
                        id: productId,
                        title: productTitle,
                        price: productPrice,
                        img: productImage,
                        size: productSize,
                        qty: 1
                    });
                    toasterMessage = `${productTitle} (Size: ${productSize}) added to cart! For other sizes, go to the product details page.`;
                }
                
                window.setCart(cart);
                window.showToaster(toasterMessage, isToasterError);
            }
        }
    });

    // Initialize notification on page load
    window.updateCartNotification();
});
