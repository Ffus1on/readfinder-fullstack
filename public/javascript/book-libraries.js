(function () {
  const section = document.getElementById('book-libraries');
  if (!section) return;

  const searchInput = document.getElementById('book-library-search');
  const resultsList = document.getElementById('book-library-results');
  if (!searchInput || !resultsList) return;

  const items = Array.from(resultsList.querySelectorAll('li[data-library-id]'));

  function applyFilter() {
    const query = searchInput.value.trim().toLowerCase();
    items.forEach(function (item) {
      const name = item.querySelector('.library-name').textContent.toLowerCase();
      const address = item.querySelector('.library-address').textContent.toLowerCase();
      item.hidden = query !== '' && name.indexOf(query) === -1 && address.indexOf(query) === -1;
    });
  }

  searchInput.addEventListener('input', applyFilter);
})();