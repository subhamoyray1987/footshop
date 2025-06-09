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
            console.error("Error fetching or parsing shoelist.json:", error);
            productListContainer.innerHTML = `<div class="col-12 text-center py-5">
                                                  <h3>Failed to load products. Please check console for errors.</h3>
                                              </div>`;
        });

    function initializeFilters(products) {
        // 1. Determine Min/Max Prices from Products
        const prices = products.map(p => parseFloat(String(p.price).replace(/[₹,]/g, ''))).filter(p => !isNaN(p));
        const maxProductPrice = prices.length > 0 ? Math.max(...prices) : 5000;
        const minProductPrice = prices.length > 0 ? Math.min(...prices) : 0;

        currentFilters.minPrice = minProductPrice;
        currentFilters.maxPrice = maxProductPrice;

        // 2. Initialize Price Range Slider
        if (typeof jQuery !== 'undefined' && typeof jQuery().ionRangeSlider === 'function') {
            $(priceRangeSlider).ionRangeSlider({
                type: "double",
                min: minProductPrice,
                max: maxProductPrice,
                from: minProductPrice,
                to: maxProductPrice,
                prefix: "₹",
                skin: "round",
                onStart: function(data) {
                    minPriceDisplay.textContent = `₹${data.from.toFixed(2)}`;
                    maxPriceDisplay.textContent = `₹${data.to.toFixed(2)}`;
                },
                onChange: function(data) {
                    currentFilters.minPrice = data.from;
                    currentFilters.maxPrice = data.to;
                    minPriceDisplay.textContent = `₹${data.from.toFixed(2)}`;
                    maxPriceDisplay.textContent = `₹${data.to.toFixed(2)}`;
                    applyFiltersAndRenderProducts();
                }
            });
        } else {
            console.warn("ionRangeSlider is not initialized. Ensure jQuery and ion.rangeSlider.min.js are loaded.");
            if (priceRangeSlider) priceRangeSlider.closest('.sidebar-single').style.display = 'none';
        }


        // 3. Populate and Initialize Size Filter
        const uniqueSizes = new Set();
        products.forEach(p => {
            if (p.size && Array.isArray(p.size)) {
                // Ensure sizes are handled consistently as numbers or strings here if needed,
                // but filter logic will convert to number
                p.size.forEach(s => uniqueSizes.add(String(s))); // Store sizes as strings in Set for consistency
            }
        });
        const sortedSizes = Array.from(uniqueSizes).sort((a, b) => parseFloat(a) - parseFloat(b));

        sizeFilterContainer.innerHTML = ''; // Clear previous sizes
        const allSizesButton = document.createElement('li');
        allSizesButton.innerHTML = `<a href="#" data-size="all" class="size-filter-btn active">All</a>`; // Use lowercase "all"
        sizeFilterContainer.appendChild(allSizesButton);

        sortedSizes.forEach(size => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" data-size="${size}" class="size-filter-btn">${size}</a>`;
            sizeFilterContainer.appendChild(li);
        });

        // 4. Apply initial filters from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlCategory = urlParams.get('category');
        const urlSize = urlParams.get('size');
        const urlMinPrice = urlParams.get('min_price');
        const urlMaxPrice = urlParams.get('max_price');

        if (urlCategory) {
            currentFilters.category = urlCategory.toLowerCase(); // Ensure lowercase for comparison
            categoryFilters.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.category && btn.dataset.category.toLowerCase() === urlCategory.toLowerCase()) {
                    btn.classList.add('active');
                }
            });
        }

        if (urlSize) {
            currentFilters.size = urlSize; // Store as string for consistency from data-attribute
            setTimeout(() => { // Small delay to ensure dynamic elements are in DOM
                sizeFilterContainer.querySelectorAll('.size-filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.size === urlSize) {
                        btn.classList.add('active');
                    }
                });
            }, 0);
        }

        if (urlMinPrice || urlMaxPrice) {
            const sliderInstance = $(priceRangeSlider).data("ionRangeSlider");
            if (sliderInstance) {
                sliderInstance.update({
                    from: urlMinPrice ? parseFloat(urlMinPrice) : minProductPrice,
                    to: urlMaxPrice ? parseFloat(urlMaxPrice) : maxProductPrice
                });
            }
            currentFilters.minPrice = urlMinPrice ? parseFloat(urlMinPrice) : minProductPrice;
            currentFilters.maxPrice = urlMaxPrice ? parseFloat(urlMaxPrice) : maxProductPrice;
        }
    }


    function applyFiltersAndRenderProducts() {
        let filteredProducts = allProducts.filter(product => {
            const productCleanPrice = parseFloat(String(product.price).replace(/[₹,]/g, ''));

            // Category Filter: Convert both to lowercase for comparison
            const categoryMatch = currentFilters.category === "all" ||
                                  (product.category && product.category.toLowerCase() === currentFilters.category.toLowerCase());

            // Size Filter: Convert currentFilters.size to number for comparison with product.size array (which contains numbers)
            const sizeMatch = currentFilters.size === "all" || currentFilters.size === null ||
                             (product.size && Array.isArray(product.size) && product.size.includes(parseFloat(currentFilters.size)));


            // Price Filter
            const priceMatch = !isNaN(productCleanPrice) &&
                               productCleanPrice >= currentFilters.minPrice &&
                               productCleanPrice <= currentFilters.maxPrice;

            return categoryMatch && sizeMatch && priceMatch;
        });

        renderProducts(filteredProducts);
    }

    function renderProducts(productsToRender) {
        productListContainer.innerHTML = '';
        totalProductsFoundEl.textContent = productsToRender.length;

        if (productsToRender.length === 0) {
            noProductsMessage.classList.remove("d-none");
            return;
        } else {
            noProductsMessage.classList.add("d-none");
        }

        productsToRender.forEach(p => {
            const stars = p.rating >= 4
                ? '<span><i class="ion-android-star"></i></span>'.repeat(5)
                : '<span><i class="ion-android-star"></i></span>'.repeat(4) + '<span><i class="ion-android-star-outline"></i></span>';

            const cleanPrice = parseFloat(String(p.price).replace(/[₹,]/g, ""));
            let finalPrice = cleanPrice;
            let originalPrice = "";
            let badge = "";

            if (p.discounted && p.discount) {
                finalPrice = Math.round(cleanPrice * (1 - p.discount / 100));
                originalPrice = `₹${cleanPrice.toFixed(2)}`;
                badge = `<div class="product-badge bg-danger text-white position-absolute top-0 start-0 m-2 p-1 px-2 rounded">${p.discount}% OFF</div>`;
            }

            const defaultSize = p.size && p.size.length > 0 ? String(p.size[0]) : "One Size"; // Ensure default size is string

            const productHtml = `
                <div class="col">
                    <div class="product-item mb-50 position-relative">
                        ${badge}
                        <div class="product-thumb">
                            <a href="product-details.html?id=${p.id}" class="product-link">
                                <img src="${p.images[0]}" alt="${p.title}">
                            </a>
                        </div>
                        <div class="product-content">
                            <h5 class="product-brand">${p.brand || 'N/A'} // ${p.category || 'N/A'}</h5>
                            <h5 class="product-name">
                                <a href="product-details.html?id=${p.id}">${p.title}</a>
                            </h5>
                            <div class="ratings">${stars}</div>
                            <div class="price-box">
                                <span class="price-regular">₹${finalPrice.toFixed(2)}</span>
                                ${originalPrice ? `<span class="price-old"><del>${originalPrice}</del></span>` : ""}
                            </div>
                            <div class="product-action-link">
                                <a href="#" data-bs-toggle="tooltip" title="Wishlist"><i class="ion-android-favorite-outline"></i></a>
                                <a href="#" class="add-to-cart-btn"
                                   data-id="${p.id}"
                                   data-title="${p.title}"
                                   data-price="${finalPrice.toFixed(2)}"
                                   data-img="${p.images[0]}"
                                   data-size="${defaultSize}"
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
        $('[data-bs-toggle="tooltip"]').tooltip();
    }

    // Event Listeners for Filters
    categoryFilters.forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            categoryFilters.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            currentFilters.category = this.dataset.category.toLowerCase(); // Store as lowercase
            applyFiltersAndRenderProducts();
        });
    });

    sizeFilterContainer.addEventListener("click", function(e) {
        e.preventDefault();
        const target = e.target.closest(".size-filter-btn");
        if (target) {
            sizeFilterContainer.querySelectorAll(".size-filter-btn").forEach(b => b.classList.remove("active"));
            target.classList.add("active");
            currentFilters.size = target.dataset.size === "all" ? null : target.dataset.size; // "all" means no specific size filter
            applyFiltersAndRenderProducts();
        }
    });
});