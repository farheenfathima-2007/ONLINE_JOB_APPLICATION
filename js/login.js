const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email")
        .value.trim().toLowerCase();

    const password = document.getElementById("password").value;

    const message = document.getElementById("message");

    message.textContent = "";
    message.className = "form-message";

    let users;

    try {
        users = JSON.parse(
            localStorage.getItem("jobTrackUsers") || "[]"
        );

        if (!Array.isArray(users)) {
            throw new Error("Invalid user data");
        }
    } catch (error) {
        showMessage("Unable to read saved accounts.", "error");
        return;
    }

    const user = users.find(function (account) {
        return account.email === email &&
               account.password === password;
    });

    if (!user) {
        showMessage(
            "Incorrect email or password. Please try again.",
            "error"
        );
        return;
    }

    try {
        sessionStorage.setItem(
            "jobTrackCurrentUser",
            JSON.stringify({
                name: user.name,
                email: user.email
            })
        );
    } catch (error) {
        showMessage("Unable to start your session.", "error");
        return;
    }

    showMessage("Login successful!", "success");

    setTimeout(function () {
        window.location.href = "dashboard.html";
    }, 700);
});

function showMessage(text, type) {
    const message = document.getElementById("message");

    message.textContent = text;
    message.className = "form-message " + type;
}