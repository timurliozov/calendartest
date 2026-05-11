const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const upcomingEventsDiv = document.getElementById("upcomingEvents");

let currentDate = new Date();
let events = [];

async function loadEvents() {
    const response = await fetch("/events");
    events = await response.json();

    renderCalendar();
    renderUpcomingEvents();
}

function renderCalendar() {

    calendar.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();

    let startDay = firstDay.getDay();

    if (startDay === 0) startDay = 7;

    monthYear.innerText =
        currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric"
        });

    // Пустые клетки
    for (let i = 1; i < startDay; i++) {
        const empty = document.createElement("div");
        calendar.appendChild(empty);
    }

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {

        const dayBox = document.createElement("div");
        dayBox.className = "day";

        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const dayEvents = events.filter(
            e => e.date === dateString
        );

        let eventsHTML = "";

        dayEvents.forEach(event => {
            eventsHTML += `
                <div class="event ${event.category}">
                    ${event.title}
                </div>
            `;
        });

        dayBox.innerHTML = `
            <div class="day-number">${day}</div>
            ${eventsHTML}
        `;

        calendar.appendChild(dayBox);
    }
}

function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

function openModal() {
    document.getElementById("modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

async function addEvent() {

    const title =
        document.getElementById("eventTitle").value;

    const date =
        document.getElementById("eventDate").value;

    const category =
        document.getElementById("eventCategory").value;

    if (!title || !date) {
        alert("Fill all fields");
        return;
    }

    await fetch("/events", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title,
            date,
            category
        })
    });

    closeModal();

    document.getElementById("eventTitle").value = "";

    loadEvents();
}

loadEvents();


function getCategoryLabel(cat) {

    if (cat === "vimportant") return "Very important";
    if (cat === "important") return "Important";
    if (cat === "nimportant") return "Not important";

    return cat;
}


function renderUpcomingEvents() {

    upcomingEventsDiv.innerHTML = "";

    const today = new Date();

    const sortedEvents = events
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

    if (sortedEvents.length === 0) {

        upcomingEventsDiv.innerHTML =
            `<p style="color:#777;">No upcoming events</p>`;

        return;
    }

    sortedEvents.forEach(event => {

        const div = document.createElement("div");

        div.className = "upcoming-event";

        const formattedDate =
            new Date(event.date).toLocaleDateString(
                "en-US",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

        div.innerHTML = `
            <div class="upcoming-date">
                ${formattedDate}
            </div>

            <div class="upcoming-title">
                ${event.title}
            </div>

            <div class="upcoming-category ${event.category}">
                ${getCategoryLabel(event.category)}
            </div>
        `;

        upcomingEventsDiv.appendChild(div);
    });
}



