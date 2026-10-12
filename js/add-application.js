// Get the logged-in user's unique storage key
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
            alert("User information is missing. Please log in again.");
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

// ===== JOBTRACK: ADD APPLICATION =====

const applicationForm = document.getElementById("applicationForm");
const formMessage = document.getElementById("formMessage");
const logoutButton = document.getElementById("logoutBtn");

// Read applications saved in Local Storage
function getSavedApplications() {
    const key = getUserApplicationsKey();

    if (!key) {
        return [];
    }

    try {
        const data = JSON.parse(
            localStorage.getItem(key) || "[]"
        );

        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

// Today's date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Set the default application date
document.getElementById("appliedDate").value = getTodayDate();

// Show a message to the user
function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = "add-app-message " + type;
}

// Validate optional URLs
function isValidOptionalUrl(value) {
    if (!value) {
        return true;
    }

    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch (error) {
        return false;
    }
}

// Save a new application
applicationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const companyName =
        document.getElementById("companyName").value.trim();

    const position =
        document.getElementById("position").value.trim();

    const jobUrl =
        document.getElementById("jobUrl").value.trim();

    if (!companyName || !position) {
        showFormMessage(
            "Please enter the company name and job position.",
            "error"
        );
        return;
    }

    if (!isValidOptionalUrl(jobUrl)) {
        showFormMessage(
            "Please enter a valid job posting URL starting with http:// or https://.",
            "error"
        );
        return;
    }

    const application = {
        id: (window.crypto && crypto.randomUUID)
            ? crypto.randomUUID()
            : String(Date.now()) + Math.random().toString(16).slice(2),

        companyName: companyName,
        position: position,
        location: document.getElementById("location").value.trim(),
        jobType: document.getElementById("jobType").value,
        appliedDate: document.getElementById("appliedDate").value,
        status: document.getElementById("status").value,
        interviewDate: document.getElementById("interviewDate").value,
        followUpDate: document.getElementById("followUpDate").value,
        jobUrl: jobUrl,
        description: document.getElementById("description").value.trim(),
        createdAt: new Date().toISOString()
    };

    try {
        const applications = getSavedApplications();

        applications.push(application);

       const key = getUserApplicationsKey();

        if (!key) {
            return;
        }

        localStorage.setItem(
            key,
            JSON.stringify(applications)
        );

        showFormMessage(
            "Application saved successfully! Returning to your dashboard...",
            "success"
        );

        applicationForm.reset();

        // Restore today's date after resetting
        document.getElementById("appliedDate").value = getTodayDate();

        // Return to the dashboard after a successful save
        window.location.href = "dashboard.html";

    } catch (error) {
        showFormMessage(
            "Unable to save the application. Please check your browser's Local Storage settings.",
            "error"
        );
    }
});

// Clear old messages when the form is reset
applicationForm.addEventListener("reset", function () {
    formMessage.textContent = "";
    formMessage.className = "add-app-message";
});

// Logout
if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        sessionStorage.removeItem("jobTrackCurrentUser");
        window.location.replace("login.html");
    });
}