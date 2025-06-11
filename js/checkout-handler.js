// checkout-handler.js

// Handles rendering cart, placing order, and saving last order for invoice.

document.addEventListener("DOMContentLoaded", function () {
  const CART_KEY = "shoppingCart";
  const SHIPPING_FLAT_RATE = 100.00;

  function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  }

  function renderOrderSummary() {
    const cart = getCart();
    const orderItemsContainer = document.getElementById("checkout-order-items");
    const subtotalElement = document.querySelector(".order-summary-wrap .subtotal-amount");
    const totalElement = document.querySelector(".order-summary-wrap .total-amount");
    const shippingRadios = document.querySelectorAll('input[name="shipping"]');

    if (!orderItemsContainer || !subtotalElement || !totalElement || shippingRadios.length === 0) {
      console.error("Missing checkout summary elements.");
      return;
    }

    orderItemsContainer.innerHTML = "";
    let subtotal = 0;

    if (cart.length === 0) {
      orderItemsContainer.innerHTML = '<div class="text-center py-3">Your cart is empty.</div>';
      subtotalElement.textContent = '₹0.00';
      totalElement.textContent = '₹0.00';
      return;
    }

    cart.forEach(item => {
      const cleanPrice = String(item.price).replace(/[₹,]/g, '');
      const itemPrice = parseFloat(cleanPrice);

      if (isNaN(itemPrice)) {
        console.warn(`Invalid price for item: ${item.title}`);
        return;
      }

      const itemSubtotal = itemPrice * item.qty;
      subtotal += itemSubtotal;

      const itemHTML = `
        <div class="d-flex justify-content-between align-items-start py-2 border-bottom-dashed">
          <div class="col-9 pe-2">
            <span class="product-name">${item.title}</span>
            <span class="product-details">(Size: ${item.size}) × ${item.qty}</span>
          </div>
          <div class="col-3 text-end">₹${itemSubtotal.toFixed(2)}</div>
        </div>
      `;
      orderItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
    });

    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;

    function updateTotal() {
      let shipping = 0;
      const selected = document.querySelector('input[name="shipping"]:checked');
      if (selected?.value === "flat_rate") shipping = SHIPPING_FLAT_RATE;
      const grandTotal = subtotal + shipping;
      totalElement.textContent = `₹${grandTotal.toFixed(2)}`;
    }

    updateTotal();
    shippingRadios.forEach(r => r.addEventListener("change", updateTotal));
  }

  renderOrderSummary();

  const placeOrderBtn = document.querySelector('.order-button-box button[type="submit"]');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', function (e) {
      e.preventDefault();

      const isValid = typeof window.validateCheckoutForm === 'function' && window.validateCheckoutForm();
      if (!isValid) return;

      const cart = getCart();
      if (cart.length === 0) {
        alert('Your cart is empty. Please add items before placing an order.');
        return;
      }

      const order = {
        id: Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString(),
        items: cart,
        total: document.querySelector(".total-amount")?.textContent || "₹0.00",
        customer: {
          f_name: document.getElementById("f_name")?.value || "",
          l_name: document.getElementById("l_name")?.value || "",
          phone: document.getElementById("phone")?.value || "",
          email: document.getElementById("email")?.value || "",
          address: document.getElementById("street_address")?.value || "",
          town: document.getElementById("town")?.value || "",
          state: document.getElementById("state")?.value || "",
          postcode: document.getElementById("postcode")?.value || ""
        }
      };

      localStorage.setItem("lastOrder", JSON.stringify(order));
      localStorage.removeItem(CART_KEY);

      const notif = document.querySelector(".minicart-btn .notification");
      if (notif) notif.textContent = "";

      window.location.href = 'thank-you.html';
    });
  }
});
