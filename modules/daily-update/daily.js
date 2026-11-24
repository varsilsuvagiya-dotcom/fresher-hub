// daily-update module

let form = document.querySelector("#updateForm")
let inpName = document.querySelector("#inpName")
let inpDate = document.querySelector("#inpDate")
let description = document.querySelector("#description")
let blocked = document.querySelector("#blocked")
let subBtn = document.querySelector("#subBtn")

let updatesList = document.querySelector("#updatesList")

const API_URL = "http://localhost:3000/updates";

async function getUpdates() {
    try{
        const response = await fetch(API_URL);

        const data = await response.json();

        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        displayUpdates(data);
    }
    catch (error){
        console.log("Error fetching data: ", error)
    }
}
 

function displayUpdates(data) {
    updatesList.innerHTML = "";

    let groupedUpdates = {};

    // Group updates by date
    data.forEach((item) => {
        if (!groupedUpdates[item.date]) {
            groupedUpdates[item.date] = [];
        }

        groupedUpdates[item.date].push(item);
    });

    // Get all dates and sort newest first
    let dates = Object.keys(groupedUpdates).sort(
        (a, b) => new Date(b) - new Date(a)
    );

    dates.forEach((date) => {

        // Create date container
        const dateDiv = document.createElement("div");

        // Create date heading
        const heading = document.createElement("h3");
        heading.style.color = "gray"
        heading.textContent = date;

        dateDiv.appendChild(heading);

        // Display updates of the same date
        groupedUpdates[date].forEach((item) => {

            const div = document.createElement("div");

            const name = document.createElement("h4");
            name.textContent = item.name;

            const work = document.createElement("p");
            work.textContent = item.description;

            const blocker = document.createElement("p");
            blocker.textContent =  item.blocked;

            div.append(name, work, blocker);

            dateDiv.appendChild(div);
        });

        updatesList.appendChild(dateDiv);
    });
}

form.addEventListener("submit", async(e) => {
    e.preventDefault();
    
    const newUpdate = {
        date: inpDate.value,
        name: inpName.value,
        description : description.value,
        blocked: blocked.value
    };

    try{
        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type":"application/json"
            },

            body: JSON.stringify(newUpdate)
        });

        if(!response.ok) {
            throw new Error ("Failed to save update");
        }

        const savedData = await response.json();
        console.log(savedData)
        form.reset();

        getUpdates();
    }
    catch (error) {
        console.log("Error submitting data:", error)
    }
});

getUpdates();