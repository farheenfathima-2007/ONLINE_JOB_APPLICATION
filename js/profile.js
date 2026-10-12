/* ===== JOBTRACK PROFILE ===== */

function getCurrentProfileUser() {
    const savedUser = sessionStorage.getItem("jobTrackCurrentUser");

    if (!savedUser) {
        window.location.replace("login.html");
        return null;
    }

    try {
        return JSON.parse(savedUser);
    } catch (error) {
        window.location.replace("login.html");
        return null;
    }
}

function getRegisteredUsers() {
    try {
        const users = JSON.parse(localStorage.getItem("jobTrackUsers") || "[]");
        return Array.isArray(users) ? users : [];
    } catch (error) {
        return [];
    }
}

function saveRegisteredUsers(users) {
    localStorage.setItem("jobTrackUsers", JSON.stringify(users));
}

function loadProfile() {
    const user = getCurrentProfileUser();

    if (!user) return;

    const nameInput = document.getElementById("profileName");
    const emailInput = document.getElementById("profileEmail");
    const displayName = document.getElementById("profileDisplayName");
    const displayEmail = document.getElementById("profileDisplayEmail");
    const avatar = document.getElementById("profileAvatar");

    const name = user.name || user.fullName || user.username || "";
    const email = user.email || "";

    nameInput.value = name;
    emailInput.value = email;
    displayName.textContent = name || "JobTrack User";
    displayEmail.textContent = email;
    avatar.textContent = (name || "U").trim().charAt(0).toUpperCase();
}

function updateProfile(event) {
    event.preventDefault();

    const user = getCurrentProfileUser();

    if (!user) return;

    const nameInput = document.getElementById("profileName");
    const message = document.getElementById("profileMessage");
    const newName = nameInput.value.trim();

    if (!newName) {
        message.textContent = "Please enter your full name.";
        return;
    }

    const email = String(user.email || "").trim().toLowerCase();
    const users = getRegisteredUsers();

    const userIndex = users.findIndex(
        registeredUser =>
            String(registeredUser.email || "").trim().toLowerCase() === email
    );

    // Update the registered account if it exists.
    if (userIndex !== -1) {
        const registeredUser = users[userIndex];

        if ("name" in registeredUser) {
            registeredUser.name = newName;
        } else if ("fullName" in registeredUser) {
            registeredUser.fullName = newName;
        } else if ("username" in registeredUser) {
            registeredUser.username = newName;
        } else {
            registeredUser.name = newName;
        }

        saveRegisteredUsers(users);
    }

    // Update the current session.
    if ("name" in user || (!("fullName" in user) && !("username" in user))) {
        user.name = newName;
    } else if ("fullName" in user) {
        user.fullName = newName;
    } else {
        user.username = newName;
    }

    sessionStorage.setItem("jobTrackCurrentUser", JSON.stringify(user));

    document.getElementById("profileDisplayName").textContent = newName;
    document.getElementById("profileAvatar").textContent =
        newName.charAt(0).toUpperCase();

    message.textContent = "Profile name updated successfully.";
}

function setupProfileLogout() {
    const logoutButton = document.getElementById("logoutBtn");

    if (!logoutButton) return;

    logoutButton.addEventListener("click", function () {
        sessionStorage.removeItem("jobTrackCurrentUser");
        window.location.href = "login.html";
    });
}

document.addEventListener("DOMContentLoaded", function () {
    loadProfile();

    document.getElementById("profileForm").addEventListener(
        "submit",
        updateProfile
    );

    setupProfileLogout();
});