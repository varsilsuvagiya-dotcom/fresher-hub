// events module
const upcomingEvents = document.getElementById("upcomingEvents");
const pastEvents = document.getElementById("pastEvents");

const upcomingMessage = document.getElementById("upcomingMessage");
const pastMessage = document.getElementById("pastMessage");

const API_URL = "https://fresher-hub-api-cloudus.onrender.com/events";
let events;

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

async function getEvents() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch updates");
    }
    events = await response.json();
    displayEvents(events);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}
function createEventCard(event, isPast = false) {
  const date = new Date(event.date + "T00:00:00");
  const day = date.toLocaleDateString("en-US", {
    weekday: "short",
  });
  const dateNumber = date.getDate();
  const [hours, minutes] = event.time.split(":");

  const eventTime = new Date();
  eventTime.setHours(Number(hours), Number(minutes));
  const formattedTime = eventTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const cardClass = isPast ? "flex items-center gap-4 bg-slate-100 border border-slate-300 text-slate-500 p-3 sm:p-4" : "flex items-center gap-4 bg-white border border-secondary p-3 sm:p-4";
  return `
    <section class="${cardClass}">
    <div class="flex flex-col items-center justify-center border border-secondary h-16 w-20">
        <span class="text-xs text-primary">${day}</span>
            <span class="text-2xl font-bold">${dateNumber}</span>
    </div>
    <div>
      <h3 class="font-bold ">${event.name}</h3>
      <div class="flex justify-between gap-4 items-center mt-1">
       <p class="text-sm text-slate-600">
              ${formattedTime} 
            </p>
              <p class="text-sm text-slate-600"> ${event.place}</p>
      </div>       
      </div>
    </section>
    `;
}

function displayEvents(events) {
  upcomingEvents.innerHTML = "";
  pastEvents.innerHTML = "";
  upcomingMessage.textContent = "";
  pastMessage.textContent = "";
  if (events.length === 0) {
    upcomingMessage.textContent = "No Upcoming Events found.";
    pastMessage.textContent = "No Past Event found.";
    return;
  }
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = [];
  const past = [];
  events.forEach((event) => {
    const eventDate = new Date(event.date + "T00:00:00");
    if (eventDate >= today) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
    //sort by date
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    past.sort((a, b) => new Date(b.date) - new Date(a.date));
    // Display Upcoming Events
    if (upcoming.length === 0) {
      upcomingMessage.textContent = "No Upcoming Events found.";
      upcomingMessage.classList.remove("hidden");
      upcomingEvents.classList.add("hidden");
    } else {
      upcomingMessage.textContent = "";
      upcomingMessage.classList.add("hidden");
      upcomingEvents.classList.remove("hidden");
      upcomingEvents.innerHTML = upcoming.map((event) => createEventCard(event, false)).join("");
    }

    // Display Past Events
    if (past.length === 0) {
      pastMessage.textContent = "No Past Events found.";
      pastMessage.classList.remove("hidden");
      pastEvents.classList.add("hidden");
    } else {
      pastMessage.textContent = "";
      pastMessage.classList.add("hidden");
      pastEvents.classList.remove("hidden");
      pastEvents.innerHTML = past.map((event) => createEventCard(event, true)).join("");
    }
  });
}

//add event member api
async function addEvents(newMember) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMember),
    });
    if (!response.ok) {
      throw new Error("Adding Events failed");
    }
    if (response.ok) {
      const savedEvent = await response.json();
      events.push(savedMember);
      displayEvents(events);
      alert("Events added successfully!");
      // Clear form after successful API response
      eventForm.reset();
    }
  } catch (error) {
    console.error(error);
  } finally {
    // Enable button again
    addEventBtn.disabled = false;
    addEventBtn.textContent = "Add event";
  }
}

eventForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const addEvent = {
    name: document.getElementById("eventName").value.trim(),
    date: document.getElementById("eventDate").value,
    time: document.getElementById("eventTime").value,
    place: document.getElementById("eventPlace").value.trim(),
  };
  addEventBtn.disabled = true;
  addEventBtn.textContent = "Saving...";
  addEvents(addEvent);
});

loadHeader();
loadFooter();
getEvents();
