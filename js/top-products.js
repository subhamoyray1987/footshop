document.addEventListener("DOMContentLoaded", function () {
    fetch('js/shoelist.json')
        .then(response => response.json())
        .then(data => {
            renderTopProducts(data);
            renderTopSellers(data);
            activateTooltips();
        })
        .catch(error => console.error("Failed to load shoelist.json:", error));
});

// 🔹 1. Top 12 Products Section
function renderTopProducts(products) {
    const top12 = products.slice(0, 12);
    const container = document.querySelector(".product-carousel-4");
    if (!container) return;

    container.innerHTML = "";

    top12.forEach(product => {
        const cleanPrice = parseFloat(product.price.replace(/[₹,]/g, ''));
        let finalPrice = cleanPrice;
        let badge = "";
        let oldPriceHTML = "";

        if (product.discounted && product.discount) {
            finalPrice = Math.round(cleanPrice * (1 - product.discount / 100));
            badge = `<div class="product-badge bg-danger text-white position-absolute top-0 start-0 m-2 p-1 px-2 rounded">${product.discount}% OFF</div>`;
            oldPriceHTML = `<span class="price-old"><del>₹${cleanPrice}</del></span>`;
        }

        const starRating = product.rating >= 4
            ? '<div class="ratings">' + '<span><i class="ion-android-star"></i></span>'.repeat(5) + '</div>'
            : '<div class="ratings">' + '<span><i class="ion-android-star"></i></span>'.repeat(4) + '<span><i class="ion-android-star-outline"></i></span></div>';

        const html = `
        <div class="product-item mb-50">
            <div class="product-thumb position-relative">
                ${badge}
                <a href="product-details.html?id=${product.id}" class="product-link">
                    <img src="${product.images[0]}" alt="${product.title}">
                </a>
            </div>
            <div class="product-content">
                <h5 class="product-brand">${product.brand}</h5>
                <h5 class="product-name">
                    <a href="product-details.html?id=${product.id}">${product.title}</a>
                </h5>
                ${starRating}
                <div class="price-box">
                    <span class="price-regular">₹${finalPrice}</span>
                    ${oldPriceHTML}
                </div>
                <div class="product-action-link">
                    <a href="#" 
                        class="wishlist-btn" 
                        data-id="${product.id}" 
                        data-title="${product.title}" 
                        data-price="${finalPrice}" 
                        data-img="${product.images[0]}" 
                        data-bs-toggle="tooltip" 
                        title="Wishlist">
                        <i class="ion-android-favorite-outline"></i>
                    </a>

                    <a href="#" class="add-to-cart-btn"
                        data-id="${product.id}" 
                        data-title="${product.title}" 
                        data-price="${product.price}" 
                        data-img="${product.images[0]}">
                        <i class="ion-bag"></i>
                    </a>

                    <a href="product-details.html?id=${product.id}">
                        <span data-bs-toggle="tooltip" title="Quick View"><i class="ion-ios-eye-outline"></i></span>
                    </a>
                </div>
            </div>
        </div>`;

        container.insertAdjacentHTML("beforeend", html);
    });

    $('.product-carousel-4').slick({
        slidesToShow: 4,
        prevArrow: '<button type="button" class="slick-prev"><i class="fa fa-angle-left"></i></button>',
        nextArrow: '<button type="button" class="slick-next"><i class="fa fa-angle-right"></i></button>',
        responsive: [
            { breakpoint: 1200, settings: { slidesToShow: 3 } },
            { breakpoint: 992, settings: { slidesToShow: 2 } },
            { breakpoint: 576, settings: { slidesToShow: 1 } }
        ]
    });
}

// 🔹 2. Top Sellers Section
function renderTopSellers(products) {
    const topRated = products.filter(p => p.rating >= 4.1);
    const container = document.querySelector(".top-seller-carousel");
    if (!container) return;

    container.innerHTML = "";

    topRated.forEach(product => {
        const cleanPrice = parseFloat(product.price.replace(/[₹,]/g, ''));
        let finalPrice = cleanPrice;
        let badge = "";
        let oldPriceHTML = "";

        if (product.discounted && product.discount) {
            finalPrice = Math.round(cleanPrice * (1 - product.discount / 100));
            badge = `<div class="product-badge bg-danger text-white position-absolute top-0 start-0 m-2 p-1 px-2 rounded">${product.discount}% OFF</div>`;
            oldPriceHTML = `<span class="price-old"><del>₹${cleanPrice}</del></span>`;
        }

        const stars = Array.from({ length: 5 }, (_, i) =>
            `<span><i class="ion-android-star${i < Math.round(product.rating) ? '' : '-outline'}"></i></span>`
        ).join("");

        const html = `
        <div class="slide-item">
            <div class="pro-item-small mt-30">
                <div class="product-thumb position-relative">
                    ${badge}
                    <a href="product-details.html?id=${product.id}" class="product-link">
                        <img src="${product.images[0]}" alt="${product.title}">
                    </a>
                </div>
                <div class="pro-small-content">
                    <h6 class="product-name">
                         <a href="product-details.html?id=${product.id}" class="product-link">${product.title}</a>
                    </h6>
                    <div class="price-box">
                        <span class="price-regular">₹${finalPrice}</span>
                        ${oldPriceHTML}
                    </div>
                    <div class="ratings">${stars}</div>
                    <div class="product-link-2">
                        <a href="#" 
                        class="wishlist-btn" 
                        data-id="${product.id}" 
                        data-title="${product.title}" 
                        data-price="${finalPrice}" 
                        data-img="${product.images[0]}" 
                        data-bs-toggle="tooltip" 
                        title="Wishlist">
                        <i class="ion-android-favorite-outline"></i>
                        </a>

                        <a href="#" class="add-to-cart-btn"
                            data-id="${product.id}" 
                            data-title="${product.title}" 
                            data-price="${product.price}" 
                            data-img="${product.images[0]}">
                            <i class="ion-bag"></i>
                        </a>


                        <a href="product-details.html?id=${product.id}">
                            <span data-bs-toggle="tooltip" title="Quick View"><i class="ion-ios-eye-outline"></i></span>
                        </a>
                    </div>
                </div>
            </div>
        </div>`;

        container.insertAdjacentHTML("beforeend", html);
    });

    $('.top-seller-carousel').slick({
        arrows: false,
        slidesToShow: 3,
        responsive: [
            { breakpoint: 1200, settings: { slidesToShow: 2 } },
            { breakpoint: 768, settings: { slidesToShow: 1 } }
        ]
    });
}

// 🔹 3. Tooltips
function activateTooltips() {
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(el => new bootstrap.Tooltip(el));
}