// Check whether a user is logged in
function requireLogin() {
    const currentUser = sessionStorage.getItem("jobTrackCurrentUser");

    if (!currentUser) {
        window.location.replace("login.html");
        return false;
    }

    try {
        const user = JSON.parse(currentUser);

        if (!user || !user.email) {
            sessionStorage.removeItem("jobTrackCurrentUser");
            window.location.replace("login.html");
            return false;
        }

        return true;
    } catch (error) {
        sessionStorage.removeItem("jobTrackCurrentUser");
        window.location.replace("login.html");
        return false;
    }
}

// Log out the current user
function logoutUser() {
    sessionStorage.removeItem("jobTrackCurrentUser");
    window.location.replace("login.html");
}