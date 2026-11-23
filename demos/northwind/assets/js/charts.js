/* Tiny dependency-free SVG chart renderer (area, bars, donut). */
const Charts = (function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const PALETTE = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#0ea5e9', '#84cc16'];

  function svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  function area(el, points, opts = {}) {
    clear(el);
    const W = 640, H = opts.height || 220, P = { t: 16, r: 12, b: 26, l: 46 };
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img', 'aria-label':'Synthetic revenue over time' });
    const max = Math.max(...points.map(p => p.value), 1);
    const iw = W - P.l - P.r, ih = H - P.t - P.b;
    const x = i => P.l + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
    const y = v => P.t + ih - (v / max) * ih;

    const gid = 'g' + Math.random().toString(36).slice(2, 8);
    const defs = svgEl('defs', {});
    const grad = svgEl('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
    grad.appendChild(svgEl('stop', { offset: '0%', 'stop-color': opts.color || PALETTE[0], 'stop-opacity': 0.32 }));
    grad.appendChild(svgEl('stop', { offset: '100%', 'stop-color': opts.color || PALETTE[0], 'stop-opacity': 0.02 }));
    defs.appendChild(grad); svg.appendChild(defs);

    for (let i = 0; i <= 4; i++) {
      const gy = P.t + (ih / 4) * i;
      svg.appendChild(svgEl('line', { x1: P.l, x2: W - P.r, y1: gy, y2: gy, class: 'grid' }));
      const lbl = svgEl('text', { x: P.l - 8, y: gy + 4, class: 'axis', 'text-anchor': 'end' });
      lbl.textContent = (opts.tick || (v => v))(max * (1 - i / 4));
      svg.appendChild(lbl);
    }

    const path = points.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(p.value).toFixed(1)).join(' ');
    svg.appendChild(svgEl('path', { d: `${path} L${x(points.length - 1)},${P.t + ih} L${x(0)},${P.t + ih} Z`, fill: `url(#${gid})` }));
    svg.appendChild(svgEl('path', { d: path, fill: 'none', stroke: opts.color || PALETTE[0], 'stroke-width': 2.2, 'stroke-linejoin': 'round' }));

    const step = Math.ceil(points.length / 6);
    points.forEach((p, i) => {
      if (i % step && i !== points.length - 1) return;
      const t = svgEl('text', { x: x(i), y: H - 8, class: 'axis', 'text-anchor': 'middle' });
      t.textContent = p.label;
      svg.appendChild(t);
    });
    el.appendChild(svg);
  }

  function bars(el, items, opts = {}) {
    clear(el);
    const W = 640, H = opts.height || 220, P = { t: 16, r: 12, b: 40, l: 46 };
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart' });
    const max = Math.max(...items.map(i => i.value), 1);
    const iw = W - P.l - P.r, ih = H - P.t - P.b;
    const bw = Math.min(38, (iw / items.length) * 0.62);
    items.forEach((it, i) => {
      const cx = P.l + (iw / items.length) * (i + 0.5);
      const h = (it.value / max) * ih;
      const rect = svgEl('rect', { x: cx - bw / 2, y: P.t + ih - h, width: bw, height: h, rx: 5, fill: it.color || PALETTE[i % PALETTE.length] });
      rect.appendChild(svgEl('title', {})).textContent = it.name + ': ' + (opts.tick || (v => v))(it.value);
      svg.appendChild(rect);
      const lbl = svgEl('text', { x: cx, y: H - 24, class: 'axis', 'text-anchor': 'middle' });
      lbl.textContent = it.short || it.name;
      svg.appendChild(lbl);
      const val = svgEl('text', { x: cx, y: P.t + ih - h - 6, class: 'axis strong', 'text-anchor': 'middle' });
      val.textContent = (opts.tick || (v => v))(it.value);
      svg.appendChild(val);
    });
    el.appendChild(svg);
  }

  function donut(el, segments, opts = {}) {
    clear(el);
    const size = 180, r = 70, cx = 90, cy = 90, sw = 26;
    const svg = svgEl('svg', { viewBox: `0 0 ${size} ${size}`, class: 'donut' });
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    let a0 = -Math.PI / 2;
    segments.forEach((seg, i) => {
      const frac = seg.value / total;
      const a1 = a0 + frac * Math.PI * 2;
      const large = frac > 0.5 ? 1 : 0;
      const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)];
      const p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
      const path = svgEl('path', {
        d: `M ${p0[0].toFixed(2)} ${p0[1].toFixed(2)} A ${r} ${r} 0 ${large} 1 ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`,
        fill: 'none', stroke: PALETTE[i % PALETTE.length], 'stroke-width': sw,
      });
      path.appendChild(svgEl('title', {})).textContent = seg.name + ': ' + (opts.tick || (v => v))(seg.value);
      svg.appendChild(path);
      a0 = a1;
    });
    el.appendChild(svg);
    const legend = document.createElement('ul');
    legend.className = 'legend';
    segments.forEach((seg, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="dot" style="background:${PALETTE[i % PALETTE.length]}"></span>` +
        `<span class="lg-name"></span><b class="lg-val"></b>`;
      li.querySelector('.lg-name').textContent = seg.name;
      li.querySelector('.lg-val').textContent = (opts.tick || (v => v))(seg.value);
      legend.appendChild(li);
    });
    el.appendChild(legend);
  }

  return { area, bars, donut, PALETTE };
})();
