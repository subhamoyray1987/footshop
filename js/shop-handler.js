// js/shop-handler.js
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
            applyFiltersAndRenderProducts();
        })
        .catch(error => {
            console.error("Error loading products:", error);
            productListContainer.innerHTML = "<p class='text-danger'>Failed to load products. Please try again later.</p>";
        });

    // Function to initialize filters based on data and URL parameters
    function initializeFilters(products) {
        // Determine max price from products
        const prices = products.map(p => parseFloat(p.price.replace(/[₹,]/g, '')));
        const maxProductPrice = prices.length ? Math.max(...prices) : 5000;
        currentFilters.maxPrice = maxProductPrice; // Set initial max price

        // Initialize price range slider
        $(priceRangeSlider).ionRangeSlider({
            type: "double",
            min: 0,
            max: maxProductPrice,
            from: 0,
            to: maxProductPrice,
            prefix: "₹",
            skin: "round",
            onStart: function(data) {
                minPriceDisplay.textContent = `₹${data.from}`;
                maxPriceDisplay.textContent = `₹${data.to}`;
            },
            onChange: function(data) {
                minPriceDisplay.textContent = `₹${data.from}`;
                maxPriceDisplay.textContent = `₹${data.to}`;
                currentFilters.minPrice = data.from;
                currentFilters.maxPrice = data.to;
                applyFiltersAndRenderProducts();
            }
        });

        // Populate size filters dynamically
        const allSizes = [...new Set(products.flatMap(p => p.size || []))].sort((a, b) => a - b);
        sizeFilterContainer.innerHTML = '<li><a href="#" class="size-filter-btn active" data-size="all">All</a></li>';
        allSizes.forEach(size => {
            if (size !== null && size !== undefined && size !== '') { // Ensure size is valid
                sizeFilterContainer.innerHTML += `<li><a href="#" class="size-filter-btn" data-size="${size}">${size}</a></li>`;
            }
        });

        // Check URL parameters for initial filters
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        const sizeParam = urlParams.get('size');

        if (categoryParam) {
            currentFilters.category = categoryParam.toLowerCase();
            categoryFilters.forEach(btn => {
                if (btn.dataset.category.toLowerCase() === currentFilters.category) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }

        if (sizeParam) {
            currentFilters.size = sizeParam.toLowerCase();
            sizeFilterContainer.querySelectorAll(".size-filter-btn").forEach(btn => {
                if (btn.dataset.size.toLowerCase() === currentFilters.size) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }


    // Function to filter products based on currentFilters
    function filterProducts(products) {
        return products.filter(p => {
            const cleanPrice = parseFloat(p.price.replace(/[₹,]/g, ''));

            // Category filter
            if (currentFilters.category !== "all" && p.category && p.category.toLowerCase() !== currentFilters.category) {
                return false;
            }

            // Size filter
            if (currentFilters.size && currentFilters.size !== "all") {
                const parsedFilterSize = parseInt(currentFilters.size);
                // Ensure p.size is an array and contains the filtered size
                if (!Array.isArray(p.size) || !p.size.includes(parsedFilterSize)) {
                    return false;
                }
            }


            // Price range filter
            if (cleanPrice < currentFilters.minPrice || cleanPrice > currentFilters.maxPrice) {
                return false;
            }

            return true;
        });
    }

    // Function to render products
    function renderProducts(products) {
        productListContainer.innerHTML = ""; // Clear existing products
        if (products.length === 0) {
            noProductsMessage.classList.remove("d-none");
            totalProductsFoundEl.textContent = "0";
            return;
        } else {
            noProductsMessage.classList.add("d-none");
            totalProductsFoundEl.textContent = products.length;
        }

        products.forEach(p => {
            const cleanPrice = parseFloat(p.price.replace(/[₹,]/g, ''));
            let finalPrice = cleanPrice;
            let badge = "";
            let oldPriceHTML = "";

            if (p.discounted && p.discount) {
                finalPrice = Math.round(cleanPrice * (1 - p.discount / 100));
                badge = `<div class="product-badge bg-danger text-white position-absolute top-0 start-0 m-2 p-1 px-2 rounded">${p.discount}% OFF</div>`;
                oldPriceHTML = `<span class="price-old"><del>₹${cleanPrice.toFixed(2)}</del></span>`;
            }

            const starRating = p.rating >= 4
                ? '<div class="ratings">' + '<span><i class="ion-android-star"></i></span>'.repeat(5) + '</div>'
                : '<div class="ratings">' + '<span><i class="ion-android-star"></i></span>'.repeat(Math.round(p.rating)) + '<span><i class="ion-android-star-outline"></i></span>'.repeat(5 - Math.round(p.rating)) + '</div>';

            const productHtml = `
                <div class="col">
                    <div class="product-item">
                        <div class="product-thumb">
                            <a href="product-details.html?id=${p.id}">
                                <img src="${p.images[0]}" alt="${p.title}">
                            </a>
                            ${badge}
                        </div>
                        <div class="product-content">
                            <h5 class="product-name">
                                <a href="product-details.html?id=${p.id}">${p.title}</a>
                            </h5>
                            <div class="price-box">
                                <span class="price-regular">₹${finalPrice.toFixed(2)}</span>
                                ${oldPriceHTML}
                            </div>
                            ${starRating}
                            <div class="product-action-link">
                                <a href="#" class="wishlist-btn"
                                   data-id="${p.id}"
                                   data-title="${p.title}"
                                   data-price="${finalPrice.toFixed(2)}"
                                   data-img="${p.images[0]}"
                                   data-bs-toggle="tooltip" title="Wishlist">
                                   <i class="ion-android-favorite-outline"></i>
                                </a>
                                <a href="#" class="add-to-cart-btn"
                                   data-id="${p.id}"
                                   data-title="${p.title}"
                                   data-price="${finalPrice.toFixed(2)}"
                                   data-img="${p.images[0]}"
                                   data-size="${p.size && p.size.length > 0 ? p.size[0] : ''}" 
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

    // Function to apply all filters and re-render products
    function applyFiltersAndRenderProducts() {
        const filteredProducts = filterProducts(allProducts);
        renderProducts(filteredProducts);
    }

    // Event Listeners for Filters
    // Category Filter Buttons
    categoryFilters.forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            categoryFilters.forEach(b => b.classList.remove("active")); // Remove active from all
            this.classList.add("active"); // Add active to clicked one
            currentFilters.category = this.dataset.category.toLowerCase(); // Update filter state
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
            // Set currentFilters.size as a string, but make sure "all" is null
            currentFilters.size = target.dataset.size === "all" ? null : target.dataset.size;
            applyFiltersAndRenderProducts();
        }
    });

    // The initial URL parameter handling is now integrated within `initializeFilters` for better flow.
    // This ensures `currentFilters` are set correctly before the first `applyFiltersAndRenderProducts()` call.


    const toggleBtn = document.getElementById("filter-toggle");
        const sidebar = document.querySelector(".sidebar-wrapper");
        const backdrop = document.createElement("div");
        backdrop.classList.add("sidebar-backdrop");

        document.body.appendChild(backdrop);

        toggleBtn?.addEventListener("click", function () {
            sidebar.classList.add("open");
            backdrop.classList.add("show");
        });

        // Close on backdrop click or filter option click
        backdrop.addEventListener("click", closeSidebar);
        // Also close sidebar when a category or size filter is clicked on mobile
        sidebar.querySelectorAll("a.category-filter, a.size-filter-btn").forEach(link => {
            link.addEventListener("click", closeSidebar);   
        });

        function closeSidebar() {
            sidebar.classList.remove("open");
            backdrop.classList.remove("show");
        }
});