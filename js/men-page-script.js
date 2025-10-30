// js/men-page-script.js - Specific logic for the Men's collection page

document.addEventListener("DOMContentLoaded", () => {
    // Select all "Add to Cart" buttons on this specific page
    const addToCartButtons = document.querySelectorAll('#menProductGrid .add-to-cart-btn');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Get product data from the data attributes
            const productId = e.target.dataset.productId;
            const productName = e.target.dataset.productName;
            const productPrice = parseFloat(e.target.dataset.productPrice); // Convert price to number
            const productImage = e.target.dataset.productImage;

            // Call the global addToCart function from script.js
            // Ensure addToCart and showPopup are defined in script.js and loaded before this file
            if (typeof addToCart === 'function') {
                addToCart({
                    id: productId,
                    name: productName,
                    // Format price back to string with currency symbol for consistency in cart display
                    price: `₹${productPrice.toLocaleString('en-IN')}`,
                    image: productImage
                });
            } else {
                console.error("addToCart function not found in global scope.");
            }
        });
    });

    // Optional: If you add filters/sorting, their logic would go here
    // e.g., document.querySelector('.filters-sort select').addEventListener('change', filterProducts);
});