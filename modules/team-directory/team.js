const API_URL = "http://localhost:3000/team";
// const API_URL = "https://fresher-hub-api-cloudus.onrender.com/team";
const teamContainer = document.getElementById("teamContainer");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");

const memberModal = document.getElementById("memberModal");

const openModal = document.getElementById("openModal");

let teamMembers;
let debounceTimer;
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
//Get Team meber list
async function getTeamMember() {
  try {
    message.textContent = "Loading...";
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch team data");
    }
    teamMembers = await response.json();

    displayTeamMembers(teamMembers);
  } catch (error) {
    message.textContent = "Error loading team members.";
    console.error(error);
  }
}
//show team list
function displayTeamMembers(teams) {
  teamContainer.innerHTML = "";
  console.log(teams);
  if (teams.length === 0) {
    message.textContent = "No team members found.";
    return;
  }
  message.textContent = "";
  teams.forEach((member) => {
    const skillsHTML = member.skills
      .map(
        (skill) =>
          `<span class="border border-primary px-3 py-1 text-xs rounded-lg text-gray-600">
     ${skill}
     </span>`,
      )
      .join("");

    const card = document.createElement("div");
    card.className = `bg-white flex flex-col items-center rounded-lg border border-secondary
     p-6 text-center transition  hover:shadow-lg  hover:border-primary hover:-translate-y-1 `;

    card.innerHTML = `
     <img src="${member.image}" alt="Profile" 
     class="w-20 h-20 rounded-full object-cover border border-secondary bg-gray-200"
     onerror="this.onerror=null;this.src='https://placehold.co/100x100?text=User'"
     />
     <h3 class="font-bold text-primary mt-2 text-base">${member.name}</h3>
     <p class="text-sm my-1 text-gray-600"> [Track: ${member.track}]</p>
     <div class="flex flex-wrap justify-center gap-2">${skillsHTML}</div>
     `;
    teamContainer.appendChild(card);
  });
}
// getTeamMember();

//search team member name
searchInput.addEventListener("input", (event) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const filteredMembers = teamMembers.filter((member) => member.name.toLowerCase().includes(event.target.value.trim().toLowerCase()));
    displayTeamMembers(filteredMembers);
  }, 500);
});

//add team member api
async function addTeamMember() {
  const newMember = {
    name: "Ravi Patel",
    track: "Java Developer",
    skills: ["Java", "Spring Boot", "SQL"],
    image: "https://i.pravatar.cc/150?img=12",
  };
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMember),
    });
    if (!response.ok) {
      throw new Error("Adding team member failed");
    } else {
      if (response.ok) {
        console.log("Team member added successfully!");
      }
    }
    const headerHTML = await response.text();
  } catch (error) {
    console.error(error);
  }
}

//modal
// Open Modal
openModal.addEventListener("click", () => {
  console.log("click");

  memberModal.classList.remove("hidden");
  memberModal.classList.add("flex");
});
// Close Modal Function
function hideModal() {
  memberModal.classList.add("hidden");
  memberModal.classList.remove("flex");
  // memberForm.reset();
}

// addTeamMember();
