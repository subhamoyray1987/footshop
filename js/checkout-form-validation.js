document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".checkout-form");
    const placeOrderBtn = document.querySelector(".order-button-box button");

    if (!form || !placeOrderBtn) return;

    function isValidEmail(email) {
        return /^\S+@gmail\.com$/.test(email);
    }

    function isValidPhone(phone) {
        return /^\d{10}$/.test(phone);
    }

    function isValidCardNumber(number) {
        const cleaned = number.replace(/\s+/g, '');
        return /^\d{16}$/.test(cleaned);
    }

    function setError(input, message) {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        const feedback = input.nextElementSibling;
        if (feedback && feedback.classList.contains("invalid-feedback")) {
            feedback.textContent = message;
        }
    }

    function clearError(input) {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
        const feedback = input.nextElementSibling;
        if (feedback && feedback.classList.contains("invalid-feedback")) {
            feedback.textContent = "";
        }
    }

    window.validateCheckoutForm = function () {
        let hasError = false;

        const fields = {
            f_name: "First Name",
            l_name: "Last Name",
            street_address: "Street Address",
            town: "Town / City",
            state: "State",
            postcode: "Postcode / Zip",
            email: "Email",
            phone: "Phone",
            card_number: "Card Number",
            expiry_month: "Expiry Month",
            expiry_year: "Expiry Year",
            cvv: "CVV"
        };

        for (const id in fields) {
            const input = document.getElementById(id);
            if (!input) continue;

            const value = input.value.trim();

            if (!value) {
                setError(input, `${fields[id]} is required.`);
                hasError = true;
                continue;
            }

            if (id === "email" && !isValidEmail(value)) {
                setError(input, `Only @gmail.com emails are allowed.`);
                hasError = true;
                continue;
            }

            if (id === "phone" && !isValidPhone(value)) {
                setError(input, `Phone must be 10 digits with no spaces.`);
                hasError = true;
                continue;
            }

            if (id === "card_number" && !isValidCardNumber(value)) {
                setError(input, `Card number must be exactly 16 digits.`);
                hasError = true;
                continue;
            }

            if (id === "expiry_month") {
                const mm = parseInt(value, 10);
                if (isNaN(mm) || mm < 1 || mm > 12) {
                    setError(input, `Month must be between 01 and 12.`);
                    hasError = true;
                    continue;
                }
            }

            if (id === "expiry_year") {
                const yyyy = parseInt(value, 10);
                const currentYear = new Date().getFullYear();
                if (isNaN(yyyy) || yyyy < currentYear || yyyy > currentYear + 20) {
                    setError(input, `Year must be between ${currentYear} and ${currentYear + 20}.`);
                    hasError = true;
                    continue;
                }
            }

            if (id === "cvv" && !/^\d{3,4}$/.test(value)) {
                setError(input, `CVV must be 3 or 4 digits.`);
                hasError = true;
                continue;
            }

            clearError(input);
        }

        return !hasError;
    };
});
