function getUserApplicationsKey() {
    const savedUser =
        sessionStorage.getItem("jobTrackCurrentUser");

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


// ===== JOBTRACK: MY APPLICATIONS =====

const tableBody = document.getElementById("applicationsTableBody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const tableWrapper = document.getElementById("tableWrapper");
const emptyState = document.getElementById("emptyState");
const emptyTitle = document.getElementById("emptyTitle");
const emptyDescription = document.getElementById("emptyDescription");
const resultsText = document.getElementById("resultsText");
const pageMessage = document.getElementById("pageMessage");
const logoutButton = document.getElementById("logoutBtn");

const editDialog = document.getElementById("editDialog");
const editForm = document.getElementById("editForm");


// Read applications
function getApplications() {
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

// Save applications
function saveApplications(applications) {
    const key = getUserApplicationsKey();

    if (!key) {
        return;
    }

    localStorage.setItem(key, JSON.stringify(applications));
}

// Escape values before displaying them as HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Format dates
function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// Update summary counts
function updateSummary(applications) {
    const totalElement = document.getElementById("myTotalCount");
    const appliedElement = document.getElementById("myAppliedCount");
    const interviewElement = document.getElementById("myInterviewCount");
    const offerElement = document.getElementById("myOfferCount");

    // Update summary cards only if they exist on the page
    if (totalElement) {
        totalElement.textContent = applications.length;
    }

    if (appliedElement) {
        appliedElement.textContent =
            applications.filter(app => app.status === "Applied").length;
    }

    if (interviewElement) {
        interviewElement.textContent =
            applications.filter(app => app.status === "Interview").length;
    }

    if (offerElement) {
        offerElement.textContent =
            applications.filter(app => app.status === "Offer").length;
    }
}

// Display a message
function showMessage(message) {
    pageMessage.textContent = message;
}

// Render application rows
function renderApplications() {
    const applications = getApplications();

    updateSummary(applications);

    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;

    const filtered = applications.filter(app => {
        const company = String(
            app.companyName || app.company || ""
        ).toLowerCase();

        const position = String(app.position || "").toLowerCase();

        const matchesSearch =
            company.includes(searchTerm) ||
            position.includes(searchTerm);

        const matchesStatus =
            selectedStatus === "All" ||
            (app.status || "Applied") === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    resultsText.textContent =
        `Showing ${filtered.length} of ${applications.length} applications`;

    if (filtered.length === 0) {
        tableWrapper.hidden = true;
        emptyState.hidden = false;

        if (applications.length === 0) {
            emptyTitle.textContent = "No applications yet";
            emptyDescription.textContent =
                "Add your first job application to get started.";
        } else {
            emptyTitle.textContent = "No matching applications";
            emptyDescription.textContent =
                "Try a different search term or status filter.";
        }

        tableBody.innerHTML = "";
        return;
    }

    emptyState.hidden = true;
    tableWrapper.hidden = false;

    tableBody.innerHTML = filtered.map(app => {
        const id = escapeHTML(app.id);
        const company = escapeHTML(
            app.companyName || app.company || "—"
        );
        const position = escapeHTML(app.position || "—");
        const appliedDate = escapeHTML(
            formatDate(app.appliedDate || app.applicationDate)
        );
        const interviewDate = escapeHTML(
            formatDate(app.interviewDate)
        );

        const status = app.status || "Applied";
        const statusClass = {
            Applied: "applied",
            Interview: "interview",
            Offer: "offer",
            Rejected: "rejected"
        }[status] || "applied";

        return `
            <tr>
                <td>
                    <span class="my-app-company">${company}</span>
                </td>
                <td>${position}</td>
                <td>${appliedDate}</td>
                <td>
                    <span class="my-app-status ${statusClass}">
                        ${escapeHTML(status)}
                    </span>
                </td>
                <td>${interviewDate}</td>
                <td>
                    <div class="my-app-row-actions">
                        <button type="button"
                            data-action="edit"
                            data-id="${id}">
                            Edit
                        </button>

                        <button type="button"
                            class="delete-btn"
                            data-action="delete"
                            data-id="${id}">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// Open the edit dialog
function openEditDialog(id) {
    const application = getApplications().find(
        app => String(app.id) === id
    );

    if (!application) {
        showMessage("Application not found. Refresh and try again.");
        return;
    }

    document.getElementById("editId").value = application.id;
    document.getElementById("editCompany").value =
        application.companyName || application.company || "";

    document.getElementById("editPosition").value =
        application.position || "";

    document.getElementById("editAppliedDate").value =
        application.appliedDate || application.applicationDate || "";

    document.getElementById("editStatus").value =
        application.status || "Applied";

    document.getElementById("editInterviewDate").value =
        application.interviewDate || "";

    document.getElementById("editFollowUpDate").value =
        application.followUpDate || "";

    editDialog.showModal();
}

// Handle Edit and Delete clicks
tableBody.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const id = button.dataset.id;

    if (button.dataset.action === "edit") {
        openEditDialog(id);
        return;
    }

    if (button.dataset.action === "delete") {
        const applications = getApplications();
        const application = applications.find(
            app => String(app.id) === id
        );

        if (!application) {
            showMessage("Application not found.");
            return;
        }

        const confirmed = window.confirm(
            `Delete the application for ${
                application.companyName || application.company || "this company"
            }?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const updated = applications.filter(
                app => String(app.id) !== id
            );

            saveApplications(updated);
            showMessage("Application deleted successfully.");
            renderApplications();
        } catch (error) {
            showMessage("Unable to delete this application.");
        }
    }
});

// Save edited details
editForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const id = document.getElementById("editId").value;
    const companyName =
        document.getElementById("editCompany").value.trim();
    const position =
        document.getElementById("editPosition").value.trim();

    if (!companyName || !position) {
        showMessage("Company name and position are required.");
        return;
    }

    try {
        const applications = getApplications();
        const index = applications.findIndex(
            app => String(app.id) === id
        );

        if (index === -1) {
            showMessage("Application not found.");
            editDialog.close();
            return;
        }

        applications[index] = {
            ...applications[index],
            companyName,
            position,
            appliedDate:
                document.getElementById("editAppliedDate").value,
            status:
                document.getElementById("editStatus").value,
            interviewDate:
                document.getElementById("editInterviewDate").value,
            followUpDate:
                document.getElementById("editFollowUpDate").value
        };

        saveApplications(applications);
        editDialog.close();
        showMessage("Application updated successfully.");
        renderApplications();
    } catch (error) {
        showMessage("Unable to save changes.");
    }
});

// Cancel editing
document.getElementById("cancelEdit").addEventListener(
    "click",
    function () {
        editDialog.close();
    }
);

// Search and filter
searchInput.addEventListener("input", renderApplications);
statusFilter.addEventListener("change", renderApplications);

// Logout
if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        sessionStorage.removeItem("jobTrackCurrentUser");
        window.location.replace("login.html");
    });
}

// Initial load
renderApplications();