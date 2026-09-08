if (typeof EventSource !== 'undefined') {
  const eventSource = new EventSource('/books/sse');

  eventSource.addEventListener('book-created', function (e) {
    try {
      const data = JSON.parse(e.data);
      toastr.success('Добавлена новая книга: "' + data.title + '"');
    } catch (err) {
      console.error('SSE parse error:', err);
    }
  });

  eventSource.addEventListener('book-updated', function (e) {
    try {
      const data = JSON.parse(e.data);
      toastr.info('Книга обновлена: "' + data.title + '"');
    } catch (err) {
      console.error('SSE parse error:', err);
    }
  });

  eventSource.addEventListener('book-deleted', function (e) {
    try {
      const data = JSON.parse(e.data);
      toastr.warning('Книга удалена: "' + data.title + '"');
    } catch (err) {
      console.error('SSE parse error:', err);
    }
  });

  eventSource.onerror = function () {
    console.warn('SSE connection error');
  };

  window.addEventListener('pagehide', function () {
    eventSource.close();
  });
} else {
  console.warn('EventSource not supported in this browser');
}
