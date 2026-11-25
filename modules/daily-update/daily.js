// daily-update module

let form = document.querySelector("#updateForm");
let inpName = document.querySelector("#inpName");
let inpDate = document.querySelector("#inpDate");
let description = document.querySelector("#description");
let blocked = document.querySelector("#blocked");
let subBtn = document.querySelector("#subBtn");

let updatesList = document.querySelector("#updatesList");
let updateCount = document.querySelector("#updateCount");
let emptyState = document.querySelector("#emptyState");

const API_URL = "https://fresher-hub-api-cloudus.onrender.com/updates";

fetch('../../header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-bar').innerHTML = data;
    });

// Set today's date by default
// Today's date in the user's LOCAL timezone (YYYY-MM-DD)
function getTodayLocal() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Set today's date by default
inpDate.value = getTodayLocal();

// Update header counter + empty state visibility
function setSummary(total) {
    updateCount.textContent = `${total} ${total === 1 ? "Update" : "Updates"}`;
    emptyState.classList.toggle("hidden", total > 0);
}

// Fetch all updates
async function getUpdates() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch updates");
        }

        const data = await response.json();

        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        displayUpdates(data);
    }
    catch (error) {
        console.log("Error fetching data:", error);

        setSummary(0);
        emptyState.classList.add("hidden");

        updatesList.innerHTML = `
            <div class="flex min-h-[260px] flex-col items-center justify-center text-center">
                <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                    ⚠️
                </div>
                <h3 class="text-sm font-bold text-red-600">
                    Unable to load updates
                </h3>
                <p class="mt-2 text-xs text-slate-400">
                    Please check your server connection and try again.
                </p>
            </div>
        `;
    }
}

// Delete daily update
async function deleteUpdate(id) {

    const confirmDelete = confirm("Are you sure you want to delete this update?");

    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete update");
        }

        alert("Update deleted successfully!");

        // Refresh the data after deletion
        await getUpdates();

    }
    catch (error) {
        console.log("Error deleting update:", error);
        alert("Unable to delete update. Please try again.");
    }
}

// Display updates
function displayUpdates(data) {

    updatesList.innerHTML = "";

    // Empty state (uses the static #emptyState block in the HTML)
    if (!data || data.length === 0) {
        setSummary(0);
        return;
    }

    setSummary(data.length);

    // Group updates by date
    let groupedUpdates = {};

    data.forEach((item) => {

        if (!groupedUpdates[item.date]) {
            groupedUpdates[item.date] = [];
        }

        groupedUpdates[item.date].push(item);

    });

    // Sort dates newest first
    let dates = Object.keys(groupedUpdates).sort(
        (a, b) => new Date(b) - new Date(a)
    );

    // Display each date group
    dates.forEach((date) => {

        // Main date container
        const dateDiv = document.createElement("div");

        dateDiv.className = "mb-7 last:mb-0";

        // Format date
        const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

        // Date heading section
        const dateHeader = document.createElement("div");

        dateHeader.className = "mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3";

        const heading = document.createElement("h3");

        heading.className = "flex items-center gap-2 text-sm font-bold text-slate-800";

        heading.innerHTML = `
            <span class="h-2.5 w-2.5 rounded-full bg-indigo-600"></span>
            ${formattedDate}
        `;

        const count = document.createElement("span");

        count.className = "rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100";

        count.textContent =
            `${groupedUpdates[date].length} ${groupedUpdates[date].length === 1 ? "Update" : "Updates"}`;

        dateHeader.append(heading, count);

        dateDiv.appendChild(dateHeader);

        // Display individual update cards
        groupedUpdates[date].forEach((item) => {

            // Main card
            const card = document.createElement("div");

            card.className = "mb-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm";

            // Top section
            const topSection = document.createElement("div");

            topSection.className = "mb-4 flex items-center gap-3";

            // Profile
            const profile = document.createElement("div");

            profile.className = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold uppercase text-indigo-700";

            profile.textContent = (item.name || "U").trim().charAt(0).toUpperCase();

            // User information
            const userInfo = document.createElement("div");

            userInfo.className = "min-w-0 flex-1";

            const name = document.createElement("h4");

            name.className = "truncate text-sm font-bold text-slate-900";

            name.textContent = item.name || "Unknown User";

            const subtitle = document.createElement("p");

            subtitle.className = "mt-0.5 text-xs text-slate-400";

            subtitle.textContent = "Daily Activity Report";

            userInfo.append(name, subtitle);

            // Status
            const status = document.createElement("span");

            status.className = "shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100";

            status.textContent = "Submitted";

            topSection.append(profile, userInfo, status);

            // Work description section
            const workSection = document.createElement("div");

            workSection.className = "mb-4";

            const workLabel = document.createElement("h5");

            workLabel.className = "mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500";

            workLabel.textContent = "✓ Work Completed";

            const work = document.createElement("p");

            work.className = "whitespace-pre-wrap break-words text-sm leading-6 text-slate-600";

            work.textContent = item.description || "No work description provided.";

            workSection.append(workLabel, work);

            // Blocker section
            const blockerSection = document.createElement("div");

            blockerSection.className = "rounded-lg border p-3";

            const blocker = document.createElement("p");

            blocker.className = "break-words text-sm leading-6";

            const blockerLabel = document.createElement("h5");

            blockerLabel.className = "mb-1 text-xs font-bold uppercase tracking-wider";

            // Treat empty or "nothing" as no blocker
            const blockedText = (item.blocked || "").trim();
            const hasBlocker = blockedText !== "" && blockedText.toLowerCase() !== "nothing";

            if (hasBlocker) {

                blockerSection.classList.add("border-amber-200", "bg-amber-50");

                blockerLabel.classList.add("text-amber-700");

                blockerLabel.textContent = "⚠ Blocked On";

                blocker.classList.add("text-amber-900");

                blocker.textContent = blockedText;

            }
            else {

                blockerSection.classList.add("border-emerald-100", "bg-emerald-50");

                blockerLabel.classList.add("text-emerald-700");

                blockerLabel.textContent = "✓ Blockers";

                blocker.classList.add("text-emerald-800");

                blocker.textContent = "No blockers reported";
            }

            blockerSection.append(blockerLabel, blocker);

            // Delete button
            const deleteBtn = document.createElement("button");

            deleteBtn.type = "button";

            deleteBtn.className = `
                mt-4 flex items-center justify-center gap-2
                rounded-lg border border-red-200
                bg-red-50 px-4 py-2
                text-sm font-semibold text-red-600
                transition hover:bg-red-100
            `;

            deleteBtn.innerHTML = `
                <span>🗑</span>
                <span>Delete Update</span>
            `;

            deleteBtn.addEventListener("click", () => {
            deleteUpdate(item.id);
            });

            // Add all sections to card
            card.append(topSection, workSection, blockerSection, deleteBtn);

            dateDiv.appendChild(card);

        });
        updatesList.appendChild(dateDiv);

    });

}

// Shows a validation message
function showFieldError(input, message) {
    input.value = "";                 // clear the spaces so the placeholder shows
    input.setCustomValidity(message);
    input.reportValidity();
    input.focus();
}

// Clear the custom massage
[inpName, description].forEach((field) => {
    field.addEventListener("input", () => field.setCustomValidity(""));
});

// Submit daily update
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = inpName.value.trim();
    const work = description.value.trim();

    if (!name) {
        showFieldError(inpName, "Please enter your name.");
        return;
    }

    if (!work) {
        showFieldError(description, "Please describe what you did today.");
        return;
    }

    const newUpdate = {
        date: inpDate.value,
        name: name,
        description: work,
        blocked: blocked.value.trim()
    };

    try {

        subBtn.disabled = true;
        subBtn.textContent = "Submitting...";

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(newUpdate)

        });

        if (!response.ok) {
            throw new Error("Failed to save update");
        }

        const savedData = await response.json();

        console.log("Saved update:", savedData);

        // Reset form (keep date defaulted to today)
        form.reset();
        inpDate.value = getTodayLocal();

        // Refresh update history
        await getUpdates();

        alert("Daily update submitted successfully!");

    }
    catch (error) {

        console.log("Error submitting data:", error);

        alert("Unable to submit update. Please check your server connection.");

    }
    finally {
        subBtn.disabled = false;
        subBtn.textContent = "Submit Daily Update →";
    }
});

// Load updates when page opens
getUpdates();