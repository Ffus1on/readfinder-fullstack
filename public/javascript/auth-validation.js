document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form.auth-form');
    if (!forms.length) return;

    const PASSWORD_RULE = 'Минимум 8 символов, включая цифру';

    const getError = (field) => {
        const group = field.closest('.form-group');
        return group ? group.querySelector('.field-error') : null;
    };

    const validateField = (field) => {
        const error = getError(field);
        let message = '';

        if (field.required && !field.value.trim()) {
            message = 'Заполните это поле';
        } else if (field.type === 'email' && field.value.trim() && !field.validity.valid) {
            message = 'Некорректный email';
        } else if (
            field.hasAttribute('data-password') &&
            field.value &&
            !(field.value.length >= 8 && /\d/.test(field.value))
        ) {
            message = PASSWORD_RULE;
        } else if (field.maxLength > 0 && field.value.length > field.maxLength) {
            message = `Не длиннее ${field.maxLength} символов`;
        }

        field.classList.toggle('invalid', !!message);
        if (error) {
            error.textContent = message;
            error.classList.toggle('visible', !!message);
        }
        const group = field.closest('.form-group');
        const hint = group ? group.querySelector('.password-hint') : null;
        if (hint) hint.style.display = message ? 'none' : '';
        return !message;
    };

    forms.forEach((form) => {
        form.setAttribute('novalidate', 'novalidate');
        const fields = form.querySelectorAll('input[name]');

        fields.forEach((field) => {
            field.addEventListener('input', () => validateField(field));
        });

        form.addEventListener('submit', (event) => {
            let firstInvalid = null;
            fields.forEach((field) => {
                const valid = validateField(field);
                if (!valid && !firstInvalid) {
                    firstInvalid = field;
                }
            });
            if (firstInvalid) {
                event.preventDefault();
                firstInvalid.focus();
            }
        });
    });
});