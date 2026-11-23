/* Products page: category filter, search, stock badges. */
(function () {
  'use strict';
  const U = DashUtils, D = STORE_DATA;
  const cur = v => U.formatCurrency(v, D.currency);
  const state = { q: '', cat: 'all' };
  const CAT_COLORS = { Audio: '#6366f1', Wearables: '#14b8a6', 'Smart Home': '#f59e0b', Accessories: '#ec4899', Computers: '#8b5cf6' };

  window.renderPage = function () {
    shell('Products', D.products.length + ' SKUs across ' + new Set(D.products.map(p => p.category)).size + ' categories');
    const cats = [...new Set(D.products.map(p => p.category))];
    const el = document.getElementById('content');
    el.innerHTML = `
      <div class="controls card">
        <input type="search" id="q" placeholder="Search products...">
        <select id="cat" aria-label="Product category"><option value="all">All categories</option>${cats.map(c => `<option>${c}</option>`).join('')}</select>
        <span class="muted" id="count"></span>
      </div>
      <div class="prod-grid" id="grid"></div>
      <footer class="foot">Stock levels and sales are synthetic demo data.</footer>`;
    el.querySelector('#q').addEventListener('input', e => { state.q = e.target.value.toLowerCase(); draw(); });
    el.querySelector('#cat').addEventListener('change', e => { state.cat = e.target.value; draw(); });
    draw();
  };

  function stockBadge(p) {
    if (p.stock === 0) return '<span class="badge b-out">out of stock</span>';
    if (p.stock <= 15) return '<span class="badge b-low">low: ' + p.stock + '</span>';
    return '<span class="badge b-in">in stock: ' + p.stock + '</span>';
  }

  function draw() {
    const list = D.products.filter(p =>
      (state.cat === 'all' || p.category === state.cat) &&
      (!state.q || p.name.toLowerCase().includes(state.q)));
    document.getElementById('count').textContent = list.length + ' products';
    const g = document.getElementById('grid');
    g.innerHTML = '';
    list.forEach(p => {
      const d = document.createElement('div');
      d.className = 'prod';
      const color = CAT_COLORS[p.category] || '#6366f1';
      d.innerHTML = `<div class="thumb" style="background:linear-gradient(135deg,${color},${color}bb)">${p.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
        <div class="p-name"></div>
        <div class="p-meta"><span>${p.category}</span><span>&#9733; ${p.rating}</span></div>
        <div class="p-meta"><span class="p-price">${cur(p.price)}</span><span>${U.formatNumber(p.sold)} sold</span></div>
        <div class="stock-bar"><i style="width:${Math.min(100, p.stock / 2.4)}%;background:${p.stock === 0 ? 'var(--bad)' : p.stock <= 15 ? 'var(--warn)' : 'var(--good)'}"></i></div>
        <div>${stockBadge(p)}</div>`;
      d.querySelector('.p-name').textContent = p.name;
      g.appendChild(d);
    });
  }

  renderPage();
})();
