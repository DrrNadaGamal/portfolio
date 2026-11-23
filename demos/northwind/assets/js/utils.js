/* Shared dashboard logic. Pure functions: used by the browser pages and by
 * tests/run.js in Node (module.exports). */
const DashUtils = (function () {
  'use strict';

  const REVENUE_STATUSES = ['delivered', 'shipped', 'processing'];

  function formatCurrency(v, currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v);
  }
  function formatNumber(v, locale = 'en-US') {
    return new Intl.NumberFormat(locale).format(v);
  }
  function formatCompact(v, locale = 'en-US') {
    return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(v);
  }
  function formatDate(iso, locale = 'en-GB') {
    const d = new Date(iso + 'T00:00:00Z');
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);
  }
  function isRevenueOrder(o) { return REVENUE_STATUSES.includes(o.status); }

  function computeKPIs(orders) {
    const rev = orders.filter(isRevenueOrder);
    const revenue = Math.round(rev.reduce((s, o) => s + o.total, 0) * 100) / 100;
    const count = rev.length;
    return {
      revenue,
      orders: orders.length,
      fulfilled: count,
      avgOrderValue: count ? Math.round((revenue / count) * 100) / 100 : 0,
      customers: new Set(orders.map(o => o.customerId)).size,
    };
  }

  function revenueByDay(orders, days) {
    const map = new Map();
    for (const o of orders) {
      if (!isRevenueOrder(o)) continue;
      const cur = map.get(o.date) || { date: o.date, revenue: 0, orders: 0 };
      cur.revenue = Math.round((cur.revenue + o.total) * 100) / 100;
      cur.orders += 1;
      map.set(o.date, cur);
    }
    return days.map(d => map.get(d) || { date: d, revenue: 0, orders: 0 });
  }

  function lastNDays(n, endIso) {
    const end = new Date(endIso + 'T00:00:00Z');
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      out.push(new Date(end.getTime() - i * 86400000).toISOString().slice(0, 10));
    }
    return out;
  }

  function countBy(arr, key) {
    const m = {};
    for (const x of arr) { const k = typeof key === 'function' ? key(x) : x[key]; m[k] = (m[k] || 0) + 1; }
    return m;
  }

  function revenueByCategory(orders, products) {
    const cat = {};
    const pmap = new Map(products.map(p => [p.id, p]));
    for (const o of orders) {
      if (!isRevenueOrder(o)) continue;
      for (const it of o.items) {
        const p = pmap.get(it.productId);
        if (!p) continue;
        cat[p.category] = Math.round(((cat[p.category] || 0) + it.qty * it.unitPrice) * 100) / 100;
      }
    }
    return Object.entries(cat).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }

  function topProducts(orders, products, n = 5) {
    const acc = new Map();
    for (const o of orders) {
      if (!isRevenueOrder(o)) continue;
      for (const it of o.items) {
        const cur = acc.get(it.productId) || { sold: 0, revenue: 0 };
        cur.sold += it.qty;
        cur.revenue = Math.round((cur.revenue + it.qty * it.unitPrice) * 100) / 100;
        acc.set(it.productId, cur);
      }
    }
    return products
      .map(p => ({ ...p, ...(acc.get(p.id) || { sold: 0, revenue: 0 }) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, n);
  }

  function filterOrders(orders, { q = '', status = 'all' } = {}, customers = []) {
    const term = q.trim().toLowerCase();
    const cmap = new Map(customers.map(c => [c.id, c]));
    return orders.filter(o => {
      if (status !== 'all' && o.status !== status) return false;
      if (!term) return true;
      const c = cmap.get(o.customerId);
      return o.id.toLowerCase().includes(term) || (c && c.name.toLowerCase().includes(term));
    });
  }

  function sortRows(arr, key, dir = 'asc') {
    const f = dir === 'asc' ? 1 : -1;
    return [...arr].sort((a, b) => {
      const x = a[key], y = b[key];
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * f;
      return String(x).localeCompare(String(y)) * f;
    });
  }

  function paginate(arr, page = 1, per = 10) {
    const pages = Math.max(1, Math.ceil(arr.length / per));
    const p = Math.min(Math.max(1, page), pages);
    return { page: p, pages, total: arr.length, rows: arr.slice((p - 1) * per, p * per) };
  }

  function lowStock(products, threshold = 15) {
    return products.filter(p => p.stock <= threshold).sort((a, b) => a.stock - b.stock);
  }

  function customerSummaries(customers, orders) {
    return customers.map(c => {
      const mine = orders.filter(o => o.customerId === c.id && isRevenueOrder(o));
      return {
        ...c,
        orders: mine.length,
        totalSpent: Math.round(mine.reduce((s, o) => s + o.total, 0) * 100) / 100,
        lastOrder: mine.map(o => o.date).sort().pop() || null,
      };
    });
  }

  return {
    REVENUE_STATUSES, formatCurrency, formatNumber, formatCompact, formatDate,
    isRevenueOrder, computeKPIs, revenueByDay, lastNDays, countBy,
    revenueByCategory, topProducts, filterOrders, sortRows, paginate,
    lowStock, customerSummaries,
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = DashUtils;
