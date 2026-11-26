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
