const API = 'http://localhost:3000/api';
let menuData = {}, cart = {}, curCat = 'ALL', vegFilter = 'all', srchTerm = '';

const VEG_CATS = ['Veg Starters','Veg Main Course','Veg Biryanis','Veg Tandoori','Fried Rice','Noodles','Soups','Indian Breads','Mocktails','Milk Shakes','Ice Creams','Beverages'];

document.addEventListener('DOMContentLoaded', () => {
  loadMenu();
  const d = document.getElementById('rDate');
  if (d) d.min = new Date().toISOString().split('T')[0];
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (nav) nav.style.boxShadow = window.scrollY > 10 ? '0 4px 24px rgba(0,0,0,0.5)' : 'none';
  });
});

async function loadMenu() {
  try {
    const r = await fetch(`${API}/menu`);
    const j = await r.json();
    menuData = j.data;
    buildTabs();
    renderMenu();
  } catch(e) {
    const g = document.getElementById('menuGrid');
    if (g) g.innerHTML = '<div class="no-r" style="padding:3rem;text-align:center;color:#8a5020">⚠️ Could not load menu. Make sure the server is running on port 3000.</div>';
  }
}

function buildTabs() {
  const tabs = document.getElementById('catTabs');
  if (!tabs) return;
  tabs.innerHTML = '';

  // ALL tab
  const allBtn = document.createElement('button');
  allBtn.className = 'ctab on';
  allBtn.textContent = 'All Categories';
  allBtn.addEventListener('click', () => {
    document.querySelectorAll('.ctab').forEach(t => t.classList.remove('on'));
    allBtn.classList.add('on');
    curCat = 'ALL';
    srchTerm = '';
    const inp = document.getElementById('srchInput');
    if (inp) inp.value = '';
    renderMenu();
  });
  tabs.appendChild(allBtn);

  Object.keys(menuData).forEach(cat => {
    const b = document.createElement('button');
    b.className = 'ctab';
    b.textContent = cat;
    b.addEventListener('click', () => {
      document.querySelectorAll('.ctab').forEach(t => t.classList.remove('on'));
      b.classList.add('on');
      curCat = cat;
      srchTerm = '';
      const inp = document.getElementById('srchInput');
      if (inp) inp.value = '';
      renderMenu();
      // scroll to menu section
      setTimeout(() => {
        const sec = document.getElementById('menu');
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    });
    tabs.appendChild(b);
  });
}

function renderMenu() {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;

  // Search mode — flat list across all categories
  if (srchTerm.length > 1) {
    let results = [];
    Object.entries(menuData).forEach(([cat, arr]) => {
      arr.forEach(it => {
        if (it.name.toLowerCase().includes(srchTerm)) results.push({...it, _cat: cat});
      });
    });
    if (vegFilter === 'veg') results = results.filter(i => i.veg);
    if (vegFilter === 'nonveg') results = results.filter(i => !i.veg);
    if (!results.length) {
      grid.innerHTML = '<div class="no-r" style="padding:3rem;text-align:center;color:#8a5020;grid-column:1/-1">No dishes found matching "' + srchTerm + '"</div>';
      return;
    }
    grid.innerHTML = '<div class="mgrid">' + results.map(it => cardHTML(it)).join('') + '</div>';
    return;
  }

  // Single category
  if (curCat !== 'ALL') {
    let items = (menuData[curCat] || []).map(it => ({...it, _cat: curCat}));
    if (vegFilter === 'veg') items = items.filter(i => i.veg);
    if (vegFilter === 'nonveg') items = items.filter(i => !i.veg);
    if (!items.length) {
      grid.innerHTML = '<div class="no-r" style="padding:3rem;text-align:center;color:#8a5020">No ' + vegFilter + ' dishes in this category.</div>';
      return;
    }
    const isVegCat = VEG_CATS.includes(curCat);
    grid.innerHTML = `
      <div class="cat-header">
        <div class="cat-header-title ${isVegCat ? 'veg-hd' : ''}">${curCat}</div>
        <div class="cat-header-line"></div>
        <span class="menu-count">${items.length} items</span>
      </div>
      <div class="mgrid">${items.map(it => cardHTML(it)).join('')}</div>`;
    return;
  }

  // ALL categories — show each as a section
  let html = '';
  let totalShown = 0;
  Object.entries(menuData).forEach(([cat, arr]) => {
    let items = arr.map(it => ({...it, _cat: cat}));
    if (vegFilter === 'veg') items = items.filter(i => i.veg);
    if (vegFilter === 'nonveg') items = items.filter(i => !i.veg);
    if (!items.length) return;
    totalShown += items.length;
    const isVegCat = VEG_CATS.includes(cat);
    html += `
      <div class="cat-header">
        <div class="cat-header-title ${isVegCat ? 'veg-hd' : ''}">${cat}</div>
        <div class="cat-header-line"></div>
        <span class="menu-count">${items.length} items</span>
      </div>
      <div class="mgrid">${items.map(it => cardHTML(it)).join('')}</div>`;
  });

  if (!totalShown) {
    grid.innerHTML = '<div class="no-r" style="padding:3rem;text-align:center;color:#8a5020">No dishes found for this filter.</div>';
  } else {
    grid.innerHTML = html;
  }
}

function cardHTML(it) {
  return `<div class="mcard">
    <div class="mcard-img">
      <span>${emoji(it)}</span>
      <div class="vd ${it.veg ? 'v' : 'nv'}"></div>
    </div>
    <div class="mcard-bd">
      <div class="mcard-name">${it.name}</div>
      <div class="mcard-ft">
        <span class="mprice">₹${it.price}</span>
        <button class="atc" id="atc-${it.id}" onclick="addCart('${it.id}','${esc(it.name)}',${it.price},${it.veg})">+</button>
      </div>
    </div>
  </div>`;
}

function esc(s) { return s.replace(/'/g, "\\'"); }

function emoji(it) {
  const n = it.name.toLowerCase();
  if (n.includes('prawn') || n.includes('shrimp')) return '🦐';
  if (n.includes('fish') || n.includes('korameenu') || n.includes('vanjaram') || n.includes('chanduva')) return '🐟';
  if (n.includes('mutton')) return '🍖';
  if (n.includes('egg')) return '🥚';
  if (n.includes('paneer')) return '🧀';
  if (n.includes('mushroom')) return '🍄';
  if (n.includes('noodle') || n.includes('choupsy')) return '🍜';
  if (n.includes('soup')) return '🥣';
  if (n.includes('mandi')) return '🫕';
  if (n.includes('biryani') || n.includes('rice')) return '🍚';
  if (n.includes('naan') || n.includes('roti') || n.includes('kulcha') || n.includes('pulka')) return '🫓';
  if (n.includes('mojito') || n.includes('lagoon') || n.includes('lemonade')) return '🥤';
  if (n.includes('shake') || n.includes('lassi') || n.includes('milk')) return '🥛';
  if (n.includes('ice cream')) return '🍦';
  if (n.includes('water') || n.includes('soda') || n.includes('sprite')) return '💧';
  if (n.includes('corn')) return '🌽';
  if (n.includes('potato')) return '🥔';
  if (n.includes('sizzler')) return '🥩';
  if (n.includes('dal')) return '🫘';
  if (n.includes('palak')) return '🥬';
  if (!it.veg) return '🍗';
  return '🥗';
}

function doSearch(v) {
  srchTerm = v.toLowerCase().trim();
  if (srchTerm.length > 0) {
    document.querySelectorAll('.ctab').forEach(t => t.classList.remove('on'));
  } else {
    const first = document.querySelector('.ctab');
    if (first) first.classList.add('on');
    curCat = 'ALL';
  }
  renderMenu();
}

function doFilter(t, btn) {
  document.querySelectorAll('.fpills .pill').forEach(p => p.classList.remove('on'));
  btn.classList.add('on');
  vegFilter = t;
  renderMenu();
}

// ── CART ──
function addCart(id, name, price, veg) {
  if (cart[id]) cart[id].qty++;
  else cart[id] = { id, name, price, veg, qty: 1 };
  const b = document.getElementById(`atc-${id}`);
  if (b) { b.textContent = '✓'; b.classList.add('done'); setTimeout(() => { b.textContent = '+'; b.classList.remove('done'); }, 1200); }
  updateCartUI();
}

function remCart(id) {
  if (!cart[id]) return;
  cart[id].qty--;
  if (cart[id].qty <= 0) delete cart[id];
  updateCartUI();
}

function updateCartUI() {
  const items = Object.values(cart);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const cc = document.getElementById('cartCount');
  if (cc) cc.textContent = count;
  const body = document.getElementById('cartBody');
  const ft = document.getElementById('cartFt');
  if (!items.length) {
    if (body) body.innerHTML = '<div class="cart-empty"><div style="font-size:2.5rem;margin-bottom:8px">🛒</div><p style="font-weight:700;margin-bottom:4px">Cart is empty</p><small style="color:#b09080">Add items from the menu</small></div>';
    if (ft) ft.style.display = 'none';
  } else {
    if (body) body.innerHTML = items.map(it => `<div class="ci"><div class="ci-info"><div class="ci-name">${it.name}</div><div class="ci-price">₹${it.price} each</div></div><div class="ci-qty"><button class="qb" onclick="remCart('${it.id}')">−</button><span class="qn">${it.qty}</span><button class="qb" onclick="addCart('${it.id}','${esc(it.name)}',${it.price},${it.veg})">+</button></div></div>`).join('');
    const ct = document.getElementById('cartTot');
    if (ct) ct.textContent = `₹${total}`;
    if (ft) ft.style.display = 'block';
  }
  const si = document.getElementById('ordItems');
  const tr = document.getElementById('ordTotR');
  const ot = document.getElementById('ordTot');
  if (!items.length) {
    if (si) si.innerHTML = '<p class="enote">Add items from the menu above.</p>';
    if (tr) tr.style.display = 'none';
  } else {
    if (si) si.innerHTML = items.map(i => `<div class="si"><span class="si-n">${i.name}</span><span class="si-q">×${i.qty}</span><span class="si-p">₹${i.price * i.qty}</span></div>`).join('');
    if (ot) ot.textContent = `₹${total}`;
    if (tr) tr.style.display = 'flex';
  }
}

function toggleCart() {
  document.getElementById('cartPanel').classList.toggle('on');
  document.getElementById('cartOv').classList.toggle('on');
}

function toggleAddr() {
  const t = document.getElementById('oType').value;
  const g = document.getElementById('addrGrp');
  if (g) g.style.display = t === 'delivery' ? 'block' : 'none';
}

async function placeOrder(e) {
  e.preventDefault();
  const items = Object.values(cart);
  if (!items.length) { showRes('ordRes', 'err', 'Your cart is empty. Add items from the menu first.'); return; }
  const oType = document.getElementById('oType').value;
  const addrEl = document.getElementById('oAddr');
  const addr = addrEl ? addrEl.value : '';
  if (oType === 'delivery' && !addr.trim()) { showRes('ordRes', 'err', 'Please enter your delivery address.'); return; }
  const btn = document.getElementById('ordBtn');
  btn.textContent = 'Placing Order...'; btn.disabled = true;
  try {
    const r = await fetch(`${API}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName: document.getElementById('oName').value, phone: document.getElementById('oPhone').value, orderType: oType, address: addr, items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.qty })), specialInstructions: document.getElementById('oNote') ? document.getElementById('oNote').value : '' }) });
    const j = await r.json();
    if (j.success) { showRes('ordRes', 'ok', `Order placed! 🎉\nOrder #${j.data.orderNumber} · Total: ₹${j.data.total}\nEstimated: ${j.data.estimatedTime}`); cart = {}; updateCartUI(); document.getElementById('ordForm').reset(); }
    else showRes('ordRes', 'err', j.message);
  } catch(err) { showRes('ordRes', 'err', 'Cannot connect to server. Please call: 9459259298'); }
  btn.textContent = '🍛 Place Order'; btn.disabled = false;
}

async function makeRes(e) {
  e.preventDefault();
  const btn = document.getElementById('resBtn');
  btn.textContent = 'Confirming...'; btn.disabled = true;
  try {
    const r = await fetch(`${API}/reservations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: document.getElementById('rName').value, phone: document.getElementById('rPhone').value, date: document.getElementById('rDate').value, time: document.getElementById('rTime').value, guests: document.getElementById('rGuests').value, specialRequests: document.getElementById('rReq') ? document.getElementById('rReq').value : '' }) });
    const j = await r.json();
    if (j.success) { showRes('resRes', 'ok', `Confirmed! 🎉\nCode: ${j.data.confirmationCode}\n${j.data.date} at ${j.data.time} · ${j.data.guests} guests`); document.getElementById('resForm').reset(); }
    else showRes('resRes', 'err', j.message);
  } catch(err) { showRes('resRes', 'err', 'Cannot connect to server. Please call: 9459259298'); }
  btn.textContent = 'Confirm Reservation'; btn.disabled = false;
}

function showRes(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `res-box ${type}`;
  el.innerHTML = msg.split('\n').map((l, i) => i === 0 ? `<strong>${l}</strong>` : l).join('<br>');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleMob() { document.getElementById('mobNav').classList.toggle('open'); }
function closeMob() { document.getElementById('mobNav').classList.remove('open'); }
