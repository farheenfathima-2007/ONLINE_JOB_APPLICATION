// ===== JOBTRACK DASHBOARD =====

// Read saved data from Local Storage
function getApplications() {
    try {
        const savedUser =
            sessionStorage.getItem("jobTrackCurrentUser");

        if (!savedUser) {
            return [];
        }

        const user = JSON.parse(savedUser);
        const identifier = user.email || user.id;

        if (!identifier) {
            return [];
        }

        const storageKey =
            "jobTrackApplications_" +
            String(identifier).trim().toLowerCase();

        const data = JSON.parse(
            localStorage.getItem(storageKey) || "[]"
        );

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error loading user applications:", error);
        return [];
    }
}
// Find the logged-in user
function getCurrentUser() {
    const savedUser =
        sessionStorage.getItem("jobTrackCurrentUser");

    if (!savedUser) {
        return null;
    }

    try {
        return JSON.parse(savedUser);
    } catch (error) {
        return null;
    }
}

// Display the user's name
function displayUser() {
    const user = getCurrentUser();

    const nameElement = document.getElementById("userName");
    const welcomeHeading = document.querySelector(".welcome-banner h1");

    if (user) {
        const name =
            user.name ||
            user.fullName ||
            user.fullname ||
            user.email ||
            "User";

        if (nameElement) {
            nameElement.textContent = name;
        }

        if (welcomeHeading) {
            welcomeHeading.textContent = "Welcome back, " + name + "! 👋";
        }
    }
}

// Calculate application statistics
function updateStatistics(applications) {
    const total = applications.length;

    const applied = applications.filter(
        app => app.status === "Applied"
    ).length;

    const interviews = applications.filter(
        app => app.status === "Interview"
    ).length;

    const offers = applications.filter(
        app => app.status === "Offer"
    ).length;

    const rejected = applications.filter(
        app => app.status === "Rejected"
    ).length;

    document.getElementById("totalCount").textContent = total;
    document.getElementById("appliedCount").textContent = applied;
    document.getElementById("interviewCount").textContent = interviews;
    document.getElementById("offerCount").textContent = offers;

    // Calculate progress percentages
    const appliedPercent = total ? (applied / total) * 100 : 0;
    const interviewPercent = total ? (interviews / total) * 100 : 0;
    const offerPercent = total ? (offers / total) * 100 : 0;

    document.getElementById("appliedProgress").style.width =
        appliedPercent + "%";

    document.getElementById("interviewProgress").style.width =
        interviewPercent + "%";

    document.getElementById("offerProgress").style.width =
        offerPercent + "%";

    // Offer rate = offers / total applications
    const offerRate = total ? (offers / total) * 100 : 0;

    document.getElementById("offerRate").textContent =
        offerRate.toFixed(1) + "%";

    // Include rejected applications in the statistics calculation.
    // The four summary cards display the main application stages.
}

// Format a date for display
function formatDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// Display recent applications
function displayRecentApplications(applications) {
    const tableBody = document.getElementById("recentApplications");

    if (!applications.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    No applications yet.
                    <a href="add-application.html">Add your first application</a>.
                </td>
            </tr>
        `;
        return;
    }

    // Show the newest applications first
    const recent = [...applications]
        .sort((a, b) => {
            const dateA = new Date(a.createdAt || a.appliedDate || 0);
            const dateB = new Date(b.createdAt || b.appliedDate || 0);
            return dateB - dateA;
        })
        .slice(0, 5);

    tableBody.innerHTML = recent.map(app => {
        const company = escapeHTML(app.companyName || app.company || "—");
        const position = escapeHTML(app.position || "—");
        const date = formatDate(app.appliedDate || app.applicationDate);
        const status = app.status || "Applied";
        const safeStatus = escapeHTML(status);

        return `
            <tr>
                <td>${company}</td>
                <td>${position}</td>
                <td>${escapeHTML(date)}</td>
                <td>
                    <span class="status-badge status-${status.toLowerCase()}">
                        ${safeStatus}
                    </span>
                </td>
            </tr>
        `;
    }).join("");
}

// Escape text before placing it into HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Display upcoming interviews and follow-ups
function displayReminders(applications) {
    const reminderList = document.getElementById("reminderList");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reminders = [];

    applications.forEach(app => {
        const company = app.companyName || app.company || "Company";

        if (app.interviewDate) {
            reminders.push({
                company,
                type: "Interview",
                date: app.interviewDate
            });
        }

        if (app.followUpDate) {
            reminders.push({
                company,
                type: "Follow-up",
                date: app.followUpDate
            });
        }
    });

    const upcoming = reminders
        .filter(item => {
            const date = new Date(item.date);
            date.setHours(0, 0, 0, 0);
            return !Number.isNaN(date.getTime()) && date >= today;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    if (!upcoming.length) {
        reminderList.innerHTML = `
            <p>No upcoming interviews or follow-ups.</p>
            <p>Add dates to your applications to see reminders here.</p>
        `;
        return;
    }

    reminderList.innerHTML = upcoming.map(item => `
        <div class="reminder-item">
            <strong>${escapeHTML(item.type)} — ${escapeHTML(item.company)}</strong>
            <p>${escapeHTML(formatDate(item.date))}</p>
        </div>
    `).join("");
}

// Logout
function logout() {
    sessionStorage.removeItem("jobTrackCurrentUser");
    window.location.replace("login.html");
}

// Start the dashboard
function loadDashboard() {
    displayUser();

    const applications = getApplications();

    updateStatistics(applications);
    displayRecentApplications(applications);
    displayReminders(applications);
}

// Attach the logout event
const logoutButton = document.getElementById("logoutBtn");

if (logoutButton) {
    logoutButton.addEventListener("click", logout);
}

// Load dashboard data when the page opens
loadDashboard();