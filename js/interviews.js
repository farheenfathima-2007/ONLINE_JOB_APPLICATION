// ===== JOBTRACK INTERVIEWS & FOLLOW-UPS =====

// Get the logged-in user's storage key
function getUserApplicationsKey() {
    const savedUser = sessionStorage.getItem("jobTrackCurrentUser");

    if (!savedUser) {
        window.location.replace("login.html");
        return null;
    }

    try {
        const user = JSON.parse(savedUser);
        const identifier = user.email || user.id;

        if (!identifier) {
            window.location.replace("login.html");
            return null;
        }

        return "jobTrackApplications_" +
            String(identifier).trim().toLowerCase();

    } catch (error) {
        window.location.replace("login.html");
        return null;
    }
}

// Load applications belonging to the logged-in user
function getApplications() {
    const key = getUserApplicationsKey();

    if (!key) return [];

    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Could not load applications:", error);
        return [];
    }
}

// Parse a saved date safely
function parseDate(value) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    date.setHours(0, 0, 0, 0);
    return date;
}

// Format dates for display
function formatDate(value) {
    const date = parseDate(value);

    if (!date) return "Date not available";

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// Create text safely
function createTextElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    element.textContent = text;

    return element;
}

// Render a reminder card
function createReminderCard(application, type, dateValue) {
    const card = document.createElement("article");
    card.className = "interview-item";

    const date = parseDate(dateValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date && date < today) {
        card.classList.add("overdue");
    }

    const company = application.companyName || "Company not specified";
    const position = application.position || "Position not specified";

    card.appendChild(
        createTextElement("h3", "", company)
    );

    card.appendChild(
        createTextElement("p", "", "Position: " + position)
    );

    card.appendChild(
        createTextElement(
            "p",
            "interview-date",
            type + ": " + formatDate(dateValue)
        )
    );

    if (type === "Interview") {
        card.appendChild(
            createTextElement(
                "p",
                "",
                "Application status: " +
                (application.status || "Not specified")
            )
        );
    }

    if (date && date < today) {
        card.appendChild(
            createTextElement(
                "p",
                "",
                "This date has passed. Check whether action is still needed."
            )
        );
    }

    return card;
}

// Render cards or an empty message
function renderReminderList(containerId, items, type, dateField) {
    const container = document.getElementById(containerId);

    if (!container) return;

    container.replaceChildren();

    if (items.length === 0) {
        const message = type === "Interview"
            ? "No interview dates recorded yet. Add an interview date to an application to see it here."
            : "No follow-up dates recorded yet. Add a follow-up date to an application to see it here.";

        container.appendChild(
            createTextElement("div", "interviews-empty", message)
        );

        return;
    }

    items.sort((a, b) => {
        const dateA = parseDate(a[dateField]);
        const dateB = parseDate(b[dateField]);

        return (dateA ? dateA.getTime() : Infinity) -
               (dateB ? dateB.getTime() : Infinity);
    });

    items.forEach(application => {
        container.appendChild(
            createReminderCard(
                application,
                type,
                application[dateField]
            )
        );
    });
}

// Load interview dates and follow-up dates
function renderInterviewsPage() {
    const applications = getApplications();

    const interviews = applications.filter(application =>
        application.interviewDate &&
        parseDate(application.interviewDate)
    );

    const followUps = applications.filter(application =>
        application.followUpDate &&
        parseDate(application.followUpDate)
    );

    renderReminderList(
        "upcomingInterviews",
        interviews,
        "Interview",
        "interviewDate"
    );

    renderReminderList(
        "followUpReminders",
        followUps,
        "Follow-up",
        "followUpDate"
    );

    const message = document.getElementById("interviewsMessage");

    if (message) {
        message.textContent =
            `${interviews.length} interview date(s) and ` +
            `${followUps.length} follow-up date(s) found in your applications.`;
    }
}

// Logout
function setupInterviewsLogout() {
    const button = document.getElementById("logoutBtn");

    if (!button) return;

    button.addEventListener("click", function () {
        sessionStorage.removeItem("jobTrackCurrentUser");
        window.location.href = "login.html";
    });
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
    renderInterviewsPage();
    setupInterviewsLogout();
});