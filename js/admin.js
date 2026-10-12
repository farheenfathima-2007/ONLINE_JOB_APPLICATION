// ==============================
// JOBTRACK ADMIN DASHBOARD
// ==============================

// Registered users are stored here by the signup page.
const usersTableBody = document.getElementById("usersTableBody");
const totalUsersElement = document.getElementById("totalUsers");
const totalApplicationsElement = document.getElementById("totalApplications");
const activeUsersElement = document.getElementById("activeUsers");
const userSearch = document.getElementById("userSearch");
const adminMessage = document.getElementById("adminMessage");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");

// Read registered users from Local Storage.
function getRegisteredUsers() {
    try {
        const savedUsers = JSON.parse(
            localStorage.getItem("jobTrackUsers") || "[]"
        );

        return Array.isArray(savedUsers) ? savedUsers : [];
    } catch (error) {
        console.error("Could not read registered users:", error);
        return [];
    }
}

// Count applications belonging to a particular user.
function getApplicationCount(user) {
    const identifier = user.email || user.id;

    if (!identifier) {
        return 0;
    }

    const storageKey =
        "jobTrackApplications_" +
        String(identifier).trim().toLowerCase();

    try {
        const savedApplications = JSON.parse(
            localStorage.getItem(storageKey) || "[]"
        );

        return Array.isArray(savedApplications)
            ? savedApplications.length
            : 0;
    } catch (error) {
        console.error("Could not read applications:", error);
        return 0;
    }
}

// Safely create a table cell.
function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    return cell;
}

// Display the registered users.
function renderUsers(searchText = "") {
    const users = getRegisteredUsers();
    const search = searchText.trim().toLowerCase();

    usersTableBody.replaceChildren();

    const filteredUsers = users.filter(function (user) {
        const name = String(
            user.name || user.fullName || user.username || ""
        ).toLowerCase();

        const email = String(user.email || "").toLowerCase();

        return name.includes(search) || email.includes(search);
    });

    if (users.length === 0) {
        const row = document.createElement("tr");
        const cell = createCell(
            "No registered users found in Local Storage."
        );

        cell.colSpan = 3;
        row.appendChild(cell);
        usersTableBody.appendChild(row);

        adminMessage.textContent =
            "Check that your signup page saves users under jobTrackUsers.";

        return;
    }

    if (filteredUsers.length === 0) {
        const row = document.createElement("tr");
        const cell = createCell("No users match your search.");

        cell.colSpan = 3;
        row.appendChild(cell);
        usersTableBody.appendChild(row);
        adminMessage.textContent = "";
        return;
    }

    filteredUsers.forEach(function (user) {
        const row = document.createElement("tr");

        const name =
            user.name || user.fullName || user.username || "Not provided";

        const email = user.email || "Not provided";
        const applicationCount = getApplicationCount(user);

        row.appendChild(createCell(name));
        row.appendChild(createCell(email));
        row.appendChild(createCell(applicationCount));

        usersTableBody.appendChild(row);
    });

    adminMessage.textContent =
        "Showing " + filteredUsers.length + " of " +
        users.length + " registered users.";
}

// Update the summary figures.
function updateAdminStats() {
    const users = getRegisteredUsers();

    let applicationTotal = 0;
    let usersWithApplications = 0;

    users.forEach(function (user) {
        const count = getApplicationCount(user);

        applicationTotal += count;

        if (count > 0) {
            usersWithApplications++;
        }
    });

    totalUsersElement.textContent = users.length;
    totalApplicationsElement.textContent = applicationTotal;
    activeUsersElement.textContent = usersWithApplications;
}

// Search when the user types.
userSearch.addEventListener("input", function () {
    renderUsers(userSearch.value);
});

// Log out and return to the login page.
adminLogoutBtn.addEventListener("click", function () {
    sessionStorage.removeItem("jobTrackCurrentUser");
    window.location.href = "login.html";
});

// Initialize the page.
updateAdminStats();
renderUsers();