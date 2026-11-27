
// Notice Board Module

const form = document.querySelector("#notice-form");
const title = document.querySelector("#title");
const message = document.querySelector("#message");
const post = document.querySelector("#notice-post");
const post_list = document.querySelector("#notice-list");
const list_status = document.querySelector("#list-status");
const month_filter = document.querySelector("#month-filter");

let notices = [];

const api_url = "https://fresher-hub-api-cloudus.onrender.com/notices";

// Header Function
fetch("../../header.html")
    .then(response => {
        if (!response.ok) {
            throw new Error("Header not found");
        }

        return response.text();
    })
    .then(data => {
        document.querySelector("#header-bar").innerHTML = data;
    })
    .catch(error => {
        console.error("Header Error:", error);
    });


// Footer Function
fetch("../../footer.html")
    .then(response => {
        if (!response.ok) {
            throw new Error("Footer not found");
        }

        return response.text();
    })
    .then(data => {
        const footerContainer = document.querySelector("#footer-container");

        footerContainer.innerHTML = data;

        const currentYear = footerContainer.querySelector("#currentYear");

        if (currentYear) {
            currentYear.textContent = new Date().getFullYear();
        }
    })
    .catch(error => {
        console.error("Footer Error:", error);
    });


// Delete daily update by its ID

// Delete notice by its ID
async function deleteNotice(id) {

    if (id === undefined || id === null || id === "") {
        alert("Unable to delete: Notice ID not found.");
        return;
    }

    const confirmDelete = confirm(
        "Are you sure you want to delete this notice?"
    );

    if (!confirmDelete) return;

    try {

        const response = await fetch(`${api_url}/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage || "Delete request failed");
        }

        // Refresh notice list
        await fetch_notices();

        alert("Notice deleted successfully!");

    } catch (error) {

        console.error("Delete Error:", error);

        alert("Unable to delete notice. Please try again.");

    }
}



function display_notices() {

    const selectedMonth = month_filter ? month_filter.value : "all";

    post_list.innerHTML = "";

    const filteredNotices = notices
        .slice()
        .sort((a, b) => Number(b.id) - Number(a.id))
        .filter(element => {

            if (selectedMonth === "all") {
                return true;
            }

            return element.date && element.date.includes(selectedMonth);
        });

    if (filteredNotices.length === 0) {
        list_status.textContent = "No notices found.";
        return;
    }

    list_status.textContent = "";

    filteredNotices.forEach(element => {

        const li = document.createElement("li");

        li.className = "bg-surface rounded-xl border border-line shadow-sm p-5 sm:p-6 hover:border-primary-ring-strong transition";

        const header = document.createElement("div");

        header.className = "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3";

        const heading = document.createElement("h3");

        heading.className = "text-base font-bold text-heading";
        heading.textContent = element.title;

        const date = document.createElement("span");

        date.className = "text-xs font-medium text-secondary whitespace-nowrap";
        date.textContent = element.date;

        const description = document.createElement("p");

        description.className = "text-sm text-copy leading-relaxed whitespace-pre-wrap";
        description.textContent = element.message;

        const deleteBtn = document.createElement("button");

            deleteBtn.type = "button";

            deleteBtn.className = "mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-danger-border bg-danger-bg px-4 py-2 text-sm font-semibold text-danger-text transition hover:bg-danger-bg-hover";

            deleteBtn.innerHTML = `
                <span>🗑</span>
                <span>Delete Update</span>
            `;

            deleteBtn.addEventListener("click", () => {
            deleteNotice(element.id ?? element._id);
            });

        header.appendChild(heading);
        header.appendChild(date);

        li.appendChild(header);
        li.appendChild(description);
        li.appendChild(deleteBtn);

        post_list.appendChild(li);
    });
}



async function fetch_notices() {

    list_status.textContent = "Loading notices...";

    try {

        const response = await fetch(api_url);

        if (!response.ok) {
            throw new Error("Unable to fetch notices");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid notice data");
        }

        notices = data;

        display_notices();

    } catch (error) {

        console.error("Fetch Error:", error);

        list_status.textContent = "Failed to load notices. Please try again.";
    }
}

function validate_field(field) {

    const value = field.value.trim();

    if (value === "") {
        field.setCustomValidity("This field is required.");
        return false;
    }

    field.setCustomValidity("");

    return true;
}

title.addEventListener("input", () => {
    validate_field(title);
});

message.addEventListener("input", () => {
    validate_field(message);
});


async function post_notice(e) {

    e.preventDefault();

    const isTitleValid = validate_field(title);
    const isMessageValid = validate_field(message);

    if (!isTitleValid) {
        alert("Please enter a notice title.");
        title.reportValidity();
        return;
    }

    if (!isMessageValid) {
        alert("Please enter a notice message.");
        message.reportValidity();
        return;
    }

    const today = new Date();

    const newNotice = {
        title: title.value.trim(),
        message: message.value.trim(),
        date: today.toDateString()
    };

    post.disabled = true;
    post.textContent = "Posting...";

    try {

        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newNotice)
        });

        if (!response.ok) {
            throw new Error("Unable to post notice");
        }

        form.reset();

        await fetch_notices();

        alert("Notice posted successfully!");

    } catch (error) {

        console.error("Post Error:", error);

        alert("Failed to post notice. Please try again.");

    } finally {

        post.disabled = false;
        post.textContent = "Post Notice";
    }
}



form.addEventListener("submit", post_notice);


if (month_filter) {
    month_filter.addEventListener("change", display_notices);
}


fetch_notices();
