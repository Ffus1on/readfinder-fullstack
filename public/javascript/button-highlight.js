document.addEventListener('DOMContentLoaded', () => {
    const footerButtons = document.querySelectorAll('footer button');

    footerButtons.forEach(button => {
        button.addEventListener('mouseover', () => {
            button.classList.add('active');
        });

        button.addEventListener('mouseout', () => {
            button.classList.remove('active');
        });
    });
});



