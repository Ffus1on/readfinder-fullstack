(function() {
    window.addEventListener('load', function() {
        const loadTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;

        const loadTimeInSeconds = (loadTime / 1000).toFixed(2);

        const loadTimeInfo = document.createElement('p');
        loadTimeInfo.textContent = `Время загрузки страницы: ${loadTimeInSeconds} секунд.`;
        loadTimeInfo.style.textAlign = 'center';

        const footer = document.querySelector('footer');
        footer.appendChild(loadTimeInfo);
    });
})();
