document.addEventListener("DOMContentLoaded", function () {
    const WISHLIST_KEY = "wishlist";
    const wishlistNotification = document.querySelector(".ion-android-favorite-outline + .notification");
    const toaster = document.getElementById("toaster-message");

    window.getWishlist = function() { // Made global
        try {
            return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
        } catch (e) {
            console.error("Error parsing wishlist from localStorage:", e);
            return [];
        }
    }

    window.setWishlist = function(wishlistData) { // Made global
        try {
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistData));
            updateWishlistNotification();
        } catch (e) {
            console.error("Error saving wishlist to localStorage:", e);
        }
    }

    function updateWishlistNotification() {
        const currentWishlist = window.getWishlist();
        const totalItems = currentWishlist.length;
        if (wishlistNotification) {
            wishlistNotification.textContent = totalItems > 0 ? totalItems : "";
            wishlistNotification.style.display = totalItems > 0 ? "inline-block" : "none";
        }
    }

    window.showToaster = function(message, isError = false) { // Made global
        if (toaster) {
            toaster.textContent = message;
            toaster.style.backgroundColor = isError ? "#ff7777" : "#4CAF50";
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
        }
    }

    document.body.addEventListener("click", function (event) {
        const wishlistBtn = event.target.closest(".wishlist-btn");
        if (wishlistBtn) {
            event.preventDefault();

            let wishlist = window.getWishlist();
            const productId = wishlistBtn.dataset.id;
            const productTitle = wishlistBtn.dataset.title;
            const productImage = wishlistBtn.dataset.img;
            const productPrice = wishlistBtn.dataset.price;

            const alreadyExists = wishlist.find(item => item.id === productId);
            if (alreadyExists) {
                window.showToaster("This product is already in your wishlist.", true);
                return;
            }

            wishlist.push({
                id: productId,
                title: productTitle,
                img: productImage,
                price: productPrice
            });

            window.setWishlist(wishlist);
            window.showToaster(`${productTitle} added to your wishlist!`);
        }
    });

    updateWishlistNotification();
});