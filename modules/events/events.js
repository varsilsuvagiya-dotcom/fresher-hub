// events module
let inpEvent = document.querySelector("#inpEvent");
let inpDate = document.querySelector("#inpDate");
let inpTime = document.querySelector("#inpTime");
let eventForm = document.querySelector("#eventForm");
let subBtn = document.querySelector("#subBtn");
let eventList = document.querySelector("#eventlist");

const API_URL = "https://fresher-hub-api-cloudus.onrender.com/events";

// -------------------------load Header----------------------------
async function loadHeader() {
  try {
    const response = await fetch("../../header.html");
    if (!response.ok) {
      throw new Error("Header loading failed");
    }
    const headerHTML = await response.text();

    document.getElementById("header").innerHTML = headerHTML;
  } catch (error) {
    console.error(error);
  }
}

loadHeader();
// -------------------------load Header----------------------------
async function loadFooter() {
  try {
    const response = await fetch("../../footer.html");
    if (!response.ok) {
      throw new Error("Footer loading failed");
    }
    const footerHTML = await response.text();

    document.getElementById("footer-container").innerHTML = footerHTML;
  } catch (error) {
    console.error(error);
  }
}
loadFooter();

async function getEvents() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch updates");
    }

    const data = await response.json();

    displayEvents(data);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

function displayEvents(data) {}

eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const eventData = {};
});

//  <!-- <div id="app">
//       <form id="eventForm">
//         <h3>Add an event</h3>

//         <div>
//           <label for="eventName">Event name</label>
//           <input type="text" placeholder="[Event name]" id="inpEvent" />
//         </div>
//         <div>
//           <div>
//             <label for="date">Date</label>
//             <input type="date" id="inpDate" />
//           </div>
//           <div>
//             <label for="time">Time</label>
//             <input type="time" id="inpTime" />
//           </div>
//         </div>
//         <div>
//           <label for="place">Place</label>
//           <input type="text" placeholder="[Room or online link]" id="inpText" />
//         </div>
//         <div>
//           <button type="submit" id="subBtn">Add event</button>
//         </div>
//       </form>
//     </div>
