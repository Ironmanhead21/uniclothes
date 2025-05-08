
/* =========================
   CART MANAGEMENT FUNCTIONS
   ========================= */

// Load cart from localStorage or initialize as empty array if not found
let cart = JSON.parse(localStorage.getItem("cart")) || [];

/**
 * Save the current cart array to localStorage.
 * This ensures the cart persists even after page reloads.
 */
function saveCartToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/**
 * Add a product to the cart.
 * If the product (with the same name and size) already exists, increase its quantity.
 * Otherwise, add it as a new item.
 * Also updates the cart counter, panel, and shows an alert.
 */
function addToCart(productName, productPrice, productImage, productSize, productQuantity) {
  const existingProduct = cart.find(
    item => item.name === productName && item.size === productSize
  );
  if (existingProduct) {
    existingProduct.quantity += productQuantity;
  } else {
    const product = {
      name: productName,
      price: productPrice,
      image: productImage,
      size: productSize,
      quantity: productQuantity,
      selected: false
    };
    cart.push(product);
  }
  saveCartToLocalStorage();
  updateCartCounter();
  updateCartPanel();
  alert(`${productName} (${productSize}, Qty: ${productQuantity}) has been added to your cart.`);
}

/**
 * Update the cart counter badge (usually shown on the cart icon).
 * Shows the total quantity of all items in the cart.
 * Also adds a bounce animation for visual feedback.
 */
function updateCartCounter() {
  const cartCounter = document.querySelector(".cart-icon .badge, #cart-counter");
  if (!cartCounter) return;
  cartCounter.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  cartCounter.style.display = cart.length > 0 ? "block" : "none";
  // animation class for bounce effect
  cartCounter.classList.remove("bounce");
  void cartCounter.offsetWidth;
  cartCounter.classList.add("bounce");
}

/**
 * Toggle the selection state of a cart item (for checkout).
 * Used when the user checks/unchecks the checkbox beside a cart item.
 */
function toggleCartItemSelection(index) {
  cart[index].selected = !cart[index].selected;
  saveCartToLocalStorage();
  updateCartPanel();
}

/**
 * Update the cart panel UI.
 * - Shows all items in the cart.
 * - Updates subtotal and free shipping message based on selected items.
 * - Enables/disables the checkout button depending on selection.
 */
function updateCartPanel() {
  const cartPanel = document.getElementById("cart-panel");
  const emptyCart = document.getElementById("empty-cart");
  const filledCart = document.getElementById("filled-cart");
  const cartItemsContainer = document.getElementById("cart-items");
 
  const freeShippingMsg = document.getElementById("free-shipping-message");
  const subtotalEl = document.getElementById("cart-subtotal");

  // Toggle cart states (add or remove class based on cart content)
  if (cart.length === 0) {
    cartPanel.classList.remove("cart-has-items");
  } else {
    cartPanel.classList.add("cart-has-items");
  }

  // Render cart items in the panel
  cartItemsContainer.innerHTML = "";
  cart.forEach((item, index) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <div class="cart-item-select">
        <input type="checkbox" id="item-${index}" ${item.selected ? 'checked' : ''} 
               onchange="toggleCartItemSelection(${index})">
      </div>
      <div class="cart-item-details">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <p class="item-name">${item.name}</p>
          <p class="item-size">Size: ${item.size}</p>
          <div class="item-qty">
            <button onclick="updateItemQuantity(${index}, ${item.quantity-1})">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateItemQuantity(${index}, ${item.quantity+1})">+</button>
          </div>
        </div>
      </div>
      <div class="item-price">₱${(item.price * item.quantity).toFixed(2)}</div>
      <button class="btn-remove" onclick="removeCartItem(${index})">&times;</button>
    `;
    cartItemsContainer.appendChild(cartItem);
  });

  // Calculate subtotal for selected items only
  const selectedItems = cart.filter(item => item.selected);
  let subtotal = 0;
  if (selectedItems.length > 0) {
    subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  subtotalEl.textContent = `₱${subtotal.toFixed(2)}`;

  // Update free shipping message based on selected subtotal
  const freeShippingThreshold = 75;
  const amountNeeded = freeShippingThreshold - subtotal;
  if (selectedItems.length === 0) {
    freeShippingMsg.textContent = `You are $${freeShippingThreshold.toFixed(2)} away from FREE SHIPPING!`;
  } else if (amountNeeded > 0) {
    freeShippingMsg.textContent = `You are $${amountNeeded.toFixed(2)} away from FREE SHIPPING!`;
  } else {
    freeShippingMsg.textContent = "Congratulations! You've earned FREE SHIPPING!";
  }

  // Enable/disable checkout button based on selection
  const checkoutBtn = document.getElementById("cart-panel-checkout");
  if (checkoutBtn) {
    const anySelected = selectedItems.length > 0;
    checkoutBtn.disabled = !anySelected;
    checkoutBtn.style.opacity = anySelected ? "1" : "0.5";
    checkoutBtn.style.pointerEvents = anySelected ? "auto" : "none";
  }
}

/**
 * Update the quantity of a specific cart item.
 * Ensures the quantity doesn't go below 1.
 * Also updates the cart in localStorage and UI.
 */
function updateItemQuantity(index, newQuantity) {
  if (newQuantity < 1) newQuantity = 1;
  cart[index].quantity = parseInt(newQuantity);
  saveCartToLocalStorage();
  updateCartPanel();
  updateCartCounter();
}

/**
 * Remove an item from the cart by its index.
 * Updates localStorage and UI after removal.
 */
function removeCartItem(index) {
  cart.splice(index, 1);
  saveCartToLocalStorage();
  updateCartPanel();
  updateCartCounter();
}

/**
 * Toggle the visibility of the cart panel (open/close).
 * Usually triggered by clicking the cart icon.
 */
function toggleCartPanel() {
  const cartPanel = document.getElementById("cart-panel");
  if (cartPanel) {
    cartPanel.classList.toggle("open");
  }
}

/* =========================
   CHECKOUT FUNCTIONS
   ========================= */

/**
 * Unified checkout function for both cart panel and direct modal checkout.
 * @param {Array} items - Array of items to checkout.
 * Shows a thank you modal and removes checked out items from the cart.
 */
function checkoutItems(items) {
  if (!items || items.length === 0) {
    alert("Please select items you wish to checkout!");
    return;
  }
  // Show thank you modal with selected items
  showCheckoutThankYou(items);

  // Remove checked out items from cart if they exist there
  let changed = false;
  items.forEach(item => {
    // Find index in cart by name and size
    const idx = cart.findIndex(
      c => c.name === item.name && c.size === item.size
    );
    if (idx !== -1) {
      cart.splice(idx, 1);
      changed = true;
    }
  });
  if (changed) {
    saveCartToLocalStorage();
    updateCartPanel();
    updateCartCounter();
  }
}

/**
 * Handler for the cart panel checkout button.
 * Checks out only the selected items in the cart.
 */
function checkoutSelectedItems() {
  const selectedItems = cart.filter(item => item.selected);
  checkoutItems(selectedItems);
}

/**
 * Handler for direct checkout from the product modal.
 * Immediately checks out the given item.
 */
function directCheckoutItem(item) {
  checkoutItems([item]);
}

/* =========================
   INITIALIZATION ON PAGE LOAD
   ========================= */

// When the page loads, update the cart counter and panel.
// Also, set up the checkout button event listener.
document.addEventListener("DOMContentLoaded", function() {
  updateCartCounter();
  updateCartPanel();
  const checkoutBtn = document.getElementById("cart-panel-checkout");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", checkoutSelectedItems);
  }
});

/* =========================
   PRODUCT GRID & MODALS
   ========================= */

document.addEventListener('DOMContentLoaded', function () {
  // Load products from products.json and render them in the grid
  fetch('products.json')
    .then(res => res.json())
    .then(products => {
      renderProducts(products);
      bindProductCardEvents(products);
    });

  /**
   * Render all products as cards in the product grid.
   * Each card shows the product image, name, price, and a "View Details" button.
   */
  function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.dataset.id = product.id;
      card.innerHTML = `
        <div class="product-img-wrap">
          <img src="${product.image}" alt="${product.name}">
          <button class="quickview-btn">View Details</button>
        </div>
        <h3>${product.name}</h3>
        <div class="price">₱${product.price.toFixed(2)}</div>
      `;
      grid.appendChild(card);
    });
  }

  /**
   * Bind click events to product cards for opening modals,
   * and set up all modal-related logic (product details, size guide, thank you).
   */
  function bindProductCardEvents(products) {
    const grid = document.getElementById('product-grid');
    
    // Get modal elements once
    const modal = document.getElementById('pmodal-product');
    const modalBody = document.querySelector('#pmodal-product .pmodal-body'); // Updated selector
    const closeBtn = document.getElementById('pmodal-product-close-btn');
    const overlay = document.getElementById('pmodal-product-overlay');
    
    // Size Guide Modal
    const sizeGuideModal = document.getElementById('pmodal-size-guide');
    const sizeGuideOverlay = document.getElementById('pmodal-size-guide-overlay');
    const sizeGuideClose = document.getElementById('pmodal-size-guide-close-btn');
    
    // Thank You Modal
    const thankyouModal = document.getElementById('pmodal-thankyou');
    const thankyouOverlay = document.getElementById('pmodal-thankyou-overlay');
    const thankyouClose = document.getElementById('pmodal-thankyou-close-btn');
    const thankyouBody = document.getElementById('pmodal-thankyou-body');

    // When a product card's "View Details" button is clicked, open the product modal
    grid.addEventListener('click', function(e) {
      const btn = e.target.closest('.quickview-btn');
      const card = e.target.closest('.product-card');
      
      if (!btn || !card) return;
      
      const prodId = card.dataset.id;
      const product = products.find(p => String(p.id) === String(prodId));
      if (!product) return;
      
      // Update modal content with product details
      updateModalContent(product);
      
      // Show modal
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    // Close modal handlers (close button, overlay, or Escape key)
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', function(e) {
      if (e.key === "Escape") closeModal();
    });

    // Function to close the product modal
    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    /**
     * Update the product modal with the selected product's details.
     * Sets up size picker, quantity controls, add to cart, and checkout buttons.
     */
    function updateModalContent(product) {
      const sizes = ['S', 'M', 'L', 'XL'];
      
      // Clean product data
      const cleanName = product.name.trim();
      const cleanDesc = product.description ? product.description.trim() : "No description available";
      const cleanPrice = parseFloat(product.price).toFixed(2);
      const cleanImage = product.image.trim();
    
      modalBody.innerHTML = `
        <div class="modal-image">
          <img src="${cleanImage}" alt="${cleanName}" onerror="this.src='img/placeholder.jpg'">
        </div>
        <div class="modal-info">
          <h2 class="modal-title">${cleanName}</h2>
          <div class="modal-price">₱${cleanPrice}</div>
          <div class="modal-desc">${cleanDesc}</div>
          <div class="size-guide-row">
            <div class="size-picker" id="modal-size-picker">
              ${sizes.map(s => `<button type="button" class="size-btn" data-size="${s}">${s}</button>`).join('')}
            </div>
            <button class="size-guide-btn" id="size-guide-btn">Size Guide</button>
          </div>
          <div class="qty-row">
            <span class="qty-label">Quantity</span>
            <div class="qty-actions">
              <button class="qty-btn" id="modal-qty-minus">-</button>
              <input type="text" value="1" id="modal-qty-val" class="qty-val" readonly>
              <button class="qty-btn" id="modal-qty-plus">+</button>
            </div>
          </div>
          <div class="detail-actions-row">
            <button class="btn-addcart" id="modal-addcart-btn">Add to Cart</button>
            <button class="btn-checkout" id="modal-checkout-btn">Checkout</button>
          </div>
        </div>
      `;
    
      // Initialize modal functionality (size picker, quantity, add to cart, checkout, size guide)
      initModalFunctionality(product);
    }

    /**
     * Set up all interactive elements inside the product modal:
     * - Size picker buttons
     * - Quantity increment/decrement
     * - Add to Cart and Checkout buttons
     * - Size Guide button
     */
    function initModalFunctionality(product) {
      // Size picker logic
      let selectedSize = 'S';
      const sizeBtns = modalBody.querySelectorAll('.size-btn');
      sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          sizeBtns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedSize = btn.dataset.size;
        });
      });
      sizeBtns[0].classList.add('selected');

      // Quantity logic
      let qty = 1;
      const qtyVal = modalBody.querySelector('#modal-qty-val');
      modalBody.querySelector('#modal-qty-minus').addEventListener('click', () => {
        if (qty > 1) qty--;
        qtyVal.value = qty;
      });
      modalBody.querySelector('#modal-qty-plus').addEventListener('click', () => {
        qty++;
        qtyVal.value = qty;
      });

      // Add to cart button logic
      modalBody.querySelector('#modal-addcart-btn').addEventListener('click', () => {
        addToCart(product.name, product.price, product.image, selectedSize, qty);
        closeModal();
      });

      // Checkout button logic (direct checkout for this product)
      modalBody.querySelector('#modal-checkout-btn').addEventListener('click', () => {
        directCheckoutItem({
          name: product.name,
          price: product.price,
          image: product.image,
          size: selectedSize,
          quantity: qty
        });
        closeModal();
      });

      // Size guide button logic (open size guide modal)
      modalBody.querySelector('#size-guide-btn').addEventListener('click', () => {
        sizeGuideModal.classList.add('active');
      });
    }

    /* ================
       SIZE GUIDE MODAL
       ================ */

    // Functions to open/close the size guide modal
    function openSizeGuideModal() { sizeGuideModal.classList.add('active'); }
    function closeSizeGuideModal() { sizeGuideModal.classList.remove('active'); }
    sizeGuideOverlay.addEventListener('click', closeSizeGuideModal);
    sizeGuideClose.addEventListener('click', closeSizeGuideModal);
    document.addEventListener('keydown', e => { 
      if(e.key === "Escape") closeSizeGuideModal(); 
    });

    /* ===================
       THANK YOU MODAL
       =================== */

    /**
     * Show the thank you modal after checkout.
     * Displays the list of purchased items and the total amount.
     * This function is attached to the window so it can be called globally.
     */
    window.showCheckoutThankYou = function(items) {
      let total = items.reduce((t, item) => t + item.price * item.quantity, 0);
      let list = items.map(item =>
        `<li>${item.name} (${item.size}) ×${item.quantity} - ₱${(item.price * item.quantity).toFixed(2)}</li>`
      ).join('');
      thankyouBody.innerHTML = `
        <div class="thankyou-title">Thank you for your purchase!</div>
        <ul class="thankyou-list">${list}</ul>
        <div class="thankyou-total">Total: ₱${total.toFixed(2)}</div>
      `;
      thankyouModal.classList.add('active');
    }
    
    // Functions to close the thank you modal
    function closeThankyouModal() { 
      thankyouModal.classList.remove('active'); 
    }
    thankyouOverlay.addEventListener('click', closeThankyouModal);
    thankyouClose.addEventListener('click', closeThankyouModal);
    document.addEventListener('keydown', e => { 
      if(e.key === "Escape") closeThankyouModal(); 
    });
  }
});

