/* Overview page. */
(function () {
  'use strict';
  const U = DashUtils, D = STORE_DATA;
  const cur = v => U.formatCurrency(v, D.currency);
  const compact = v => '$' + U.formatCompact(v);

  window.renderPage = function () {
    shell('Overview', 'Last 90 days of store activity (synthetic demo data)');
    const days90 = U.lastNDays(90, D.generatedAt);
    const days30 = U.lastNDays(30, D.generatedAt);
    const prev30 = U.lastNDays(60, D.generatedAt).slice(0, 30);

    const kpis = U.computeKPIs(D.orders);
    const byDay = U.revenueByDay(D.orders, days90);
    const sum = rows => Math.round(rows.reduce((s, r) => s + r.revenue, 0) * 100) / 100;
    const d30 = U.revenueByDay(D.orders, days30), p30 = U.revenueByDay(D.orders, prev30);
    const rev30 = sum(d30), revPrev = sum(p30);
    const delta = revPrev ? Math.round(((rev30 - revPrev) / revPrev) * 1000) / 10 : 0;

    const byCat = U.revenueByCategory(D.orders, D.products);
    const top = U.topProducts(D.orders, D.products, 5);
    const recent = [...D.orders].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 8);
    const cmap = new Map(D.customers.map(c => [c.id, c]));
    const low = U.lowStock(D.products);

    const el = document.getElementById('content');
    el.innerHTML = `
      <section class="cards">
        ${kpi('Revenue (90d)', cur(kpis.revenue), delta, 'vs prior 30d: ' + cur(rev30))}
        ${kpi('Orders', U.formatNumber(kpis.orders), null, kpis.fulfilled + ' revenue-bearing')}
        ${kpi('Avg order value', cur(kpis.avgOrderValue), null, 'across ' + kpis.fulfilled + ' orders')}
        ${kpi('Active customers', U.formatNumber(kpis.customers), null, 'of ' + D.customers.length + ' registered')}
      </section>
      <section class="grid-2">
        <div class="card"><h2>Revenue trend</h2><p class="hint">Daily revenue, last 90 days</p><div id="rev-chart"></div></div>
        <div class="card"><h2>Revenue by category</h2><p class="hint">Share of product revenue</p><div id="cat-chart" class="donut-wrap"></div></div>
      </section>
      <section class="grid-2">
        <div class="card"><h2>Recent orders</h2><div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable data table"><table>
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th class="num">Total</th></tr></thead>
          <tbody>${recent.map(o => `<tr>
            <td><b>${o.id}</b></td><td></td><td>${U.formatDate(o.date)}</td>
            <td><span class="badge b-${o.status}">${o.status}</span></td>
            <td class="num">${cur(o.total)}</td></tr>`).join('')}</tbody></table></div></div>
        <div class="card"><h2>Top products</h2><div id="top-chart"></div>
          ${low.length ? `<p class="hint" style="margin-top:12px">Low stock: ${low.slice(0,4).map(p => p.name + ' (' + p.stock + ')').join(', ')}</p>` : ''}
        </div>
      </section>
      <footer class="foot">Northwind Admin - portfolio demo. All customers, orders and revenue are synthetic.</footer>`;

    el.querySelectorAll('#content tbody tr').forEach((tr, i) => {
      tr.children[1].textContent = cmap.get(recent[i].customerId).name;
    });

    Charts.area(document.getElementById('rev-chart'),
      byDay.map(r => ({ label: r.date.slice(8) + '/' + r.date.slice(5, 7), value: r.revenue })),
      { tick: compact });
    Charts.donut(document.getElementById('cat-chart'), byCat, { tick: compact });
    Charts.bars(document.getElementById('top-chart'),
      top.map(p => ({ name: p.name, short: p.name.split(' ')[0], value: p.revenue })),
      { tick: compact, height: 200 });
  };

  function kpi(label, value, deltaPct, sub) {
    const d = deltaPct === null ? '' :
      `<div class="k-delta ${deltaPct >= 0 ? 'up' : 'down'}">${deltaPct >= 0 ? '&#9650;' : '&#9660;'} ${Math.abs(deltaPct)}% vs prior 30 days</div>`;
    return `<div class="card kpi"><div class="k-label">${label}</div><div class="k-value">${value}</div>${d}<div class="muted">${sub}</div></div>`;
  }

  renderPage();
})();
