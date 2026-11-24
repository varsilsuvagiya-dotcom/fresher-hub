// leave-request module
const leave_form = document.querySelector("#leave-form");
const namee = document.querySelector("#name");
const from_date = document.querySelector("#from");
const to_date = document.querySelector("#to");
const status = document.querySelector("#status");
const message = document.querySelector("#message");
const table = document.querySelector("#leave-list");

const api_url = "http://localhost:3000/leaves";


//header function 
fetch('../../header.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('header-bar').innerHTML = data;
      });

leave_form.addEventListener("submit",(e) => {

    e.preventDefault();
    
    console.log(`name:- ${namee.value}, from:- ${from_date.value}, to:- ${to_date.value}, reason:- ${message.value}`);

    add_leave_request({
        "name":namee.value,
        "from":from_date.value,
        "to":to_date.value,
        "reason":message.value,
        "status":status.value,
        "created_at": new Date().toISOString()
    });
    
    leave_form.reset();
    fetch_leave();
    

});

async function add_leave_request(leave_data){
    try{
        const response = await fetch(api_url,{

            method:"POST",

            headers:{
                "Content-Type": "application/json"
            },

            body: JSON.stringify(leave_data)

        });

        const data = await response.json();

        console.log(data);
    }
    catch(e){
        console.log(e);
    }
   
}

async function fetch_leave(){

    try{
        const response = await fetch(api_url);

        const data = await response.json();

        data.forEach(element => {
            console.log(element)
        });
        list_leaves(data);
        
    }
    catch(e){
        console.log(e.message);
    }

}


function list_leaves(data) {

    table.innerHTML = "";

    const columns = ["from", "to", "reason", "status"];

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

                status.textContent = item.status;

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

