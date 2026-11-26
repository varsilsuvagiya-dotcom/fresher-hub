// leave-request module
const leave_form = document.querySelector("#leave-form");
const namee = document.querySelector("#name");
const from_date = document.querySelector("#from");
const to_date = document.querySelector("#to");
const status = document.querySelector("#status");
const message = document.querySelector("#message");
const table = document.querySelector("#leave-list");
const status_filter = document.querySelector("#status-filtered");


const api_url = "https://fresher-hub-api-cloudus.onrender.com/leaves";


//header function 
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


from_date.addEventListener("change", () => {

    to_date.min = from_date.value;

    if (to_date.value && to_date.value < from_date.value) {
        to_date.value = "";
    }

});


leave_form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!namee.value || !from_date.value || !to_date.value || !message.value || !status.value) {
        alert("Please fill all the fields.");
        return;
    }

    if (to_date.value < from_date.value) {
        alert("To date cannot be earlier than From date.");
        return;
    }

    console.log(`name:- ${namee.value}, from:- ${from_date.value}, to:- ${to_date.value}, reason:- ${message.value}`);

    const success = await add_leave_request({
        name: namee.value,
        from: from_date.value,
        to: to_date.value,
        reason: message.value,
        status: status.value,
        created_at: new Date().toISOString()
    });

    if (success) {
        leave_form.reset();
        to_date.min = "";
        await fetch_leave();
        alert("Leave added successfully");
    }

});

async function add_leave_request(leave_data) {

    try {

        const response = await fetch(api_url, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(leave_data)

        });

        if (!response.ok) {
            throw new Error("Failed to submit leave request");
        }

        const data = await response.json();

        console.log(data);

        return true;

    }
    catch (e) {

        console.log(e.message);

        alert("Unable to submit leave request.");

        return false;

    }

}


status_filter.addEventListener("change", () => {
    fetch_leave();
});

async function fetch_leave() {

    try {

        const response = await fetch(api_url);

        const data = await response.json();

        if (data.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-6 text-slate-500">
                        No leave requests found.
                    </td>
                </tr>
            `;
            return;
        }

        const selected_status = status_filter.value;

        let filtered_data;

        if (selected_status === "all") {

            filtered_data = data;

        } else {

            filtered_data = data.filter(item => {
                return item.status === selected_status;
            });

        }

        list_leaves(filtered_data);

    }
    catch(e) {

        console.log(e.message);

    }

}


function list_leaves(data) {

    table.innerHTML = "";

    const columns = ["name","from", "to", "reason", "status"];

    const header = document.createElement("tr");

    header.className = "bg-slate-50 border-b border-slate-200";

    columns.forEach(col => {

        const th = document.createElement("th");

        th.textContent = col.toUpperCase();

        th.className = "sticky top-0 bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-600 uppercase tracking-wider";

        header.appendChild(th);

    });

    table.appendChild(header);


    const tbody = document.createElement("tbody");

    data.forEach(item => {

        const row = document.createElement("tr");

        row.className =
            "border-b border-slate-100 hover:bg-slate-50 transition";

        columns.forEach(col => {

            const td = document.createElement("td");

            td.textContent = item[col];

            td.className =
                "px-4 py-4 text-sm text-slate-600 whitespace-nowrap";

            
            if (col === "status") {

                const status = document.createElement("span");

                status.textContent = item.status ?? "-";

                if (item.status === "accepted") {
                    status.className = "inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-300 text-green-700 capitalize";
                }
                else if (item.status === "rejected") {
                    status.className = "inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-300 text-red-700 capitalize";
                }
                else if (item.status === "pending") {
                    status.className = "inline-flex px-3 py-1 rounded-full text-xs font-medium bg-amber-300 text-amber-700 capitalize";
                }
                else {
                    status.className = "inline-flex px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize";
                }

                td.textContent = "";
                td.appendChild(status);
            }

            row.appendChild(td);

        });

        tbody.appendChild(row);

    });

    table.appendChild(tbody);

}


fetch_leave();

