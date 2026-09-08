document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('.event-form form');
    if (!forms.length) return;

    const getError = (field) => {
        const group = field.closest('.form-group');
        return group ? group.querySelector('.field-error') : null;
    };

    const validateField = (field) => {
        const error = getError(field);
        let message = '';

        if (field.required && !field.value) {
            message = 'Заполните это поле';
        } else if (field.name === 'endTime' && field.value) {
            const startField = field.form.querySelector('#startTime');
            if (
                startField &&
                startField.value &&
                new Date(field.value) < new Date(startField.value)
            ) {
                message = field.form.dataset.dateError || '';
            }
        }

        field.classList.toggle('invalid', !!message);
        if (error) {
            error.textContent = message;
            error.classList.toggle('visible', !!message);
        }
        return !message;
    };

    forms.forEach((form) => {
        form.setAttribute('novalidate', 'novalidate');
        const fields = form.querySelectorAll('input[name], select[name]');

        const validateAll = () => {
            let firstInvalid = null;
            fields.forEach((field) => {
                const valid = validateField(field);
                if (!valid && !firstInvalid) {
                    firstInvalid = field;
                }
            });
            return firstInvalid;
        };

        fields.forEach((field) => {
            field.addEventListener('input', () => validateAll());
            field.addEventListener('change', () => validateAll());
        });

        form.addEventListener('submit', (event) => {
            const firstInvalid = validateAll();
            if (firstInvalid) {
                event.preventDefault();
                firstInvalid.focus();
            }
        });
    });
});