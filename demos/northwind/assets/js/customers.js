/* Customers page: table with per-customer aggregates. */
(function () {
  'use strict';
  const U = DashUtils, D = STORE_DATA;
  const cur = v => U.formatCurrency(v, D.currency);
  const state = { q: '', sort: 'totalSpent', dir: 'desc', page: 1, per: 12 };

  window.renderPage = function () {
    shell('Customers', D.customers.length + ' registered customers (synthetic)');
    const el = document.getElementById('content');
    el.innerHTML = `
      <div class="card">
        <div class="controls"><input type="search" id="q" placeholder="Search name, email or city..."><span class="muted" id="count"></span></div>
        <div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable data table"><table><thead><tr>
          ${[['name','Customer'],['city','City'],['joined','Joined'],['orders','Orders'],['totalSpent','Total spent'],['lastOrder','Last order']]
            .map(([k, l]) => `<th data-k="${k}">${l} <span class="arr"></span></th>`).join('')}
        </tr></thead><tbody id="rows"></tbody></table></div>
        <div class="pager"><button id="prev">&larr; Prev</button><span id="pg" class="muted"></span><button id="next">Next &rarr;</button></div>
      </div>
      <footer class="foot">All customer records are fictional.</footer>`;
    el.querySelector('#q').addEventListener('input', e => { state.q = e.target.value.toLowerCase(); state.page = 1; draw(); });
    el.querySelector('#prev').addEventListener('click', () => { state.page--; draw(); });
    el.querySelector('#next').addEventListener('click', () => { state.page++; draw(); });
    el.querySelectorAll('th').forEach(th => th.addEventListener('click', () => {
      const k = th.dataset.k;
      if (state.sort === k) state.dir = state.dir === 'asc' ? 'desc' : 'asc';
      else { state.sort = k; state.dir = 'asc'; }
      draw();
    }));
    draw();
  };

  function draw() {
    const sums = U.customerSummaries(D.customers, D.orders).filter(c =>
      !state.q || c.name.toLowerCase().includes(state.q) || c.email.includes(state.q) || c.city.toLowerCase().includes(state.q));
    const list = U.sortRows(sums, state.sort, state.dir);
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
    pg.rows.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><b></b><br><span class="muted" style="font-size:12px"></span></td>
        <td></td><td>${U.formatDate(c.joined)}</td><td class="num">${c.orders}</td>
        <td class="num">${cur(c.totalSpent)}</td><td>${c.lastOrder ? U.formatDate(c.lastOrder) : '<span class="muted">-</span>'}</td>`;
      tr.children[0].querySelector('b').textContent = c.name;
      tr.children[0].querySelector('.muted').textContent = c.email;
      tr.children[1].textContent = c.city + ', ' + c.country;
      tb.appendChild(tr);
    });
  }

  renderPage();
})();
