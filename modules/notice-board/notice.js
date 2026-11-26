// notice-board module
const title = document.querySelector("#title");
const message = document.querySelector("#message");
const post = document.querySelector("#notice-post");
const post_list = document.querySelector("#notice-list");
const list_status = document.querySelector("#list-status");
const month_filter = document.querySelector("#month-filter");

let notices = [];

const api_url = "https://fresher-hub-api-cloudus.onrender.com/notices";

// header function
fetch('../../header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-bar').innerHTML = data;
    });

//footer function
fetch('../../footer.html')
    .then((response) => {

    if (!response.ok) {
        throw new Error("Footer not found");
    }

    return response.text();

    })
    .then((data) => {

    const footerContainer =
        document.getElementById('footer-container');

    footerContainer.innerHTML = data;

    // Dynamic Current Year
    const currentYear =
        footerContainer.querySelector("#currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
        }

    })
    .catch((error) => {
        console.error("Footer Error:", error);
    });

function display_notices() {
    const selectedMonth = month_filter ? month_filter.value : "all";
    post_list.innerHTML = "";

    const filteredNotices = notices
        .slice()
        .sort((a, b) => b.id - a.id)
        .filter(element => {
            if (selectedMonth === "all") return true;
            return element.date && element.date.includes(selectedMonth);
        });

    if (filteredNotices.length === 0) {
        list_status.textContent = "No notices found.";
        return;
    }

    list_status.textContent = "";

    filteredNotices.forEach(element => {
        const li = document.createElement("li");

        li.className = "bg-white rounded-2xl border border-slate-300 shadow-sm p-6 hover:border-indigo-400 transition";

        li.innerHTML = `
            <div class="flex items-start justify-between gap-4 mb-2">
                <h3 class="text-base font-bold text-slate-900">${element.title}</h3>
                <span class="text-xs font-medium text-slate-400 whitespace-nowrap">${element.date}</span>
            </div>
            <p class="text-sm text-slate-600 leading-relaxed">${element.message}</p>
        `;

        post_list.appendChild(li);
    });
}

async function fetch_notices() {
    list_status.textContent = "Loading notices...";

    try {
        const response = await fetch(api_url);
        const data = await response.json();

        notices = data;
        display_notices();
    } catch (error) {
        list_status.textContent = "Failed to load notices.";
    }
}

async function post_notice(e) {
    e.preventDefault();

    if (!title.value.trim() || !message.value.trim()) return;
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

        if (response.ok) {
            title.value = "";
            message.value = "";
            fetch_notices();
        }
    } finally {
        post.disabled = false;
        post.textContent = "Post notice";
    }
}

post.addEventListener("click", post_notice);
if (month_filter) {
    month_filter.addEventListener("change", display_notices);
}

fetch_notices();

