const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const upcomingEventsDiv = document.getElementById("upcomingEvents");
document.getElementById("confirmDeleteBtn").onclick = deleteEvent;

let currentDate = new Date();
let events = [];
let eventToDeleteId = null;
let eventToEditId = null;

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

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
                   <span>${escapeHtml(event.title)}</span>

                   <span class="event-actions">
                       <button class="icon-action-btn edit-action" type="button" aria-label="Edit event" title="Edit" onclick="openEditModal('${event.id}')">
                           <svg viewBox="0 0 24 24" aria-hidden="true">
                               <path d="M12 20h9"></path>
                               <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                           </svg>
                       </button>

                       <button class="icon-action-btn delete-action" type="button" aria-label="Delete event" title="Delete" onclick="openDeleteModal('${event.id}')">
                           <svg viewBox="0 0 24 24" aria-hidden="true">
                               <path d="M3 6h18"></path>
                               <path d="M8 6V4h8v2"></path>
                               <path d="M19 6l-1 14H6L5 6"></path>
                               <path d="M10 11v5"></path>
                               <path d="M14 11v5"></path>
                           </svg>
                       </button>
                   </span>
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

function openEditModal(id) {
    const event = events.find(item => item.id === id);

    if (!event) return;

    eventToEditId = id;

    document.getElementById("editEventTitle").value = event.title;
    document.getElementById("editEventDate").value = event.date;
    document.getElementById("editEventCategory").value = event.category;

    document.getElementById("editModal").style.display = "flex";
}

function closeEditModal() {
    eventToEditId = null;
    document.getElementById("editModal").style.display = "none";
}

async function saveEditedEvent() {

    const title =
        document.getElementById("editEventTitle").value;

    const date =
        document.getElementById("editEventDate").value;

    const category =
        document.getElementById("editEventCategory").value;

    if (!title || !date) {
        alert("Fill all fields");
        return;
    }

    await fetch(`/events/${eventToEditId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title,
            date,
            category
        })
    });

    closeEditModal();
    loadEvents();
}

function openDeleteModal(id) {
    eventToDeleteId = id;

    const event = events.find(item => item.id === id);

    document.getElementById("deleteText").innerText =
        `Delete "${event ? event.title : "this event"}"?`;

    document.getElementById("deleteModal").style.display = "flex";
}

function closeDeleteModal() {
    eventToDeleteId = null;
    document.getElementById("deleteModal").style.display = "none";
}

async function deleteEvent() {

    await fetch(`/events/${eventToDeleteId}`, {
        method: "DELETE"
    });

    closeDeleteModal();
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
                ${escapeHtml(event.title)}
            </div>

            <div class="upcoming-category ${event.category}">
                ${getCategoryLabel(event.category)}
            </div>

            <div class="upcoming-actions">
                <button class="icon-action-btn edit-action" type="button" aria-label="Edit event" title="Edit" onclick="openEditModal('${event.id}')">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                    </svg>
                </button>
                <button class="icon-action-btn delete-action" type="button" aria-label="Delete event" title="Delete" onclick="openDeleteModal('${event.id}')">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 6h18"></path>
                        <path d="M8 6V4h8v2"></path>
                        <path d="M19 6l-1 14H6L5 6"></path>
                        <path d="M10 11v5"></path>
                        <path d="M14 11v5"></path>
                    </svg>
                </button>
            </div>
        `;

        upcomingEventsDiv.appendChild(div);
    });
}
