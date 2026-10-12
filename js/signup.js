const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("message");

    message.textContent = "";
    message.className = "form-message";

    if (name.length < 2) {
        showMessage("Please enter your full name.", "error");
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Passwords do not match.", "error");
        return;
    }

    let users;

    try {
        users = JSON.parse(localStorage.getItem("jobTrackUsers") || "[]");

        if (!Array.isArray(users)) {
            throw new Error("Invalid user data");
        }
    } catch (error) {
        showMessage("Unable to read saved accounts.", "error");
        return;
    }

    const existingUser = users.find(function (user) {
        return user.email === email;
    });

    if (existingUser) {
        showMessage(
            "This email is already registered. Please log in.",
            "error"
        );
        return;
    }

    users.push({
        name: name,
        email: email,
        password: password
    });

    try {
        localStorage.setItem("jobTrackUsers", JSON.stringify(users));
    } catch (error) {
        showMessage("Unable to save your account.", "error");
        return;
    }

    showMessage("Account created successfully!", "success");

    signupForm.reset();

    setTimeout(function () {
        window.location.href = "login.html";
    }, 1000);
});

function showMessage(text, type) {
    const message = document.getElementById("message");
    message.textContent = text;
    message.className = "form-message " + type;
}