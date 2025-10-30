// js/script.js - GLOBAL FUNCTIONS AND HOME PAGE LOGIC

// --- Global Functions (Accessible throughout the application) ---

// Modal functions
function openModal() {
  const authModal = document.getElementById("authModal");
  if (authModal) {
    authModal.style.display = "block";
  }
}

function closeModal() {
  const authModal = document.getElementById("authModal");
  if (authModal) {
    authModal.style.display = "none";
  }
}

function logout() {
  localStorage.removeItem("username");
  location.reload();
}

// Function to update user info in the header (called once on DOMContentLoaded)
function updateUserInfo() {
  const userInfo = document.getElementById("userInfo");
  const userName = localStorage.getItem("username");

  if (!userInfo) return;

  if (userName) {
    userInfo.innerHTML = `
      <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" class="user-avatar" alt="User Avatar" />
      <div class="user-name">Hello, ${userName}</div>
      <ul class="user-menu">
        <li><a href="#">Dashboard</a></li>
        <li><a href="#">My Orders</a></li>
        <li><a href="#">Wishlist</a></li>
        <li><a href="#" onclick="logout()">Logout</a></li>
      </ul>
    `;
  } else {
    userInfo.innerHTML = `
      <img src="https://cdn-icons-png.flaticon.com/512/1077/1077063.png" class="user-avatar" alt="Sign In/Up Icon" />
      <div class="user-name">Sign In / Up</div>
    `;
    const userAvatar = userInfo.querySelector('.user-avatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', openModal);
    }
  }
}

// Function to show the popup message (GLOBAL - used by all pages)
function showPopup(message) {
  const popup = document.getElementById("popup");
  if (popup) {
    popup.textContent = message;
    popup.classList.add("show");
    setTimeout(() => {
      popup.classList.remove("show");
    }, 2000);
  }
}

// --- CART COUNT FUNCTIONS ---

// Function to get total items in cart
function getCartItemCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Sum the quantity of all items in the cart
    // Ensure item.quantity is treated as a number using unary plus (+)
    return cart.reduce((total, item) => total + (+item.quantity), 0);
}

// Function to update the cart icon display in the header
function updateCartIconCount() {
    // CRITICAL FIX: Use the correct ID for the cart counter span
    const cartItemCountSpan = document.getElementById('cartItemCount');
    if (cartItemCountSpan) {
        const count = getCartItemCount();
        // Display count only if > 0, wrap in parentheses
        cartItemCountSpan.textContent = count > 0 ? `(${count})` : '';
        // Optional: Add a class for styling if count > 0
        if (count > 0) {
            cartItemCountSpan.classList.add('has-items');
        } else {
            cartItemCountSpan.classList.remove('has-items');
        }
    }
}
// --- END CART COUNT FUNCTIONS ---


// Add to Cart Logic (GLOBAL - now handles size selection)
// The 'size' parameter should be passed from the calling context (e.g., event listener)
function addToCart(product, selectedSize = 'One Size') { // Default to 'One Size' if not provided
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Find if product with same ID AND size already exists
  // Ensure item.id and product.id are compared consistently (e.g., convert to string if mixed types)
  const existingProductIndex = cart.findIndex(item => String(item.id) === String(product.id) && item.size === selectedSize);

  if (existingProductIndex > -1) {
    // Ensure incremented quantity is a number
    cart[existingProductIndex].quantity = (+cart[existingProductIndex].quantity) + 1;
  } else {
    if (!product.id) {
        console.warn("Product added to cart without a predefined ID. Assigning a temporary one.");
        product.id = Date.now();
    }
    // Ensure initial quantity is a number and add the selected size
    cart.push({ ...product, quantity: 1, size: selectedSize });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  showPopup(`${product.name} (Size: ${selectedSize}) added to cart!`);
  updateCartIconCount(); // IMPORTANT: Update cart count after adding item
}

// GLOBAL HELPER: Function to render products into a given grid (used for dynamic loading)
// Added 'availableSizes' parameter
function renderProducts(productsArray, gridId) {
  const productGridElement = document.getElementById(gridId);
  if (productGridElement) {
    productGridElement.innerHTML = ''; // Clear previous content

    productsArray.forEach(product => {
      const card = document.createElement("div");
      card.classList.add("product-card");
      card.classList.add('invisible'); // Dynamically added products start as invisible

      let sizeOptionsHtml = '';
      // Check if product has specific sizes, otherwise default to common ones for clothing
      const sizes = product.availableSizes || ['S', 'M', 'L', 'XL']; // Default sizes for apparel

      // For non-apparel items like shoes or accessories, you might not want a size dropdown.
      // You can add a condition here based on product type if you categorize them.
      // For now, assuming all items rendered by this function might have sizes.
      // If a product has specific sizes, build the select.
      if (sizes && sizes.length > 0) {
          sizeOptionsHtml = `<div class="size-selection">
                                 <label for="size-${product.id}">Size:</label>
                                 <select id="size-${product.id}" class="product-size-select">
                                     ${sizes.map(s => `<option value="${s}" ${product.defaultSize === s ? 'selected' : ''}>${s}</option>`).join('')}
                                 </select>
                             </div>`;
      }


      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300?text=Image+Not+Found';" >
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          ${product.description ? `<p class="description">${product.description}</p>` : ''}
          ${product.rating ? `<div class="rating">${product.rating}</div>` : ''}
          <p class="price">${product.price}</p>
          ${sizeOptionsHtml} ${product.delivery ? `<p class="delivery">${product.delivery}</p>` : ''}
          <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
        </div>
      `;
      productGridElement.appendChild(card);
      globalObserver.observe(card); // Observe the newly created card for fade-in animation
    });

    // Attach event listeners for dynamically added "Add to Cart" buttons
    productGridElement.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = e.target.dataset.productId;
        // Find the product data from the original array
        const product = productsArray.find(p => String(p.id) === String(productId)); // Ensure ID comparison is robust

        const productCard = e.target.closest('.product-card'); // Get parent product card
        const sizeSelect = productCard ? productCard.querySelector('.product-size-select') : null;
        // Get selected size from the dropdown, default to 'One Size' if no dropdown or not selected
        const selectedSize = sizeSelect ? sizeSelect.value : 'One Size';

        if (product) {
            addToCart(product, selectedSize); // Pass both product data and selected size
        } else {
            console.error(`Product with ID ${productId} not found in data array.`);
        }
      });
    });
  }
}


// --- Product Data Arrays (Only for Home Page) ---
// Using local image paths for featured products on homepage
// Added 'availableSizes' and 'defaultSize' properties
const featuredProducts = [
    { id: 101, name: "Casual Denim Jacket", price: "₹4999", image: "image/denim3.jpg", description: "Stylish and versatile denim jacket.", rating: '<i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-half-fill"></i> (4.5)', delivery: "Free Delivery in 3-5 Days", availableSizes: ['S', 'M', 'L', 'XL'], defaultSize: 'M' },
    { id: 102, name: "Summer Linen Shirt", price: "₹1299", image: "image/p-t.jpg", description: "Lightweight and breathable shirt.", rating: '<i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-line"></i> (4.0)', delivery: "Standard Delivery in 5-7 Days", availableSizes: ['S', 'M', 'L'], defaultSize: 'L' },
    { id: 103, name: "Classic White Sneakers", price: "₹8999", image: "image/p-s.jpg", description: "Timeless design, comfortable for everyday.", rating: '<i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i> (5.0)', delivery: "Express Delivery in 2-3 Days", availableSizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'], defaultSize: 'UK 8' }, // Example for shoes
    { id: 104, name: "Slim Fit Chinos", price: "₹1199", image: "image/p-chinos.jpg", description: "Modern fit, great for semi-formal looks.", rating: '<i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-fill"></i><i class="ri-star-half-fill"></i><i class="ri-star-line"></i> (3.5)', delivery: "Free Delivery in 3-5 Days", availableSizes: ['28', '30', '32', '34', '36'], defaultSize: '32' }
];


// --- Global Intersection Observer for animations ---
let globalObserver;

// --- DOMContentLoaded Event Listener (Main execution block for global elements and home page) ---
document.addEventListener("DOMContentLoaded", () => {

  // Initialize User Info
  updateUserInfo();
  document.querySelector('#authModal .close')?.addEventListener('click', closeModal);

  // Initial cart counter update
  updateCartIconCount(); // Call this on page load for all pages

  // Hero Slider Logic (Only for index.html)
  const slides = document.querySelectorAll('.slide');
  const nextBtn = document.querySelector('.next');
  const prevBtn = document.querySelector('.prev');

  if (slides.length > 0 && nextBtn && prevBtn) {
    let currentSlide = 0;
    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) slide.classList.add('active');
      });
    }

    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    });

    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    });

    setInterval(() => {
      nextSlide();
    }, 5000); // change every 5 seconds

    showSlide(currentSlide); // Initial display
  }

  // Define the global Intersection Observer
  globalObserver = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observerInstance.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2 // Trigger when 20% of element is visible
  });

  // Apply animation to relevant sections (EXCLUDING .product-card from initial 'invisible' apply)
  document.querySelectorAll('.category-card, .products, .ck-footer, .page-header, .filters-sort').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top >= window.innerHeight || rect.bottom <= 0) { // If element is initially outside viewport
        el.classList.add('invisible');
    } else {
        // If element is initially inside the viewport, make it visible immediately
        el.classList.add('fade-in');
    }
    globalObserver.observe(el);
  });


  // Newsletter Subscription Form
  document.querySelector('.subscribe-form')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = this.querySelector('input').value;
    alert(`Thanks for subscribing, ${email}!`);
    this.reset();
  });

  // Handle search
  document.querySelector('.search-bar')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const query = this.querySelector('input').value.trim();
    if (query) {
      alert(`Searching for: ${query}`);
    }
  });


  // --- Product Loading Logic for Home Page ONLY ---
  renderProducts(featuredProducts, "productGrid");


  // --- Navigation Link Active State Logic ---
  const navLinks = document.querySelectorAll('.nav-links a');
  const currentPath = window.location.pathname;
  const currentFileName = currentPath.split('/').pop();

  navLinks.forEach(link => {
    link.classList.remove('active-nav');

    const linkHref = link.getAttribute('href');
    const linkFileName = linkHref.split('/').pop();

    if (linkFileName === '' && currentFileName === '') {
        link.classList.add('active-nav');
    } else if (linkFileName === 'index.html' && (currentFileName === 'index.html' || currentFileName === '')) {
        link.classList.add('active-nav');
    } else if (linkFileName === currentFileName) {
        link.classList.add('active-nav');
    }
  });

});