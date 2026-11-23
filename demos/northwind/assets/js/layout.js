/* Shared shell: sidebar + topbar, injected into #app on every page. */
(function () {
  'use strict';
  const PAGES = [
    ['index.html', 'Overview', 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'],
    ['orders.html', 'Orders', 'M7 4h10l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm10 0v4h4'],
    ['products.html', 'Products', 'M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8'],
    ['customers.html', 'Customers', 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm11 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75'],
  ];
  const here = location.pathname.split('/').pop() || 'index.html';
  const nav = PAGES.map(([href, label, path]) =>
    `<a class="nav-item ${href === here ? 'active' : ''}" href="${href}">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>
       <span>${label}</span></a>`).join('');
  document.getElementById('app').innerHTML = `
    <aside class="sidebar">
      <div class="brand"><span class="brand-mark">N</span><div><b>Northwind&nbsp;Admin</b><small>demo storefront</small></div></div>
      <nav>${nav}</nav>
      <div class="side-note">Synthetic dataset<br>278 orders &middot; 90 days</div>
    </aside>
    <div class="main">
      <header class="topbar">
        <div><h1 id="page-title"></h1><p id="page-sub" class="muted"></p></div>
        <div class="top-actions">
          <span class="pill">Synthetic data</span>
          <button id="theme-toggle" class="icon-btn" title="Toggle theme" aria-label="Toggle theme">&#9790;</button>
        </div>
      </header>
      <main id="content" class="content"></main>
    </div>`;
  const btn = document.getElementById('theme-toggle');
  const apply = t => document.documentElement.dataset.theme = t;
  apply(localStorage.getItem('nw-theme') || 'light');
  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next); localStorage.setItem('nw-theme', next);
    if (window.renderPage) window.renderPage();
  });
  window.shell = (title, sub) => {
    document.getElementById('page-title').textContent = title;
    document.getElementById('page-sub').textContent = sub;
  };
})();
