'use strict';
// Enhancement only: all project links and content work without JavaScript.
const filters = document.querySelector('.filters');
if (filters) {
  filters.hidden = false;
  const cards = [...document.querySelectorAll('.project-card')];
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    const category = button.dataset.filter;
    filters.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    cards.forEach((card) => {
      card.hidden = category !== 'All' && card.dataset.category !== category;
      if (!card.hidden) count++;
    });
    document.getElementById('filter-result').textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown for ${category}.`;
  });
}
const briefForm = document.getElementById('brief-form');
if (briefForm) {
  briefForm.hidden = false;
  briefForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!briefForm.reportValidity()) return;
    const values = new FormData(briefForm);
    const brief = `PROJECT BRIEF FOR NADA GAMAL\n\nName: ${String(values.get('name')).trim()}\nProject type: ${values.get('type')}\n\nProject details:\n${String(values.get('message')).trim()}\n\nThis file was prepared locally. No message has been sent.\n`;
    const blob = new Blob([brief], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'project-brief-for-nada.txt';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    document.getElementById('brief-status').textContent = 'Your brief download is ready. No message was sent. Share it with Nada using the email link.';
  });
}
