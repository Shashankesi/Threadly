document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("productGrid");
  const popup = document.getElementById("popup");

  const products = [
    {
      brand: "Levi's",
      name: "Denim Trucker Jacket",
      description: "Classic fit, rugged denim for everyday wear.",
      rating: 4.5,
      price: "₹3499",
      delivery: "Get it by Tue, 30 July",
      image: "https://images.unsplash.com/photo-1602810317163-6b7c7f5e1c26"
    },
    {
      brand: "Zara",
      name: "White Cotton Shirt",
      description: "Slim fit shirt perfect for formal and casual outings.",
      rating: 4.2,
      price: "₹1599",
      delivery: "Delivery by Mon, 29 July",
      image: "https://images.unsplash.com/photo-1600180758890-5d9dcd2a0cf3"
    },
    {
      brand: "H&M",
      name: "Black Slim Fit Jeans",
      description: "Comfort stretch jeans with a perfect taper.",
      rating: 4.7,
      price: "₹2299",
      delivery: "Get it by Wed, 31 July",
      image: "https://images.unsplash.com/photo-1618354691445-b7e2ff429d5c"
    },
    {
      brand: "Nike",
      name: "Air Max Sneakers",
      description: "Breathable and cushioned sneakers for daily wear.",
      rating: 4.9,
      price: "₹7999",
      delivery: "Fast delivery by Sun, 28 July",
      image: "https://images.unsplash.com/photo-1593032465171-f4e4ff88c35e"
    }
  ];

  products.forEach((product) => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    const stars = "★".repeat(Math.floor(product.rating)) + (product.rating % 1 > 0.3 ? "½" : "");

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-info">
        <h3>${product.brand}</h3>
        <p class="product-title">${product.name}</p>
        <p class="description">${product.description}</p>
        <p class="rating">Rating: ${stars} (${product.rating})</p>
        <p class="price">${product.price}</p>
        <p class="delivery">${product.delivery}</p>
        <button class="add-to-cart">Add to Cart</button>
      </div>
    `;

    card.querySelector("button").addEventListener("click", () => {
      popup.textContent = `${product.name} added to cart!`;
      popup.classList.add("show");
      setTimeout(() => popup.classList.remove("show"), 2000);

      // Save to localStorage or your cart logic
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart.push(product);
      localStorage.setItem("cart", JSON.stringify(cart));
    });

    grid.appendChild(card);
  });
});
function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function logout() {
  alert("Logged out successfully!");
  // You can redirect to login.html or clear localStorage if needed
  // window.location.href = "login.html";
}
function toggleUserDropdown() {
  const dropdown = document.getElementById("userDropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function logout() {
  alert("Logged out!");
  // You can add logic to clear session or redirect
  window.location.href = "login.html";
}

// Optional: Hide dropdown when clicking outside
document.addEventListener("click", function (e) {
  const userSection = document.querySelector(".user-section");
  const dropdown = document.getElementById("userDropdown");

  if (!userSection.contains(e.target)) {
    dropdown.style.display = "none";
  }
});
