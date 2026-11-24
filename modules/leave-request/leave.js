// leave-request module
const leave_form = document.querySelector("#leave-form");
const namee = document.querySelector("#name");
const from_date = document.querySelector("#from");
const to_date = document.querySelector("#to");
const message = document.querySelector("#message");
const table = document.querySelector("#leave-list");

const api_url = "http://localhost:3000/leaves";




leave_form.addEventListener("submit",() => {
    
    console.log(`name:- ${namee.value}, from:- ${from_date.value}, to:- ${to_date.value}, reason:- ${message.value}`);

    add_leave_request({
        "name":namee.value,
        "from":from_date.value,
        "to":to_date.value,
        "reason":message.value,
        "status":"pending",
        "created_at": new Date().toISOString()
    });
    

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

function list_leaves(data){

    const columns = ["from","to","reason","status"];

    const header = document.createElement("tr");

    columns.forEach(col => {
      const th = document.createElement("th");
      th.textContent = col.toUpperCase();
      header.appendChild(th);
    });
    table.appendChild(header);

    data.forEach(item => {
      const row = document.createElement("tr");

      columns.forEach(col => {
        const td = document.createElement("td");
        td.textContent = item[col]; 
        row.appendChild(td);
      });

      table.appendChild(row);
    });


}

fetch_leave();

