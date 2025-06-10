document.addEventListener("DOMContentLoaded", function() {
    let allProducts = []; // Stores all products fetched from JSON
    let currentFilters = {
        category: "all", // Changed to lowercase to match your data-attributes
        size: null, // Specific size, e.g., "7", "8", null for all
        minPrice: 0,
        maxPrice: 5000 // Default max, will be updated from data
    };

    // DOM Elements
    const productListContainer = document.getElementById("product-list-container");
    const categoryFilters = document.querySelectorAll(".category-filter");
    const sizeFilterContainer = document.querySelector(".size-filter");
    const priceRangeSlider = document.getElementById("price-range-slider");
    const minPriceDisplay = document.getElementById("min-price-display");
    const maxPriceDisplay = document.getElementById("max-price-display");
    const totalProductsFoundEl = document.querySelector(".total-products-found span");
    const noProductsMessage = document.querySelector(".no-products-message");

    // Fetch products and initialize
    fetch("js/shoelist.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            allProducts = products;
            initializeFilters(products); // Sets up initial filter states including URL params
            applyFiltersAndRenderProducts(); // Renders products based on initial filters
        })
        .catch(error => {
            console.error("Error fetching products:", error);
            productListContainer.innerHTML = "<p>Error loading products. Please try again later.</p>";
            noProductsMessage.style.display = "block"; // Show error message if products fail to load
        });

    function initializeFilters(products) {
        // Determine the overall min and max prices from the data for the slider
        const prices = products.map(p => parseFloat(p.price.replace(/[₹,]/g, '')));
        const minOverallPrice = Math.floor(Math.min(...prices));
        const maxOverallPrice = Math.ceil(Math.max(...prices));

        currentFilters.minPrice = minOverallPrice;
        currentFilters.maxPrice = maxOverallPrice;

        // Initialize Ion.RangeSlider
        if (priceRangeSlider) {
            $(priceRangeSlider).ionRangeSlider({
                type: "double",
                min: minOverallPrice,
                max: maxOverallPrice,
                from: currentFilters.minPrice,
                to: currentFilters.maxPrice,
                prefix: "₹",
                onFinish: function(data) {
                    currentFilters.minPrice = data.from;
                    currentFilters.maxPrice = data.to;
                    applyFiltersAndRenderProducts();
                }
            });
            // Update display initially
            minPriceDisplay.textContent = `₹${currentFilters.minPrice}`;
            maxPriceDisplay.textContent = `₹${currentFilters.maxPrice}`;
        }


        // Handle URL parameters for initial filters
        const urlParams = new URLSearchParams(window.location.search);

        const categoryParam = urlParams.get("category");
        if (categoryParam) {
            const normalizedCategory = categoryParam.toLowerCase();
            currentFilters.category = normalizedCategory;
            // Activate the corresponding category button
            categoryFilters.forEach(btn => {
                if (btn.dataset.category.toLowerCase() === normalizedCategory) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });
        } else {
             // If no category param, ensure "All" is active by default
             const allCategoryBtn = document.querySelector('.category-filter[data-category="All"]');
             if(allCategoryBtn) allCategoryBtn.classList.add("active");
        }


        const sizeParam = urlParams.get("size");
        if (sizeParam) {
            currentFilters.size = sizeParam;
            // Activate the corresponding size button
            sizeFilterContainer.querySelectorAll(".size-filter-btn").forEach(btn => {
                if (btn.dataset.size === sizeParam) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });
        } else {
             // If no size param, ensure "All" size button is active by default
             const allSizeBtn = document.querySelector('.size-filter-btn[data-size="All"]');
             if(allSizeBtn) allSizeBtn.classList.add("active");
        }

        const minPriceParam = parseFloat(urlParams.get("min_price"));
        const maxPriceParam = parseFloat(urlParams.get("max_price"));
        if (!isNaN(minPriceParam)) {
            currentFilters.minPrice = minPriceParam;
        }
        if (!isNaN(maxPriceParam)) {
            currentFilters.maxPrice = maxPriceParam;
        }

        // Update price slider if params are used
        if ((!isNaN(minPriceParam) || !isNaN(maxPriceParam)) && priceRangeSlider) {
             const slider = $(priceRangeSlider).data("ionRangeSlider");
             if (slider) {
                 slider.update({
                     from: currentFilters.minPrice,
                     to: currentFilters.maxPrice
                 });
             }
         }
         minPriceDisplay.textContent = `₹${currentFilters.minPrice}`;
         maxPriceDisplay.textContent = `₹${currentFilters.maxPrice}`;
    }

    function applyFiltersAndRenderProducts() {
        let filteredProducts = allProducts.filter(p => {
            const productPrice = parseFloat(p.price.replace(/[₹,]/g, ''));
            const productCategory = p.category ? p.category.toLowerCase() : '';
            const productSizes = Array.isArray(p.size) ? p.size.map(s => String(s)) : [];

            // Category filter
            if (currentFilters.category && currentFilters.category !== "all" && productCategory !== currentFilters.category) {
                return false;
            }

            // Size filter
            if (currentFilters.size && currentFilters.size !== "All" && !productSizes.includes(String(currentFilters.size))) {
                return false;
            }

            // Price range filter
            if (productPrice < currentFilters.minPrice || productPrice > currentFilters.maxPrice) {
                return false;
            }

            return true;
        });

        // Sort products - you can add sorting logic here if needed
        // For example:
        // filteredProducts.sort((a, b) => parseFloat(a.price.replace(/[₹,]/g, '')) - parseFloat(b.price.replace(/[₹,]/g, '')));

        productListContainer.innerHTML = ""; // Clear current products
        if (filteredProducts.length === 0) {
            noProductsMessage.style.display = "block"; // Show no products message
            totalProductsFoundEl.textContent = "0"; // Update product count
            return;
        } else {
            noProductsMessage.style.display = "none"; // Hide no products message
            totalProductsFoundEl.textContent = filteredProducts.length; // Update product count
        }


        filteredProducts.forEach(p => {
            const cleanPrice = parseFloat(p.price.replace(/[₹,]/g, ''));
            let finalPrice = cleanPrice;
            let badge = "";
            let oldPriceHTML = "";

            if (p.discounted && p.discount) {
                finalPrice = Math.round(cleanPrice * (1 - p.discount / 100));
                badge = `<div class=\"product-badge bg-danger text-white position-absolute top-0 start-0 m-2 p-1 px-2 rounded\">${p.discount}% OFF</div>`;
                oldPriceHTML = `<span class=\"price-old\"><del>₹${cleanPrice}</del></span>`;
            }

            const starRating = p.rating >= 4
                ? '<div class=\"ratings\">' + '<span><i class=\"ion-android-star\"></i></span>'.repeat(5) + '</div>'
                : '<div class=\"ratings\">' + '<span><i class=\"ion-android-star\"></i></span>'.repeat(Math.floor(p.rating)) + '<span><i class=\"ion-android-star-half\"></i></span>'.repeat(p.rating % 1 !== 0 ? 1 : 0) + '<span><i class=\"ion-android-star-outline\"></i></span>'.repeat(5 - Math.ceil(p.rating)) + '</div>';

            const productHtml = `
                <div class="col">
                    <div class="product-item mb-50">
                        <div class="product-thumb">
                            ${badge}
                            <a href="product-details.html?id=${p.id}">
                                <img src="${p.images[0]}" alt="product thumb">
                            </a>
                        </div>
                        <div class="product-content">
                            <h5 class="product-name">
                                <a href="product-details.html?id=${p.id}">${p.title}</a>
                            </h5>
                            <div class="price-box">
                                <span class="price-regular">₹${finalPrice}</span>
                                ${oldPriceHTML}
                            </div>
                            ${starRating}
                            <div class="product-action-link">
                                <a href="#" class="wishlist-btn"
                                   data-id="${p.id}"
                                   data-title="${p.title}"
                                   data-price="${finalPrice}"
                                   data-img="${p.images[0]}"
                                   data-bs-toggle="tooltip" title="Wishlist">
                                    <i class="ion-android-favorite-outline"></i>
                                </a>
                                <a href="#" class="add-to-cart-btn"
                                    data-id="${p.id}"
                                    data-title="${p.title}"
                                    data-price="${finalPrice}"
                                    data-img="${p.images[0]}"
                                    data-bs-toggle="tooltip" title="Add To Cart">
                                    <i class="ion-bag"></i>
                                </a>
                                <a href="product-details.html?id=${p.id}">
                                    <span data-bs-toggle="tooltip" title="Quick View"><i class="ion-ios-eye-outline"></i></span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            productListContainer.insertAdjacentHTML('beforeend', productHtml);
        });
        // Re-initialize tooltips for newly rendered products
        $('[data-bs-toggle="tooltip"]').tooltip();
    }

    // Event Listeners for Filters
    // Category Filter Buttons
    categoryFilters.forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            categoryFilters.forEach(b => b.classList.remove("active")); // Remove active from all
            this.classList.add("active"); // Add active to clicked one
            currentFilters.category = this.dataset.category.toLowerCase(); // Store as lowercase
            applyFiltersAndRenderProducts(); // Apply filters and re-render
        });
    });

    // Size Filter Buttons (uses event delegation on parent container)
    sizeFilterContainer.addEventListener("click", function(e) {
        e.preventDefault();
        const target = e.target.closest(".size-filter-btn"); // Find the clicked button or its parent
        if (target) {
            sizeFilterContainer.querySelectorAll(".size-filter-btn").forEach(b => b.classList.remove("active"));
            target.classList.add("active");
            currentFilters.size = target.dataset.size === "all" ? null : target.dataset.size; // "all" means no specific size filter
            applyFiltersAndRenderProducts();
        }
    });

    // The initial URL parameter handling is now integrated within `initializeFilters` for better flow.
    // This ensures `currentFilters` are set correctly before the first `applyFiltersAndRenderProducts()` call.
});