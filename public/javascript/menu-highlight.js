document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('nav li a');

    const currentURL = document.location.href;

    menuItems.forEach(item => {
        if (item.href === currentURL) {
            item.classList.add('active');
        }
    });
});
