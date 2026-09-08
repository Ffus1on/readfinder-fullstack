document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('schedule-form');
    const scheduleContainer = document.getElementById('schedule-container');

    const loadSchedule = () => {
        const savedSchedule = JSON.parse(localStorage.getItem('schedule')) || [];
        renderSchedule(savedSchedule);
    };

    const saveSchedule = (schedule) => {
        localStorage.setItem('schedule', JSON.stringify(schedule));
    };

    const renderSchedule = (schedule) => {
        scheduleContainer.innerHTML = '';
        if (schedule.length === 0) {
            scheduleContainer.innerHTML = '<p>Расписание пусто. Добавьте мероприятие.</p>';
            return;
        }

        const table = document.createElement('table');
        table.classList.add('schedule-table');
        const headerRow = table.insertRow();
        headerRow.innerHTML = `<th>Дата</th><th>Время</th><th>Мероприятие</th><th>Удалить</th>`;

        schedule.forEach((item, index) => {
            const row = table.insertRow();
            row.innerHTML = `
        <td>${item.date}</td>
        <td>${item.time}</td>
        <td>${item.event}</td>
        <td><button class="delete-btn" data-index="${index}">Удалить</button></td>
      `;
        });

        scheduleContainer.appendChild(table);

        document.querySelectorAll('.delete-btn').forEach((button) => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                schedule.splice(index, 1);
                saveSchedule(schedule);
                renderSchedule(schedule);
            });
        });
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const date = form.date.value;
        const time = form.time.value;
        const event = form.event.value;

        if (!date || !time || !event) {
            alert('Пожалуйста, заполните все поля.');
            return;
        }

        const schedule = JSON.parse(localStorage.getItem('schedule')) || [];

        schedule.push({ date, time, event });
        saveSchedule(schedule);
        renderSchedule(schedule);

        form.reset();
    });

    loadSchedule();
});
