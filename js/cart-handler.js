document.addEventListener("DOMContentLoaded", function () {
  const CART_KEY = "shoppingCart";
  const SHIPPING_FLAT_RATE = 100.00; // Define your flat rate shipping cost

  const cartItemsBody = document.getElementById("cart-items-body");
  const subtotalElement = document.querySelector(".cart-calculator-wrapper .subtotal-amount");
  const totalElement = document.querySelector(".cart-calculator-wrapper .total-amount");
  const shippingRadios = document.querySelectorAll('input[name="shipping_method"]');
  const clearCartBtn = document.getElementById("clear-cart-btn");
  const cartEmptyRow = document.querySelector(".cart-empty-row");

  // Helper to get cart from localStorage
  function getCart() {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  }

  // Helper to save cart to localStorage
  function setCart(cart) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      updateCartNotification(); // Update header cart notification
  }

  // Function to render cart items
  function renderCartItems() {
      const cart = getCart();
      cartItemsBody.innerHTML = ""; // Clear existing rows

      if (cart.length === 0) {
          cartEmptyRow.classList.remove("d-none"); // Show "cart is empty" message
          clearCartBtn.classList.add("d-none"); // Hide clear cart button
      } else {
          cartEmptyRow.classList.add("d-none"); // Hide "cart is empty" message
          clearCartBtn.classList.remove("d-none"); // Show clear cart button
          cart.forEach(item => {
              const itemPrice = parseFloat(String(item.price).replace(/[₹,]/g, '')); // Clean price string
              if (isNaN(itemPrice)) {
                  console.warn(`Skipping item ${item.title} due to invalid price: ${item.price}`);
                  return; // Skip rendering this item if price is invalid
              }

              const row = document.createElement("tr");
              row.setAttribute("data-product-id", item.id);
              row.setAttribute("data-product-size", item.size); // Store size for unique identification

              row.innerHTML = `
                  <td class="pro-thumbnail">
                      <a href="product-details.html?id=${item.id}">
                          <img src="${item.img}" alt="${item.title}" style="max-width: 80px;">
                      </a>
                  </td>
                  <td class="pro-title">
                      <a href="product-details.html?id=${item.id}">${item.title}</a>
                      ${item.size ? `<p>Size: ${item.size}</p>` : ''}
                  </td>
                  <td class="pro-price"><span>₹${itemPrice.toFixed(2)}</span></td>
                  <td class="pro-quantity">
                      <div class="quantity-container">
                          <div class="pro-qty-2 quantity-box">
                              <span class="qtybtn quantity-minus" data-action="minus">-</span>
                              <input type="text" value="${item.qty}" data-id="${item.id}" data-size="${item.size}" readonly>
                              <span class="qtybtn quantity-plus" data-action="plus">+</span>
                          </div>
                      </div>
                  </td>
                  <td class="pro-subtotal"><span>₹${(itemPrice * item.qty).toFixed(2)}</span></td>

                  <td class="pro-remove">
                      <a href="#" class="remove-item-btn" data-id="${item.id}" data-size="${item.size}">
                          <i class="fa fa-trash"></i>
                      </a>
                  </td>
              `;
              cartItemsBody.appendChild(row);
          });
      }
      calculateCartTotals();
  }

  // Function to calculate and display cart totals
  function calculateCartTotals() {
      const cart = getCart();
      let subtotal = 0;

      cart.forEach(item => {
          const itemPrice = parseFloat(String(item.price).replace(/[₹,]/g, ''));
          if (!isNaN(itemPrice)) {
              subtotal += itemPrice * item.qty;
          }
      });

      subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;

      let shippingCost = 0;
      const selectedShipping = document.querySelector('input[name="shipping_method"]:checked');
      if (selectedShipping && selectedShipping.value === "flat_rate") {
          shippingCost = SHIPPING_FLAT_RATE;
      }

      const grandTotal = subtotal + shippingCost;
      totalElement.textContent = `₹${grandTotal.toFixed(2)}`;
  }

  // Event listener for quantity changes
  cartItemsBody.addEventListener("click", function (event) {
      const target = event.target;
      let cart = getCart();

      // Handle quantity plus/minus
      if (target.classList.contains("qtybtn")) {
          const inputField = target.closest(".quantity-box").querySelector("input");
          const productId = inputField.dataset.id;
          const productSize = inputField.dataset.size;
          const action = target.dataset.action;

          const itemIndex = cart.findIndex(
              item => String(item.id) === String(productId) && String(item.size) === String(productSize)
          );

          if (itemIndex > -1) {
              if (action === "plus") {
                  cart[itemIndex].qty++;
              } else if (action === "minus" && cart[itemIndex].qty > 1) {
                  cart[itemIndex].qty--;
              }
              setCart(cart);
              renderCartItems(); // Re-render to update quantities and totals
          }
      }

      // Handle item removal
      if (target.closest(".remove-item-btn")) {
          event.preventDefault(); // Prevent default link behavior
          const removeBtn = target.closest(".remove-item-btn");
          const productId = removeBtn.dataset.id;
          const productSize = removeBtn.dataset.size;

          cart = cart.filter(
              item => !(String(item.id) === String(productId) && String(item.size) === String(productSize))
          );
          setCart(cart);
          renderCartItems(); // Re-render to show updated cart
      }
  });

  // Event listener for shipping method change
  shippingRadios.forEach(radio => {
      radio.addEventListener("change", calculateCartTotals);
  });

  // Event listener for clearing the entire cart
  if (clearCartBtn) {
      clearCartBtn.addEventListener("click", function () {
          if (confirm("Are you sure you want to clear your entire cart?")) {
              setCart([]); // Set cart to empty array
              renderCartItems(); // Re-render to show empty cart
              alert("Your cart has been cleared.");
          }
      });
  }

  // Initial render when the page loads
  renderCartItems();

  // The add-to-cart-handler.js script is responsible for updating the header notification.
  // Ensure it's correctly linked in cart.html and other pages where items are added.
  // Call updateCartNotification() from add-to-cart-handler.js on page load as well.
});