window.addEventListener('load', () => {
  const el = document.getElementById('client-elapsed-ms');
  if (!el) return;
  const nav = performance.getEntriesByType('navigation')[0];
  const ms = nav
    ? Math.round(nav.loadEventEnd - nav.startTime)
    : Math.round(performance.now());
  el.textContent = ms;
});
