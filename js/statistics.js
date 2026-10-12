// ===== JOBTRACK STATISTICS =====

let statusChartInstance = null;
let timelineChartInstance = null;

// Get the current user's application storage key
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

// Read the logged-in user's applications
function getApplications() {
    const key = getUserApplicationsKey();

    if (!key) return [];

    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Could not read applications:", error);
        return [];
    }
}

// Safely convert a date into a Date object
function parseApplicationDate(value) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

// Format percentages
function percentage(part, total) {
    return total ? Math.round((part / total) * 100) : 0;
}

// Count application statuses
function getStatusCounts(applications) {
    const counts = {
        Applied: 0,
        Interview: 0,
        Offer: 0,
        Rejected: 0
    };

    applications.forEach(application => {
        const status = String(application.status || "")
            .trim()
            .toLowerCase();

        if (status === "applied") counts.Applied++;
        else if (status === "interview") counts.Interview++;
        else if (status === "offer" || status === "offered") {
            counts.Offer++;
        }
        else if (status === "rejected") counts.Rejected++;
    });

    return counts;
}

// Create the application status doughnut chart
function renderStatusChart(applications) {
    const canvas = document.getElementById("statusChart");
    const message = document.getElementById("statusAnalysis");

    if (!canvas || !message || typeof Chart === "undefined") {
        if (message) {
            message.textContent =
                "Charts could not load. Check your internet connection and refresh.";
        }
        return;
    }

    const counts = getStatusCounts(applications);
    const total = applications.length;

    if (statusChartInstance) {
        statusChartInstance.destroy();
    }

    statusChartInstance = new Chart(canvas, {
        type: "doughnut",

        data: {
            labels: ["Applied", "Interview", "Offers", "Rejected"],

            datasets: [{
                data: [
                    counts.Applied,
                    counts.Interview,
                    counts.Offer,
                    counts.Rejected
                ],
                backgroundColor: [
                    "#8B78DC",
                    "#63A9DF",
                    "#57B99A",
                    "#E89AAB"
                ],
                borderColor: "#FFFFFF",
                borderWidth: 4,
                hoverOffset: 8
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",

            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        padding: 18,
                        usePointStyle: true
                    }
                },

                tooltip: {
                    callbacks: {
                        label(context) {
                            const value = context.raw;
                            return `${context.label}: ${value} (${percentage(value, total)}%)`;
                        }
                    }
                }
            }
        }
    });

    if (total === 0) {
        message.textContent =
            "No applications yet. Add your first application to begin tracking your job search.";
        return;
    }

    const interviewRate = percentage(counts.Interview, total);
    const offerRate = percentage(counts.Offer, total);

    message.textContent =
        `You have ${total} application(s). ` +
        `${interviewRate}% have reached the interview stage, and ` +
        `${offerRate}% have resulted in offers.`;
}

// Create a bar chart of applications submitted by month
function renderTimelineChart(applications) {
    const canvas = document.getElementById("timelineChart");
    const message = document.getElementById("timelineAnalysis");

    if (!canvas || !message || typeof Chart === "undefined") {
        return;
    }

    if (timelineChartInstance) {
        timelineChartInstance.destroy();
    }

    const monthlyCounts = new Map();

    // Show the latest six months, including months with zero applications
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key =
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        months.push({
            key,
            label: date.toLocaleDateString("en-IN", {
                month: "short",
                year: "2-digit"
            })
        });

        monthlyCounts.set(key, 0);
    }

    let undatedCount = 0;

    applications.forEach(application => {
        const date = parseApplicationDate(
            application.appliedDate || application.applicationDate
        );

        if (!date) {
            undatedCount++;
            return;
        }

        const key =
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (monthlyCounts.has(key)) {
            monthlyCounts.set(key, monthlyCounts.get(key) + 1);
        }
    });

    const values = months.map(month => monthlyCounts.get(month.key));

    timelineChartInstance = new Chart(canvas, {
        type: "bar",

        data: {
            labels: months.map(month => month.label),

            datasets: [{
                label: "Applications submitted",
                data: values,
                backgroundColor: "#9A88E8",
                hoverBackgroundColor: "#7763CF",
                borderRadius: 8,
                maxBarThickness: 42
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label(context) {
                            return `${context.raw} application(s)`;
                        }
                    }
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },
                    grid: {
                        color: "#EEEAF6"
                    },
                    title: {
                        display: true,
                        text: "Number of applications"
                    }
                },

                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    const currentMonthCount = values[values.length - 1];
    const previousMonthCount = values[values.length - 2];

    let trend = "Your application activity is unchanged from last month.";

    if (currentMonthCount > previousMonthCount) {
        trend = "Your application activity has increased compared with last month.";
    } else if (currentMonthCount < previousMonthCount) {
        trend = "Your application activity has decreased compared with last month.";
    }

    message.textContent = applications.length === 0
        ? "Your monthly trend will appear after you add applications."
        : `${trend} This month: ${currentMonthCount} application(s).` +
          (undatedCount
              ? ` ${undatedCount} application(s) have no valid application date.`
              : "");
}

// Generate observations from actual application data
function renderCareerInsights(applications) {
    const container = document.getElementById("careerInsights");

    if (!container) return;

    container.replaceChildren();

    if (applications.length === 0) {
        const item = document.createElement("div");
        item.className = "insight-item";

        const heading = document.createElement("h3");
        heading.textContent = "Start your job search";

        const paragraph = document.createElement("p");
        paragraph.textContent =
            "Add applications to see your interview rate, offer rate, and other career insights.";

        item.append(heading, paragraph);
        container.appendChild(item);
        return;
    }

    const counts = getStatusCounts(applications);
    const total = applications.length;

    const insights = [
        {
            title: "Interview conversion",
            text: `${percentage(counts.Interview, total)}% of your recorded applications are currently marked Interview.`
        },
        {
            title: "Offer rate",
            text: `${percentage(counts.Offer, total)}% of your recorded applications are currently marked Offer.`
        },
        {
            title: "Most common status",
            text: getMostCommonStatus(counts)
        },
        {
            title: "Follow-up reminders",
            text: getFollowUpInsight(applications)
        }
    ];

    insights.forEach(insight => {
        const item = document.createElement("div");
        item.className = "insight-item";

        const heading = document.createElement("h3");
        heading.textContent = insight.title;

        const paragraph = document.createElement("p");
        paragraph.textContent = insight.text;

        item.append(heading, paragraph);
        container.appendChild(item);
    });
}

function getMostCommonStatus(counts) {
    const entries = Object.entries(counts);
    const max = Math.max(...entries.map(entry => entry[1]));

    if (max === 0) {
        return "No recognized application statuses found yet.";
    }

    const common = entries
        .filter(entry => entry[1] === max)
        .map(entry => entry[0]);

    if (common.length > 1) {
        return `Your applications are tied across: ${common.join(", ")}.`;
    }

    return `${common[0]} is your most common status (${max} application(s)).`;
}

function getFollowUpInsight(applications) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let upcoming = 0;
    let overdue = 0;

    applications.forEach(application => {
        const date = parseApplicationDate(application.followUpDate);

        if (!date) return;

        date.setHours(0, 0, 0, 0);

        if (date.getTime() < today.getTime()) {
            overdue++;
        } else {
            upcoming++;
        }
    });

    return `${upcoming} upcoming follow-up(s) and ${overdue} past-due follow-up(s) recorded.`;
}

// Logout
function setupLogout() {
    const button = document.getElementById("logoutBtn");

    if (!button) return;

    button.addEventListener("click", function () {
        sessionStorage.removeItem("jobTrackCurrentUser");
        window.location.href = "login.html";
    });
}

// Initialize statistics page
function initializeStatistics() {
    if (typeof Chart === "undefined") {
        const message = document.getElementById("statusAnalysis");

        if (message) {
            message.textContent =
                "Chart.js did not load. Check your internet connection and refresh the page.";
        }

        return;
    }

    const applications = getApplications();

    renderStatusChart(applications);
    renderTimelineChart(applications);
    renderCareerInsights(applications);
    setupLogout();
}

document.addEventListener("DOMContentLoaded", initializeStatistics);