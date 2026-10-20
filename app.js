// ==========================================
// GAME DATA
// ==========================================
const gameData = {
  categories: [
    { id: "toys", name: "🧸 Squishy" },
    { id: "food", name: "🍔 Food" } 
  ],
  items: [
    { id: 1, cat: "toys", name: "Rainbow Ice Cream", price: 3, image: "item1.png" },
    { id: 2, cat: "toys", name: "Green Bear Pillow", price: 4, image: "item2.png" },
    { id: 3, cat: "toys", name: "Red Star Pillow", price: 4, image: "item3.png" },
    { id: 4, cat: "toys", name: "Sharla Cookies", price: 3, image: "item4.png" },
    { id: 5, cat: "toys", name: "Drinha Orange", price: 4, image: "item5.png" },
    { id: 6, cat: "toys", name: "Story Blue", price: 3, image: "item6.png" },
    { id: 7, cat: "toys", name: "Nabati Wafer", price: 4, image: "item7.png" },
    { id: 8, cat: "toys", name: "Pamii Bear", price: 5, image: "item8.png" }, 
    { id: 9, cat: "toys", name: "Strawberry Butter", price: 5, image: "item9.png" }, 
    { id: 10, cat: "toys", name: "Pink iPad", price: 6, image: "item10.png" }, 
    { id: 11, cat: "toys", name: "Self Love Loops", price: 2, image: "item11.png" },
    { id: 12, cat: "toys", name: "Neko Squishy", price: 3, image: "item12.png" },
    { id: 13, cat: "toys", name: "Honey Cake", price: 5, image: "item13.png" },
    { id: 14, cat: "toys", name: "Astor Choco", price: 4, image: "item14.png" },
    { id: 15, cat: "toys", name: "Options", price: 4, image: "item15.png" },
    { id: 16, cat: "toys", name: "Buldak", price: 5, image: "item16.png" },
    { id: 17, cat: "toys", name: "Strawberry Cake", price: 3, image: "item17.png" },
    { id: 18, cat: "toys", name: "Mystery White", price: 6, image: "item18.png" }, 
    { id: 19, cat: "toys", name: "Cheese Block", price: 2, image: "item19.png" }, 
    { id: 20, cat: "toys", name: "Ice Cube", price: 4, image: "item20.png" }, 
  ]
};

let state = {
  coins: 0,
  activeCategory: "toys",
  cart: [],
  orders: [],
  isSellerMode: false
};

// ==========================================
// SIMPAN & MUAT DATA
// ==========================================
function saveGame() { 
  localStorage.setItem('mainJualJualData', JSON.stringify({ coins: state.coins, orders: state.orders })); 
}
function loadGame() {
  const saved = localStorage.getItem('mainJualJualData');
  if (saved) {
    const parsed = JSON.parse(saved);
    state.coins = parsed.coins || 0;
    state.orders = parsed.orders || [];
  }
}

// ==========================================
// UI FUNCTIONS
// ==========================================
function updateHeader() {
  document.getElementById('coinDisplay').textContent = `RM ${state.coins}`;
  const totalCartCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCount').textContent = totalCartCount;
  
  const totalSales = state.orders.filter(o => o.status === 'done').reduce((sum, o) => sum + o.total_price, 0);
  const tSalesEl = document.getElementById('totalSalesDisplay');
  if(tSalesEl) tSalesEl.textContent = `RM ${totalSales}`;
}

function renderCategories() {
  document.getElementById('categoryTabs').innerHTML = gameData.categories.map(cat => `
    <button class="cat-btn ${state.activeCategory === cat.id ? 'active' : ''}" onclick="changeCategory('${cat.id}')">${cat.name}</button>
  `).join('');
}
function renderMenu() {
  const items = gameData.items.filter(i => i.cat === state.activeCategory);
  document.getElementById('menuGrid').innerHTML = items.map(item => `
    <div class="squishy-card">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
      <div class="item-name">${item.name}</div>
      <div class="item-price">RM ${item.price}</div>
      <button class="add-btn" onclick="addToCart(${item.id})">+</button>
    </div>
  `).join('');
}
window.changeCategory = function(catId) { state.activeCategory = catId; renderCategories(); renderMenu(); };

// ==========================================
// CART LOGIC
// ==========================================
window.addToCart = function(itemId) {
  const item = gameData.items.find(i => i.id === itemId);
  const existing = state.cart.find(i => i.id === itemId);
  if (existing) existing.qty += 1;
  else state.cart.push({ ...item, qty: 1 });
  updateHeader();
};
window.openCart = function() {
  if (state.cart.length === 0) return alert("Cart is empty!");
  let totalPrice = 0;
  document.getElementById('cartList').innerHTML = state.cart.map(item => {
    totalPrice += (item.price * item.qty);
    return `<div class="cart-item"><div class="cart-item-info"><img src="${item.image}"><span>${item.name} (x${item.qty})</span></div><div class="cart-item-controls"><button onclick="changeQty(${item.id}, -1)">-</button><button onclick="changeQty(${item.id}, 1)">+</button></div></div>`;
  }).join('');
  document.getElementById('cartTotalPrice').textContent = `RM ${totalPrice}`;
  document.getElementById('cartDialog').showModal();
};
window.changeQty = function(id, change) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty += change;
  if (item.qty <= 0) state.cart = state.cart.filter(i => i.id !== id);
  if (state.cart.length === 0) closeCart(); else openCart();
  updateHeader();
};
window.closeCart = function() { document.getElementById('cartDialog').close(); };

// ==========================================
// PROSES BAYAR
// ==========================================
window.payAndProcess = function() {
  const buyerName = document.getElementById('buyerName').value.trim() || 'Anonymous';
  let totalPrice = 0;
  
  state.cart.forEach(item => { totalPrice += (item.price * item.qty); });

  const orderData = {
    id: Date.now(),
    buyer_name: buyerName,
    items: state.cart.map(i => ({ name: i.name, qty: i.qty, price: i.price, image: i.image })),
    total_price: totalPrice,
    status: 'pending'
  };

  state.orders.push(orderData);
  state.coins += totalPrice;
  saveGame();
  updateHeader();
  
  closeCart();
  
  // Sembunyikan menu, tunjuk skrin berjaya
  document.getElementById('menuScreen').style.display = 'none';
  document.getElementById('successScreen').style.display = 'block';
  document.getElementById('earnedCoins').textContent = `RM ${totalPrice}`;
  
  state.cart = [];
  updateHeader();
};

window.goToMenu = function() {
  document.getElementById('successScreen').style.display = 'none';
  document.getElementById('menuScreen').style.display = 'block';
  renderMenu();
};
window.resetCoins = function() {
  if (confirm("Reset your money to RM 0?")) { 
    state.coins = 0; 
    saveGame(); 
    updateHeader(); 
  }
};

// ==========================================
// TUKAR MODE (PEMBELI / PENJUAL)
// ==========================================
window.toggleMode = function() {
  state.isSellerMode = !state.isSellerMode;
  
  const buyerDiv = document.getElementById('buyerContainer');
  const sellerDiv = document.getElementById('sellerContainer');
  const toggleBtn = document.getElementById('modeToggleBtn');
  const cartBtn = document.getElementById('cartBtn');

  if (state.isSellerMode) {
    buyerDiv.style.display = 'none';
    sellerDiv.style.display = 'block';
    toggleBtn.innerHTML = '🛒 Seller';
    toggleBtn.style.background = '#FF85A2'; 
    toggleBtn.style.color = 'white';
    cartBtn.style.display = 'none'; // Sembunyikan butang troli di mode penjual
    fetchOrders(); 
  } else {
    sellerDiv.style.display = 'none';
    buyerDiv.style.display = 'block';
    toggleBtn.innerHTML = '👤 Buyer';
    toggleBtn.style.background = 'white';
    toggleBtn.style.color = 'black';
    cartBtn.style.display = 'block'; // Tunjuk butang troli di mode pembeli
    renderMenu(); 
  }
  updateHeader();
};

// ==========================================
// LOGIK PENJUAL
// ==========================================
window.fetchOrders = function() {
  const ordersList = document.getElementById('ordersList');
  
  const totalSales = state.orders
    .filter(order => order.status === 'done')
    .reduce((sum, order) => sum + order.total_price, 0);
  
  document.getElementById('totalSalesDisplay').textContent = `RM ${totalSales}`;

  if (state.orders.length === 0) {
    ordersList.innerHTML = '<p class="empty">No orders yet.</p>';
    return;
  }

  const sortedOrders = [...state.orders].reverse();

  ordersList.innerHTML = sortedOrders.map(order => {
    const isDone = order.status === 'done';
    const itemsHtml = order.items.map(i => {
      const imgSrc = i.image ? i.image : 'https://via.placeholder.com/45?text=?';
      return `
        <div class="order-item">
          <img src="${imgSrc}" alt="${i.name}">
          <div class="order-item-info">
            <div class="order-item-name">${i.name}</div>
            <div class="order-item-qty">Qty: ${i.qty} | Price: RM ${i.price}</div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="order-card ${isDone ? '' : 'new'}">
        <div class="buyer-name">👤 ${order.buyer_name}</div>
        <div class="order-items-container">
          ${itemsHtml}
        </div>
        <div class="total">Total: RM ${order.total_price}</div>
        <button class="status-btn ${isDone ? 'done' : ''}" onclick="markDone(${order.id})" ${isDone ? 'disabled' : ''}>
          ${isDone ? '✅ Completed' : 'Mark as Done'}
        </button>
      </div>
    `;
  }).join('');
};

window.markDone = function(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'done';
    saveGame();
    fetchOrders(); 
  }
};

window.resetAllOrders = function() {
  if (!confirm("Delete all orders and reset sales?")) return;
  state.orders = [];
  saveGame();
  fetchOrders();
};

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
  loadGame();
  renderCategories();
  renderMenu();
  updateHeader();
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  }
}
document.addEventListener('DOMContentLoaded', init);
