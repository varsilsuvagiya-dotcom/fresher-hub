// events module
let inpEvent = document.querySelector("#inpEvent")
let inpDate = document.querySelector("#inpDate")
let inpTime =  document.querySelector("#inpTime")
let eventForm = document.querySelector("#eventForm")
let subBtn = document.querySelector("#subBtn")
let eventList = document.querySelector("#eventlist")

const API_URL = "https://fresher-hub-api-cloudus.onrender.com/events";

fetch('../../header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-bar').innerHTML = data;
    });

async function getEvents() {
    try{
        const response = await fetch(API_URL)

        if (!response.ok) {
            throw new Error("Failed to fetch updates");
        }

        const data = await response.json();

        displayEvents(data);
    }
    catch (error) {
        console.log(`Error: ${error.message}`)
    }
}

function displayEvents(data) {

}

eventForm.addEventListener("submit", async(e) => {
    e.preventDefault();

    const eventData = {
        
    }
})