document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById("preloader");
    const usersContainer = document.getElementById("users-container");

    preloader.classList.remove("hidden");

    const randomFilter = Math.random() > 0.5 ? "?id_gte=5" : "?id_lte=4";

    fetch(`https://jsonplaceholder.typicode.com/users${randomFilter}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(users => {
            preloader.classList.add("hidden");

            users.forEach(user => {
                const userCard = document.createElement("div");
                userCard.classList.add("user-card");

                userCard.innerHTML = `
                    <h3>${user.name}</h3>
                    <p><strong>Логин:</strong> ${user.username}</p>
                    <p><strong>Email:</strong> <a href="mailto:${user.email}">${user.email}</a></p>
                    <p><strong>Телефон:</strong> ${user.phone}</p>
                `;

                usersContainer.appendChild(userCard);
            });
        })
        .catch(error => {
            preloader.classList.add("hidden");

            const errorMessage = document.createElement("p");
            errorMessage.innerHTML = "⚠ Что-то пошло не так. Пожалуйста, попробуйте позже.";
            errorMessage.style.color = "red";
            usersContainer.appendChild(errorMessage);

            console.error("Ошибка загрузки данных:", error);
        });
});
