document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('nav li a');

    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');

    const targetPath = redirect
        ? new URL(redirect, window.location.origin).pathname
        : window.location.pathname;

    menuItems.forEach(item => {
        if (new URL(item.href).pathname === targetPath) {
            item.classList.add('active');
        }
    });
});