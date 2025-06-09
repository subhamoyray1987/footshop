document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return showError("No product selected.");

  fetch("js/shoelist.json")
    .then(res => res.json())
    .then(products => {
      const product = products.find(p => p.id == id);
      if (!product) return showError("Product not found.");

      renderProduct(product);
      renderRelatedProducts(product, products);
    })
    .catch(err => {
      console.error("Error loading product:", err);
      showError("Something went wrong while loading product.");
    });
});

function renderProduct(product) {
  // Render title and description
  document.querySelector(".pro-det-title").textContent = product.title;
  document.querySelector(".product-details-des p").textContent = product.description;

  // Parse price
  const cleanPrice = parseFloat(product.price.replace(/[₹,]/g, ""));
  let finalPrice = cleanPrice;
  if (product.discounted && product.discount) {
    finalPrice = Math.round(cleanPrice * (1 - product.discount / 100));
  }

  // Set price display
  document.querySelector(".regular-price").textContent = `₹${finalPrice.toFixed(2)}`;
  const oldPriceEl = document.querySelector(".old-price del");
  if (product.discounted && oldPriceEl) {
    oldPriceEl.textContent = `₹${cleanPrice.toFixed(2)}`;
  }

  // Render size options
  const sizeUl = document.querySelector(".shoe_size");
  if (sizeUl) {
    sizeUl.innerHTML = product.size
      .map(size => `<li class="size-option border px-3 py-1" data-size="${size}" style="cursor:pointer">${size}</li>`)
      .join("");

    // Add selection handling
    sizeUl.querySelectorAll(".size-option").forEach(li => {
      li.addEventListener("click", function () {
        sizeUl.querySelectorAll(".size-option").forEach(opt => opt.classList.remove("selected"));
        this.classList.add("selected");
        document.querySelector(".size-warning")?.classList.add("d-none");
      });
    });
  }

  // Setup quantity selector
  const qtyWrapper = document.querySelector(".pro-qty");
  if (qtyWrapper) {
    qtyWrapper.innerHTML = `
      <button class="dec btn btn-sm btn-outline-secondary">-</button>
      <input type="text" value="1" id="product-quantity" class="form-control mx-2 text-center" style="width: 50px;" readonly>
      <button class="inc btn btn-sm btn-outline-secondary">+</button>
    `;

    const qtyInput = document.getElementById("product-quantity");

    qtyWrapper.querySelector(".inc").addEventListener("click", () => {
      qtyInput.value = parseInt(qtyInput.value) + 1;
      updateDisplayedPrice(qtyInput.value, finalPrice, cleanPrice);
    });

    qtyWrapper.querySelector(".dec").addEventListener("click", () => {
      if (parseInt(qtyInput.value) > 1) {
        qtyInput.value = parseInt(qtyInput.value) - 1;
        updateDisplayedPrice(qtyInput.value, finalPrice, cleanPrice);
      }
    });
  }

  function updateDisplayedPrice(qty, current, original) {
    document.querySelector(".regular-price").textContent = `₹${(current * qty).toFixed(2)}`;
    const old = document.querySelector(".old-price del");
    if (old) old.textContent = `₹${(original * qty).toFixed(2)}`;
  }

  // Inject main product images
  const largeSlider = document.querySelector(".product-large-slider");
  const navSlider = document.querySelector(".pro-nav");

  if (largeSlider && navSlider && Array.isArray(product.images)) {
    largeSlider.innerHTML = product.images.map(img => `<div class="pro-large-img"><img src="${img}" alt=""></div>`).join("");
    navSlider.innerHTML = product.images.map(img => `<div class="pro-nav-thumb"><img src="${img}" alt=""></div>`).join("");

    requestAnimationFrame(() => {
      setTimeout(() => {
        $('.product-large-slider').slick({
          slidesToShow: 1,
          slidesToScroll: 1,
          fade: true,
          arrows: false,
          asNavFor: '.pro-nav'
        });

        $('.pro-nav').slick({
          slidesToShow: 4,
          slidesToScroll: 1,
          asNavFor: '.product-large-slider',
          focusOnSelect: true,
          arrows: false,
          responsive: [
            { breakpoint: 992, settings: { slidesToShow: 3 } },
            { breakpoint: 576, settings: { slidesToShow: 2 } }
          ]
        });
      }, 100);
    });
  }

  // Setup Add To Cart button
  const addToCartBtn = document.querySelector("#main-product-add-to-cart-btn");
  if (addToCartBtn) {
    addToCartBtn.classList.add("add-to-cart-btn"); // Important for add-to-cart-handler.js
    addToCartBtn.dataset.id = product.id;
    addToCartBtn.dataset.title = product.title;
    addToCartBtn.dataset.price = finalPrice.toFixed(2);
    addToCartBtn.dataset.img = product.images[0];
  }
}

function renderRelatedProducts(product, products) {
  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 7);

  const container = document.querySelector(".product-carousel-4");
  if (!container) return;

  // Clear previous related products if any
  container.innerHTML = "";

  related.forEach(p => {
    const stars = p.rating >= 4
      ? '<span><i class="ion-android-star"></i></span>'.repeat(5)
      : '<span><i class="ion-android-star"></i></span>'.repeat(4) + '<span><i class="ion-android-star-outline"></i></span>';

    // Parse and calculate pricing
    const cleanPrice = parseFloat(p.price.replace(/[₹,]/g, ""));
    let finalPrice = cleanPrice;
    let originalPrice = "";
    let badge = "";

    if (p.discounted && p.discount) {
      finalPrice = Math.round(cleanPrice * (1 - p.discount / 100));
      originalPrice = `₹${cleanPrice.toFixed(2)}`; // Format original price
      badge = `<div class="product-badge bg-danger text-white position-absolute top-0 start-0 m-2 p-1 px-2 rounded">${p.discount}% OFF</div>`;
    }

    const html = `
<div class="product-item mb-50 position-relative">
  ${badge}
  <div class="product-thumb">
    <a href="product-details.html?id=${p.id}" class="product-link">
      <img src="${p.images[0]}" alt="${p.title}">
    </a>
  </div>
  <div class="product-content">
    <h5 class="product-brand">${p.brand} // ${p.category}</h5>
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
         data-price="${finalPrice.toFixed(2)}" // Use toFixed for price in data attribute
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
`;


    container.insertAdjacentHTML("beforeend", html);
  });

  // Initialize slick carousel for related products
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


function showError(msg) {
  const container = document.querySelector(".product-details-inner");
  if (container) {
    container.innerHTML = `<div class="alert alert-danger text-center">${msg}</div>`;
  }
}
