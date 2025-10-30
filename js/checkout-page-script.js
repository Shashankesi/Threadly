// js/checkout-page-script.js - Logic for the Checkout Page

document.addEventListener("DOMContentLoaded", () => {
    // Check if cart is empty before proceeding to checkout
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert("Your cart is empty. Please add items before proceeding to checkout.");
        window.location.href = 'index.html'; // Redirect to homepage or cart page
        return; // Stop execution of checkout script
    }

    // --- DOM Elements ---
    const checkoutSteps = document.querySelectorAll('.checkout-step');
    const stepNavs = document.querySelectorAll('.step-indicator');
    const shippingForm = document.getElementById('shippingForm');
    const paymentForm = document.getElementById('paymentForm');
    const reviewStep = document.getElementById('reviewStep');
    const confirmationStep = document.getElementById('confirmationStep'); // Confirmation step div

    const paymentMethodSelect = document.getElementById('paymentMethod');
    const cardDetailsDiv = document.getElementById('cardDetails');
    const upiDetailsDiv = document.getElementById('upiDetails');

    const reviewCartItemsDiv = document.getElementById('reviewCartItems');
    const reviewShippingAddressP = document.getElementById('reviewShippingAddress');
    const reviewPaymentMethodP = document.getElementById('reviewPaymentMethod');
    const reviewSubtotalSpan = document.getElementById('reviewSubtotal');
    const reviewDiscountSpan = document.getElementById('reviewDiscount');
    const reviewTotalSpan = document.getElementById('reviewTotal');

    const couponCodeInput = document.getElementById('couponCode');
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    const couponMessageP = document.getElementById('couponMessage');
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    const confirmAddressP = document.getElementById('confirmAddress');
    const confirmTotalP = document.getElementById('confirmTotal');
    const orderNumberSpan = document.getElementById('orderNumber');
    const busIcon = document.querySelector('.bus-icon'); // Select bus icon
    const deliveryStatusText = document.querySelector('.delivery-status-text'); // Select delivery status text

    let currentStep = 0;
    let orderData = {}; // Object to store collected checkout data
    let currentCartSubtotal = 0; // Stored here for coupon calculation
    let currentDiscount = 0;

    // --- Helper Functions ---

    function showStep(stepIndex) {
        checkoutSteps.forEach((step, index) => {
            if (index === stepIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        stepNavs.forEach((nav, index) => {
            if (index <= stepIndex) {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });
        currentStep = stepIndex;
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on step change

        // Reset bus animation if coming back from confirmation step
        if (stepIndex !== 3 && busIcon) {
            busIcon.style.animation = 'none'; // Reset animation
            busIcon.offsetHeight; // Trigger reflow
            busIcon.style.animation = null; // Re-enable animation (if needed for next confirmation)
            deliveryStatusText.textContent = "Your order is on the way!"; // Reset text
        }
    }

    // Function to calculate cart subtotal
    function calculateCartSubtotal() {
        return cart.reduce((total, item) => total + (parseFloat(item.price.replace('₹', '').replace(/,/g, '')) * (+item.quantity)), 0);
    }

    // Function to format currency (Indian Rupees)
    function formatCurrency(amount) {
        return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // --- Step 1: Shipping Form Handling ---
    shippingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Collect shipping data
        orderData.shipping = {
            fullName: document.getElementById('fullName').value,
            address1: document.getElementById('address1').value,
            address2: document.getElementById('address2').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zip: document.getElementById('zip').value,
            country: document.getElementById('country').value,
            phone: document.getElementById('phone').value
        };
        showStep(1); // Go to Payment step
        if (typeof globalObserver !== 'undefined') { // Re-observe new step content
            globalObserver.observe(paymentForm);
        }
    });

    // --- Step 2: Payment Form Handling ---
    paymentMethodSelect.addEventListener('change', () => {
        cardDetailsDiv.style.display = 'none';
        upiDetailsDiv.style.display = 'none';
        if (paymentMethodSelect.value === 'card') {
            cardDetailsDiv.style.display = 'flex'; // Use flex for internal layout
        } else if (paymentMethodSelect.value === 'upi') {
            upiDetailsDiv.style.display = 'block';
        }
    });

    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Basic validation for selected payment method details
        const method = paymentMethodSelect.value;
        let isValidPayment = true;
        if (method === 'card') {
            const cardNumber = document.getElementById('cardNumber').value;
            const cardName = document.getElementById('cardName').value;
            const expiryDate = document.getElementById('expiryDate').value;
            const cvv = document.getElementById('cvv').value;
            // Simplified validation for demo purposes
            if (!cardNumber || !cardName || !expiryDate || !cvv || cardNumber.length < 16 || cvv.length < 3) {
                alert('Please enter valid card details (16-digit number, name, MM/YY, 3-digit CVV).');
                isValidPayment = false;
            }
            orderData.payment = { method: 'Credit/Debit Card', details: { cardNumber, cardName, expiryDate, cvv } };
        } else if (method === 'upi') {
            const upiId = document.getElementById('upiId').value;
            if (!upiId) {
                alert('Please enter your UPI ID.');
                isValidPayment = false;
            } else if (!upiId.includes('@')) { // Basic UPI format check
                alert('Please enter a valid UPI ID (e.g., example@bank).');
                isValidPayment = false;
            }
            orderData.payment = { method: 'UPI', details: { upiId } };
        } else if (method === 'cod') {
            orderData.payment = { method: 'Cash on Delivery', details: {} };
        } else {
            alert('Please select a payment method.');
            isValidPayment = false;
        }

        if (isValidPayment) {
            populateReviewStep(); // Populate review details before showing step 3
            showStep(2); // Go to Order Review step
            if (typeof globalObserver !== 'undefined') { // Re-observe new step content
                globalObserver.observe(reviewStep);
            }
        }
    });

    // --- Step 3: Order Review Handling ---

    // Populate data in review step
    function populateReviewStep() {
        reviewCartItemsDiv.innerHTML = '';
        currentCartSubtotal = calculateCartSubtotal();
        currentDiscount = 0; // Reset discount when repopulating review

        cart.forEach(item => {
            const itemPrice = parseFloat(item.price.replace('₹', '').replace(/,/g, ''));
            const itemQuantity = +item.quantity;
            const itemSubtotal = itemPrice * itemQuantity;

            const reviewItemDiv = document.createElement('div');
            reviewItemDiv.classList.add('review-item');
            reviewItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="review-item-info">
                    <h4>${item.name}</h4>
                    <p>Size: ${item.size || 'N/A'} | Qty: ${itemQuantity}</p>
                </div>
                <span class="review-item-price">${formatCurrency(itemSubtotal)}</span>
            `;
            reviewCartItemsDiv.appendChild(reviewItemDiv);
        });

        reviewShippingAddressP.innerHTML = `
            ${orderData.shipping.fullName}<br>
            ${orderData.shipping.address1}, ${orderData.shipping.address2 ? orderData.shipping.address2 + '<br>' : ''}
            ${orderData.shipping.city}, ${orderData.shipping.state} - ${orderData.shipping.zip}<br>
            ${orderData.shipping.country}<br>
            Phone: ${orderData.shipping.phone}
        `;

        reviewPaymentMethodP.textContent = orderData.payment.method;

        // Update totals initially
        updateReviewTotals();
        couponCodeInput.value = ''; // Clear coupon code
        couponMessageP.textContent = ''; // Clear coupon message
    }

    function updateReviewTotals() {
        let totalAfterDiscount = currentCartSubtotal - currentDiscount;
        if (totalAfterDiscount < 0) totalAfterDiscount = 0; // Ensure total doesn't go negative

        reviewSubtotalSpan.textContent = formatCurrency(currentCartSubtotal);
        reviewDiscountSpan.textContent = `-${formatCurrency(currentDiscount)}`;
        reviewTotalSpan.textContent = formatCurrency(totalAfterDiscount);
        orderData.finalTotal = totalAfterDiscount; // Store final total
        orderData.discountApplied = currentDiscount; // Store discount info
    }

    // Coupon Logic
    applyCouponBtn.addEventListener('click', () => {
        const couponCode = couponCodeInput.value.trim().toUpperCase(); // Convert to uppercase for comparison
        let message = '';
        let type = '';

        // Example Coupons (you can customize these)
        // Coupon rule: Value depends on subtotal range
        const coupons = {
            'SAVE100': { type: 'flat', value: 100, minAmount: 1000, message: '₹100 off applied!' },
            'SAVE10PERCENT': { type: 'percentage', value: 0.10, minAmount: 2000, message: '10% off applied!' },
            'FLAT500': { type: 'flat', value: 500, minAmount: 5000, message: '₹500 off applied!' }
        };

        const appliedCoupon = coupons[couponCode];

        if (appliedCoupon) {
            if (currentCartSubtotal >= appliedCoupon.minAmount) {
                let calculatedDiscount = 0;
                if (appliedCoupon.type === 'flat') {
                    calculatedDiscount = appliedCoupon.value;
                } else if (appliedCoupon.type === 'percentage') {
                    calculatedDiscount = currentCartSubtotal * appliedCoupon.value;
                }

                currentDiscount = calculatedDiscount;
                message = appliedCoupon.message;
                type = 'success';
            } else {
                currentDiscount = 0;
                message = `Cart subtotal must be at least ${formatCurrency(appliedCoupon.minAmount)} for this coupon.`;
                type = 'error';
            }
        } else {
            currentDiscount = 0;
            if (couponCode !== '') {
                message = 'Invalid coupon code.';
            } else {
                message = 'Please enter a coupon code.'; // Clear message if empty input on re-apply
            }
            type = 'error';
        }

        couponMessageP.textContent = message;
        couponMessageP.className = type; // Apply class for styling (success/error)
        updateReviewTotals(); // Recalculate totals after coupon attempt
    });

    // Place Order Button
    placeOrderBtn.addEventListener('click', () => {
        // Simulate order placement
        orderData.orderNumber = '#THRDLY' + Math.floor(Math.random() * 1000000); // Generate a random order number
        orderData.orderDate = new Date().toLocaleString();
        orderData.cartItems = cart; // Store current cart items

        // Clear the cart in localStorage after placing order
        localStorage.removeItem('cart');
        if (typeof updateCartIconCount === 'function') {
            updateCartIconCount(); // Update header cart count to 0
        }

        // Populate confirmation step
        orderNumberSpan.textContent = orderData.orderNumber;
        confirmAddressP.innerHTML = `
            ${orderData.shipping.fullName}<br>
            ${orderData.shipping.address1}, ${orderData.shipping.address2 ? orderData.shipping.address2 + '<br>' : ''}
            ${orderData.shipping.city}, ${orderData.shipping.state} - ${orderData.shipping.zip}<br>
            ${orderData.shipping.country}<br>
            Phone: ${orderData.shipping.phone}
        `;
        confirmTotalP.textContent = formatCurrency(orderData.finalTotal);

        showStep(3); // Go to Confirmation step
        if (typeof globalObserver !== 'undefined') { // Re-observe new step content
            globalObserver.observe(confirmationStep);
        }

        // Start bus animation after confirmation step is shown
        if (busIcon) {
            busIcon.style.animation = 'none'; // Reset any previous animation
            void busIcon.offsetWidth; // Trigger reflow to apply 'none' immediately
            busIcon.style.animation = 'driveBus 8s linear forwards'; // Start animation
            deliveryStatusText.textContent = "Your order is on the way!"; // Ensure text is visible
        }
    });

    // --- Back Buttons ---
    document.querySelectorAll('.prev-step-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 0) {
                showStep(currentStep - 1);
            }
        });
    });

    // --- Initial Load ---
    showStep(0); // Start at Shipping step
    // Observe checkout container for animation (if not already observed by global script)
    const checkoutContainer = document.querySelector('.checkout-container');
    if (checkoutContainer && typeof globalObserver !== 'undefined') {
        checkoutContainer.classList.add('invisible');
        globalObserver.observe(checkoutContainer);
    }
});