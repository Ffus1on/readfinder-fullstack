(function () {
  var form = document.querySelector('.rating-form[data-rating-book]');
  if (!form) return;

  var bookId = form.getAttribute('data-rating-book');
  var myValue = parseInt(form.getAttribute('data-rating-value') || '0', 10);
  if (Number.isNaN(myValue)) myValue = 0;

  var stars = Array.prototype.slice.call(
    form.querySelectorAll('.rating-star'),
  );
  var status = form.querySelector('.rating-status');
  var submitting = false;

  function highlight(count) {
    stars.forEach(function (star) {
      var value = parseInt(star.getAttribute('data-value'), 10);
      star.classList.toggle('is-active', value <= count);
      star.classList.toggle('is-hover', value <= count);
    });
  }

  function reset() {
    stars.forEach(function (star) {
      star.classList.remove('is-hover');
      var value = parseInt(star.getAttribute('data-value'), 10);
      star.classList.toggle('is-active', value <= myValue);
    });
  }

  stars.forEach(function (star) {
    star.addEventListener('mouseenter', function () {
      if (submitting) return;
      highlight(parseInt(star.getAttribute('data-value'), 10));
    });
    star.addEventListener('mouseleave', function () {
      if (submitting) return;
      reset();
    });
    star.addEventListener('focus', function () {
      if (submitting) return;
      highlight(parseInt(star.getAttribute('data-value'), 10));
    });
    star.addEventListener('blur', function () {
      if (submitting) return;
      reset();
    });
    star.addEventListener('click', function () {
      if (submitting) return;
      var value = parseInt(star.getAttribute('data-value'), 10);
      submitting = true;
      var data = new URLSearchParams();
      data.set('value', String(value));
      fetch('/books/' + bookId + '/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString(),
        credentials: 'same-origin',
      })
        .then(function () {
          window.location.reload();
        })
        .catch(function () {
          submitting = false;
          if (status) status.textContent = 'Не удалось сохранить оценку';
        });
    });
  });
})();
