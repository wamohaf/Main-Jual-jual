// ==========================================
// 1. DATA GAME (20 Item sahaja)
// ==========================================
const gameData = {
  categories: [
    { id: "toys", name: "🧸 Squishy Toys" },
    { id: "food", name: "🍔 Squishy Food" } 
  ],
  items: [
    // --- KATEGORI TOYS (Item 11 hingga 20) ---
    { id: 11, cat: "toys", name: "Self Love Loops", price: 2.00, image: "item11.png" },
    { id: 12, cat: "toys", name: "Neko Squishy", price: 3.00, image: "item12.png" },
    { id: 13, cat: "toys", name: "Honey Cake", price: 5.00, image: "item13.png" },
    { id: 14, cat: "toys", name: "Astor Choco", price: 4.00, image: "item14.png" },
    { id: 15, cat: "toys", name: "Options", price: 4.00, image: "item15.png" },
    { id: 16, cat: "toys", name: "Buldak", price: 5.00, image: "item16.png" },
    { id: 17, cat: "toys", name: "Strawberry Cake", price: 3.00, image: "item17.png" },
    { id: 18, cat: "toys", name: "Mystery White", price: 6.00, image: "item18.png" }, 
    { id: 19, cat: "toys", name: "Cheese Block", price: 2.00, image: "item19.png" }, 
    { id: 20, cat: "toys", name: "Ice Cube", price: 4.00, image: "item20.png" }, 
    
    // --- CONTOH KATEGORI FOOD (Bila nak tambah nanti) ---
    // { id: 21, cat: "food", name: "Burger Squishy", price: 5.00, image: "item21.png" },
  ]
};

// ==========================================
// 2. STATE GAME
// ==========================================
let state = {
  coins: 0,
  activeCategory: "toys",
  currentItem: null,
  progress: 0,
  isCrafting: false,
  timer: null
};

// ==========================================
// 3. FUNGSI-FUNGSI UTAMA
// ==========================================

function saveGame() {
  localStorage.setItem('squishyGameState', JSON.stringify({ coins: state.coins }));
}
function loadGame() {
  const saved = localStorage.getItem('squishyGameState');
  if (saved) {
    const parsed = JSON.parse(saved);
    state.coins = parsed.coins || 0;
  }
}

function updateHeader() {
  document.getElementById('coinDisplay').textContent = `RM ${state.coins.toFixed(2)}`;
  const totalStock = gameData.items.filter(i => i.cat === state.activeCategory).length;
  document.getElementById('stockDisplay').textContent = totalStock;
}

function renderCategories() {
  const container = document.getElementById('categoryTabs');
  container.innerHTML = gameData.categories.map(cat => `
    <button class="cat-btn ${state.activeCategory === cat.id ? 'active' : ''}" 
            onclick="changeCategory('${cat.id}')">
      ${cat.name}
    </button>
  `).join('');
}

function renderMenu() {
  const grid = document.getElementById('menuGrid');
  const items = gameData.items.filter(i => i.cat === state.activeCategory);
  
  if (items.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:gray;">Belum ada item.</p>`;
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="squishy-card" onclick="startCrafting(${item.id})">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
      <div class="item-name">${item.name}</div>
      <div class="item-price">RM ${item.price.toFixed(2)}</div>
    </div>
  `).join('');
}

window.changeCategory = function(catId) {
  state.activeCategory = catId;
  renderCategories();
  renderMenu();
  updateHeader();
};

window.startCrafting = function(itemId) {
  const item = gameData.items.find(i => i.id === itemId);
  if (!item) return;

  state.currentItem = item;
  state.progress = 0;
  state.isCrafting = true;

  document.getElementById('menuScreen').classList.remove('active');
  document.getElementById('craftScreen').classList.add('active');
  
  document.getElementById('craftImage').src = item.image;
  document.getElementById('craftName').textContent = item.name;
  document.getElementById('craftStatus').textContent = "Menguli...";
  document.getElementById('progressBar').style.width = "0%";

  const duration = 3000; 
  const interval = 50; 
  const step = (100 / (duration / interval));

  state.timer = setInterval(() => {
    state.progress += step;
    document.getElementById('progressBar').style.width = `${Math.min(state.progress, 100)}%`;

    if (state.progress > 30 && state.progress < 60) document.getElementById('craftStatus').textContent = "Membentuk...";
    if (state.progress >= 60 && state.progress < 90) document.getElementById('craftStatus').textContent = "Membungkus...";

    if (state.progress >= 100) {
      clearInterval(state.timer);
      finishCrafting();
    }
  }, interval);
};

function finishCrafting() {
  state.isCrafting = false;
  state.coins += state.currentItem.price;
  saveGame();
  updateHeader();

  document.getElementById('craftScreen').classList.remove('active');
  document.getElementById('successScreen').classList.add('active');
  document.getElementById('soldItemName').textContent = state.currentItem.name;
  document.getElementById('earnedCoins').textContent = `RM ${state.currentItem.price.toFixed(2)}`;
}

window.goToMenu = function() {
  document.getElementById('successScreen').classList.remove('active');
  document.getElementById('menuScreen').classList.add('active');
  state.currentItem = null;
};

// ==========================================
// 4. INITIALIZATION
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