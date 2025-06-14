// js/global-search.js
document.addEventListener("DOMContentLoaded", function () {
    const searchTrigger = document.querySelector(".search-trigger");
    const offcanvasSearchWrapper = document.querySelector(".offcanvas-search-wrapper");
    const offcanvasCloseBtn = document.querySelector(".offcanvas-btn-close");
    const globalSearchForm = document.getElementById("global-search-form");
    const globalSearchInput = document.getElementById("global-search-input");

    if (searchTrigger) {
        searchTrigger.addEventListener("click", function (e) {
            e.preventDefault();
            offcanvasSearchWrapper.classList.add("canvas-open");
        });
    }

    if (offcanvasCloseBtn) {
        offcanvasCloseBtn.addEventListener("click", function () {
            offcanvasSearchWrapper.classList.remove("canvas-open");
        });
    }

    if (globalSearchForm) {
        globalSearchForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const query = globalSearchInput.value.trim();
            if (!query) {
                alert("Please enter a search query.");
                return;
            }

            let redirectUrl = "shop.html?";
            let params = [];

            // Split by space or comma
            const expressions = query.split(/[\s,]+/);
            expressions.forEach(expr => {
                expr = expr.trim();
                if (!expr) return;

                // Handle key:value
                const parts = expr.split(":");
                if (parts.length === 2) {
                    const key = parts[0].toLowerCase();
                    const value = parts[1];

                    if (key === "category") params.push(`category=${encodeURIComponent(value)}`);
                    else if (key === "size") params.push(`size=${encodeURIComponent(value)}`);
                    else if (key === "price") {
                        const [min, max] = value.split("-");
                        if (min && max) {
                            params.push(`minPrice=${encodeURIComponent(min)}`);
                            params.push(`maxPrice=${encodeURIComponent(max)}`);
                        }
                    }
                    return;
                }

                // Smart detection:
                if (/^\d{3,5}-\d{3,5}$/.test(expr)) {
                    const [min, max] = expr.split("-");
                    params.push(`minPrice=${min}`);
                    params.push(`maxPrice=${max}`);
                } else if (/^\d{1,2}$/.test(expr)) {
                    params.push(`size=${expr}`);
                } else if (/^\d{3,5}$/.test(expr)) {
                    params.push(`minPrice=${expr}`);
                } else {
                    params.push(`category=${encodeURIComponent(expr)}`);
                }
            });

            redirectUrl += params.join("&");
            window.location.href = redirectUrl;
        });
    }
});
