/* Orders page: search, status filter, sorting, pagination, detail drawer. */
(function () {
  'use strict';
  const U = DashUtils, D = STORE_DATA;
  const cur = v => U.formatCurrency(v, D.currency);
  const cmap = new Map(D.customers.map(c => [c.id, c]));
  const pmap = new Map(D.products.map(p => [p.id, p]));
  const state = { q: '', status: 'all', sort: 'date', dir: 'desc', page: 1, per: 12 };

  window.renderPage = function () {
    shell('Orders', U.formatNumber(D.orders.length) + ' orders in the synthetic dataset');
    const el = document.getElementById('content');
    el.innerHTML = `
      <div class="card">
        <div class="controls">
          <input type="search" id="q" placeholder="Search order # or customer...">
          <select id="status" aria-label="Order status"><option value="all">All statuses</option>
            ${['processing','shipped','delivered','cancelled','refunded'].map(s => `<option>${s}</option>`).join('')}</select>
          <span class="muted" id="count"></span>
        </div>
        <div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable data table"><table><thead><tr>
          ${[['id','Order'],['customer','Customer'],['date','Date'],['items','Items'],['status','Status'],['total','Total']]
            .map(([k, l]) => `<th data-k="${k}">${l} <span class="arr"></span></th>`).join('')}
        </tr></thead><tbody id="rows"></tbody></table></div>
        <div class="pager"><button id="prev">&larr; Prev</button><span id="pg" class="muted"></span><button id="next">Next &rarr;</button></div>
      </div>
      <footer class="foot">Click a row to inspect the order. Data is synthetic.</footer>`;

    el.querySelector('#q').addEventListener('input', e => { state.q = e.target.value; state.page = 1; draw(); });
    el.querySelector('#status').addEventListener('change', e => { state.status = e.target.value; state.page = 1; draw(); });
    el.querySelector('#prev').addEventListener('click', () => { state.page--; draw(); });
    el.querySelector('#next').addEventListener('click', () => { state.page++; draw(); });
    el.querySelectorAll('th').forEach(th => th.addEventListener('click', () => {
      const k = th.dataset.k;
      if (state.sort === k) state.dir = state.dir === 'asc' ? 'desc' : 'asc';
      else { state.sort = k; state.dir = 'asc'; }
      draw();
    }));
    document.getElementById('veil').addEventListener('click', closeDrawer);
    draw();
  };

  function rows() {
    let list = U.filterOrders(D.orders, state, D.customers);
    list = list.map(o => ({ ...o, customer: cmap.get(o.customerId).name, items: o.items.reduce((s, i) => s + i.qty, 0) }));
    return U.sortRows(list, state.sort, state.dir);
  }

  function draw() {
    const list = rows();
    const pg = U.paginate(list, state.page, state.per);
    state.page = pg.page;
    document.getElementById('count').textContent = pg.total + ' matching';
    document.getElementById('pg').textContent = 'Page ' + pg.page + ' of ' + pg.pages;
    document.getElementById('prev').disabled = pg.page <= 1;
    document.getElementById('next').disabled = pg.page >= pg.pages;
    document.querySelectorAll('th .arr').forEach(a => a.textContent = '');
    const th = document.querySelector(`th[data-k="${state.sort}"] .arr`);
    if (th) th.textContent = state.dir === 'asc' ? '\u25B2' : '\u25BC';
    const tb = document.getElementById('rows');
    tb.innerHTML = '';
    pg.rows.forEach(o => {
      const tr = document.createElement('tr');
      tr.className = 'clickable';tr.tabIndex=0;tr.setAttribute('aria-label','Open order '+o.id);tr.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openDrawer(o.id);}});
      tr.innerHTML = `<td><b></b></td><td></td><td>${U.formatDate(o.date)}</td><td class="num">${o.items}</td>
        <td><span class="badge b-${o.status}">${o.status}</span></td><td class="num">${cur(o.total)}</td>`;
      tr.children[0].firstChild.textContent = o.id;
      tr.children[1].textContent = o.customer;
      tr.addEventListener('click', () => openDrawer(o.id));
      tb.appendChild(tr);
    });
  }

  function openDrawer(id) {
    const o = D.orders.find(x => x.id === id);
    const c = cmap.get(o.customerId);
    const dr = document.getElementById('drawer');
    dr.innerHTML = `<button class="icon-btn close" id="dr-close" aria-label="Close order details">&times;</button>
      <h3>${o.id}</h3><p class="muted">${U.formatDate(o.date)} &middot; <span class="badge b-${o.status}">${o.status}</span></p>
      <div class="kv"><span>Customer</span><b></b></div>
      <div class="kv"><span>Email</span><b style="font-weight:500">${c.email}</b></div>
      <div class="kv"><span>Ship to</span><b style="font-weight:500">${c.city}, ${c.country}</b></div>
      <div class="kv"><span>Payment</span><b style="font-weight:500">${o.payment.replace(/_/g, ' ')}</b></div>
      <h3 style="margin-top:18px">Items</h3>
      ${o.items.map(it => { const p = pmap.get(it.productId); return `<div class="kv"><span>${p.name} &times;${it.qty}</span><b style="font-weight:500">${cur(it.qty * it.unitPrice)}</b></div>`; }).join('')}
      <div class="kv"><span>Subtotal</span><b style="font-weight:500">${cur(o.subtotal)}</b></div>
      <div class="kv"><span>Shipping</span><b style="font-weight:500">${o.shipping ? cur(o.shipping) : 'Free'}</b></div>
      <div class="kv"><span>VAT (14%)</span><b style="font-weight:500">${cur(o.tax)}</b></div>
      <div class="kv" style="font-size:15px"><span>Total</span><b>${cur(o.total)}</b></div>`;
    dr.querySelector('.kv b').textContent = c.name;
    document.getElementById('dr-close').addEventListener('click', closeDrawer);
    dr.setAttribute('aria-hidden','false');document.body.classList.add('drawer-open');document.getElementById('dr-close').focus();
  }
  function closeDrawer() {document.getElementById('drawer').setAttribute('aria-hidden','true');document.body.classList.remove('drawer-open');document.getElementById('q').focus();}document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer();});

  renderPage();
})();
