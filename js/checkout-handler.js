document.addEventListener("DOMContentLoaded", function () {
    const CART_KEY = "shoppingCart";
    const SHIPPING_FLAT_RATE = 100.00; // Define your flat rate shipping cost
  
    // Helper function to get cart from localStorage
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
        console.error("Missing elements for checkout summary. Ensure IDs/classes are correct.");
        return;
      }
  
      orderItemsContainer.innerHTML = ""; // Clear existing items
      let subtotal = 0;
  
      if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<div class="text-center py-3">Your cart is empty.</div>';
        subtotalElement.textContent = '₹0.00';
        totalElement.textContent = '₹0.00';
        return;
      }
  
      cart.forEach(item => {
        // **FIX for NaN:** Ensure item.price is a clean number string before parsing
        // Remove any currency symbols (like ₹) and commas before parsing
        const cleanPriceString = String(item.price).replace(/[₹,]/g, '');
        const itemPrice = parseFloat(cleanPriceString);
  
        // Check if itemPrice is a valid number after parsing
        if (isNaN(itemPrice)) {
            console.warn(`Invalid price for item: ${item.title}. Price value: ${item.price}. Skipping this item's calculation.`);
            return; // Skip this item if price is invalid
        }
  
        const itemSubtotal = itemPrice * item.qty;
        subtotal += itemSubtotal;
  
        // Using flexbox for each item row
        const itemDiv = `
          <div class="d-flex justify-content-between align-items-start py-2 border-bottom-dashed">
              <div class="col-9 pe-2 product-info">
                  <span class="product-name">${item.title}</span>
                  <span class="product-details">(Size: ${item.size}) × ${item.qty}</span>
              </div>
              <div class="col-3 text-end item-total-price">₹${itemSubtotal.toFixed(2)}</div>
          </div>
        `;
        orderItemsContainer.insertAdjacentHTML('beforeend', itemDiv);
      });
  
      subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
  
      // Function to calculate and update total based on shipping
      function updateOrderTotal() {
        let shippingCost = 0;
        let selectedShipping = document.querySelector('input[name="shipping"]:checked');
  
        if (selectedShipping && selectedShipping.value === "flat_rate") {
          shippingCost = SHIPPING_FLAT_RATE;
        } else if (selectedShipping && selectedShipping.value === "free_shipping") {
          shippingCost = 0; // Free shipping
        }
  
        const grandTotal = subtotal + shippingCost;
        totalElement.textContent = `₹${grandTotal.toFixed(2)}`;
      }
  
      // Initial total calculation
      updateOrderTotal();
  
      // Add event listeners to shipping radio buttons
      shippingRadios.forEach(radio => {
        radio.addEventListener('change', updateOrderTotal);
      });
    }
  
    // Render the order summary when the page loads
    renderOrderSummary();
  
    // Placeholder for "Place Order" button functionality
    const placeOrderBtn = document.querySelector('.order-button-box button[type="submit"]');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default form submission for now
  
        // Basic form validation (you'd expand this significantly)
        const firstName = document.getElementById('f_name').value;
        const email = document.getElementById('email').value;
        const streetAddress = document.getElementById('street_address').value;
        const town = document.getElementById('town').value;
        const state = document.getElementById('state').value;
        const postcode = document.getElementById('postcode').value;
        const phone = document.getElementById('phone').value;
  
  
        if (!firstName || !email || !streetAddress || !town || !state || !postcode || !phone) {
          alert('Please fill in all required billing details.');
          return;
        }
  
        const cart = getCart();
        if (cart.length === 0) {
          alert('Your cart is empty. Please add items before placing an order.');
          return;
        }
  
        // Simulate order placement
        alert('Order has been placed successfully! (Cart will now be cleared)');
        localStorage.removeItem(CART_KEY); // Clear cart
        // Update cart notification in header
        const notif = document.querySelector(".minicart-btn .notification");
        if (notif) notif.textContent = ""; // Clear notification
        
        // Optionally, redirect to a thank you page or home page
        window.location.href = 'index.html'; // Redirect to home after placing order
      });
    }
  
  });