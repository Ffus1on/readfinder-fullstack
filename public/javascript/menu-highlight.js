document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('nav li a');

    const currentURL = document.location.href;

    const setActiveLink = () => {
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.href === currentURL) {
                item.classList.add('active');
            }
        });
    };

    setActiveLink();

    menuItems.forEach(item => {
        item.addEventListener('mouseover', () => {
            item.classList.add('hover');
        });

        item.addEventListener('mouseout', () => {
            item.classList.remove('hover');
        });
    });
});
