// js/cart-page-script.js - Logic for the Shopping Cart Page

document.addEventListener("DOMContentLoaded", () => {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartSubtotalSpan = document.getElementById('cartSubtotal');
    const cartTotalSpan = document.getElementById('cartTotal');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const checkoutBtn = document.querySelector('.checkout-btn'); // Select the button

    // Function to render cart items from localStorage
    function renderCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItemsContainer.innerHTML = ''; // Clear previous items

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block'; // Show empty message
            checkoutBtn.disabled = true; // Disable checkout
            checkoutBtn.style.opacity = '0.5'; // Visually indicate disabled
            checkoutBtn.style.cursor = 'not-allowed'; // Change cursor
            cartSubtotalSpan.textContent = '₹0.00';
            cartTotalSpan.textContent = '₹0.00';
            // Update global cart count to 0 in case it was off
            if (typeof updateCartIconCount === 'function') {
                updateCartIconCount();
            }
            return;
        } else {
            emptyCartMessage.style.display = 'none'; // Hide empty message
            checkoutBtn.disabled = false; // Enable checkout
            checkoutBtn.style.opacity = '1'; // Reset opacity
            checkoutBtn.style.cursor = 'pointer'; // Reset cursor
        }

        let subtotal = 0;

        cart.forEach((item) => {
            const itemPrice = parseFloat(item.price.replace('₹', '').replace(/,/g, '')); // Ensure price is a number
            const itemQuantity = +item.quantity; // Ensure quantity is a number
            const itemSubtotal = itemPrice * itemQuantity;
            subtotal += itemSubtotal;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            // Data attributes for item identification
            cartItemDiv.dataset.id = item.id;
            cartItemDiv.dataset.size = item.size;

            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/100?text=No+Image'">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Size: ${item.size || 'N/A'}</p>
                    <p class="item-price">₹${itemPrice.toLocaleString('en-IN')}</p>
                </div>
                <div class="item-quantity-control">
                    <button class="quantity-minus" data-id="${item.id}" data-size="${item.size}">-</button>
                    <input type="number" class="item-quantity-input" value="${itemQuantity}" min="1" data-id="${item.id}" data-size="${item.size}">
                    <button class="quantity-plus" data-id="${item.id}" data-size="${item.size}">+</button>
                </div>
                <button class="item-remove-btn" data-id="${item.id}" data-size="${item.size}"><i class="ri-delete-bin-line"></i></button>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });

        // Update subtotals and totals
        cartSubtotalSpan.textContent = `₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        cartTotalSpan.textContent = `₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Attach event listeners for quantity and remove buttons
        attachCartItemListeners();

        // Always update the global cart icon count after rendering the cart
        if (typeof updateCartIconCount === 'function') {
            updateCartIconCount();
        }
    }

    // Function to attach/re-attach listeners after rendering
    function attachCartItemListeners() {
        // Quantity control buttons
        cartItemsContainer.querySelectorAll('.quantity-minus').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });
        cartItemsContainer.querySelectorAll('.quantity-plus').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });
        // Direct input change for quantity
        cartItemsContainer.querySelectorAll('.item-quantity-input').forEach(input => {
            input.addEventListener('change', handleQuantityChange);
        });
        // Remove item buttons
        cartItemsContainer.querySelectorAll('.item-remove-btn').forEach(button => {
            button.addEventListener('click', handleRemoveItem);
        });
    }

    // Handle quantity change (plus/minus buttons or direct input)
    function handleQuantityChange(event) {
        const targetElement = event.target;
        const productId = targetElement.dataset.id;
        const productSize = targetElement.dataset.size;
        const itemQuantityControl = targetElement.closest('.item-quantity-control');
        const inputElement = itemQuantityControl.querySelector('.item-quantity-input');
        let newQuantity = parseInt(inputElement.value);

        // Adjust quantity based on which button was clicked, or use input value directly
        if (targetElement.classList.contains('quantity-plus')) {
            newQuantity++;
        } else if (targetElement.classList.contains('quantity-minus')) {
            newQuantity--;
        }

        if (newQuantity < 1) { // If quantity drops to 0 or less, remove item
            // Trigger visual removal animation first
            const cartItemDiv = targetElement.closest('.cart-item');
            if (cartItemDiv) {
                cartItemDiv.classList.add('removing');
                cartItemDiv.addEventListener('transitionend', () => {
                    removeItemFromCart(productId, productSize); // Actual removal after animation
                }, { once: true });
            } else {
                removeItemFromCart(productId, productSize); // Fallback for immediate removal
            }
        } else {
            updateItemQuantityInCart(productId, productSize, newQuantity);
        }
    }

    // Handle item removal
    function handleRemoveItem(event) {
        const button = event.target.closest('.item-remove-btn');
        const productId = button.dataset.id;
        const productSize = button.dataset.size;

        const cartItemDiv = button.closest('.cart-item');
        if (cartItemDiv) {
            cartItemDiv.classList.add('removing'); // Add animation class
            // Listen for transition end to remove element from DOM after animation
            cartItemDiv.addEventListener('transitionend', () => {
                removeItemFromCart(productId, productSize); // Remove from cart after animation
            }, { once: true }); // Ensure listener runs only once
        } else {
             // Fallback for immediate removal if no animation or unexpected HTML structure
            removeItemFromCart(productId, productSize);
        }
    }

    // Update item quantity in localStorage
    function updateItemQuantityInCart(id, size, quantity) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        // Ensure comparison is robust (string vs string)
        const itemIndex = cart.findIndex(item => String(item.id) === String(id) && item.size === size);

        if (itemIndex > -1) {
            cart[itemIndex].quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart(); // Re-render cart to update display and totals
        }
    }

    // Remove item from localStorage
    function removeItemFromCart(id, size) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        // Filter out the item to be removed
        cart = cart.filter(item => !(String(item.id) === String(id) && item.size === size));
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart(); // Re-render cart to update display and totals
    }

    // Initial render of the cart when the page loads
    renderCart();

    // --- Event listener for "Proceed to Checkout" button ---
    checkoutBtn.addEventListener('click', () => {
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (currentCart.length === 0) {
            alert('Your cart is empty. Please add items before proceeding to checkout.'); // This is the only remaining alert for empty cart
        } else {
            // Corrected: Directly navigate to checkout.html without any alerts
            window.location.href = 'checkout.html';
        }
    });

    // Observe the cart section for initial fade-in animation (if it's not already observed by global script)
    const cartSection = document.querySelector('.cart-section');
    if (cartSection && typeof globalObserver !== 'undefined') { // Check if globalObserver exists
        cartSection.classList.add('invisible');
        globalObserver.observe(cartSection);
    }
});