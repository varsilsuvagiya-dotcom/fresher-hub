// const API_URL = "http://localhost:3000/team";
const API_URL = "https://fresher-hub-api-cloudus.onrender.com/team";
const teamContainer = document.getElementById("teamContainer");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");

const memberModal = document.getElementById("memberModal");
const openModal = document.getElementById("openModal");

const pagination = document.getElementById("pagination");
const ITEMS_PER_PAGE = 8;
let currentPage = 1;

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

//Get Team meber list
async function getTeamMember() {
  try {
    message.textContent = "Loading Team Member...";
    teamContainer.textContent = "";
    pagination.innerHTML = "";
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
  if (teams.length === 0) {
    message.textContent = "No team members found.";
    return;
  }
  message.textContent = "";
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentMembers = teams.slice(startIndex, endIndex);

  currentMembers.forEach((member) => {
    const skillsHTML = member.skills
      .map(
        (skill) =>
          `<span class="border border-primary px-3 py-1 text-xs rounded-lg text-gray-600">
     ${skill}
     </span>`,
      )
      .join("");

    const card = document.createElement("div");
    card.className = `relative bg-white flex flex-col items-center rounded-lg border border-secondary
     p-6 text-center transition  hover:shadow-lg  hover:border-primary hover:-translate-y-1 `;

    card.innerHTML = `
     <img src="${member.image}" alt="Profile" 
     class="w-20 h-20 rounded-full object-cover border border-secondary bg-gray-200"
     onerror="this.onerror=null;this.src='https://placehold.co/100x100?text=User'"
     />
     <h3 class="font-bold text-primary mt-2 text-base">${member.name}</h3>
     <p class="text-sm my-1 text-gray-600"> [Track: ${member.track}]</p>
     <div class="flex flex-wrap justify-center gap-2">${skillsHTML}</div>
      <button
      onclick="deleteMember(${Number(member.id)})"
      class="absolute top-1 right-2 text-sm rounded-lg border border-red-200
                bg-red-50 px-2 py-1 font-semibold text-red-600"
    >
      <span>✖</span>
    </button>
     `;
    teamContainer.appendChild(card);
  });
  displayPagination(teams);
}
getTeamMember();
async function deleteMember(memberId) {
  const isConfirmed = confirm("Are you sure you want to delete this member?");
  // Stop if user clicks Cancel
  if (!isConfirmed) return;

  try {
    const response = await fetch(`${API_URL}/${memberId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete team member");
    }
    // Fetch updated team list from API
    getTeamMember();
    message.textContent = "Team member deleted successfully.";
    alert("Team member deleted successfully.");
  } catch (error) {
    message.textContent = "Unable to delete team member.";
    console.error(error);
  }
}

// Display pagination buttons
function displayPagination(teams) {
  const totalPages = Math.ceil(teams.length / ITEMS_PER_PAGE);
  pagination.innerHTML = "";
  if (totalPages <= 1) return;
  // Previous button
  pagination.innerHTML += `
    <button
      onclick="changePage(${currentPage - 1})"
      ${currentPage === 1 ? "disabled" : ""}
      class="px-3 py-2 rounded-lg border text-sm
      ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}"
    >
      Previous
    </button>
  `;

  // Page number buttons
  for (let page = 1; page <= totalPages; page++) {
    pagination.innerHTML += `
      <button
        onclick="changePage(${page})"
        class="px-3 py-2 rounded-lg border text-sm
        ${currentPage === page ? "bg-primary text-white border-primary" : "hover:bg-gray-100"}"
      >
        ${page}
      </button>
    `;
  }

  // Next button
  pagination.innerHTML += `
    <button
      onclick="changePage(${currentPage + 1})"
      ${currentPage === totalPages ? "disabled" : ""}
      class="px-3 py-2 rounded-lg border text-sm
      ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}"
    >
      Next
    </button>
  `;
}

// Change page
function changePage(page) {
  const totalPages = Math.ceil(teamMembers.length / ITEMS_PER_PAGE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  displayTeamMembers(teamMembers);
}

//search team member name
searchInput.addEventListener("input", (event) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const filteredMembers = teamMembers.filter((member) => member.name.toLowerCase().includes(event.target.value.trim().toLowerCase()));
    displayTeamMembers(filteredMembers);
  }, 500);
});

//add team member api
async function addTeamMember(newMember) {
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
    }
    if (response.ok) {
      const savedMember = await response.json();
      teamMembers.push(savedMember);
      displayTeamMembers(teamMembers);
      // Close modal
      hideModal();
      alert("Team member added successfully!");
    }
  } catch (error) {
    console.error(error);
  }
}

//modal
// Open Modal
openModal.addEventListener("click", () => {
  memberModal.classList.remove("hidden");
  memberModal.classList.add("flex");
});
// Close Modal Function
function hideModal() {
  memberModal.classList.add("hidden");
  memberModal.classList.remove("flex");
  memberForm.reset();
}

memberForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const saveButton = document.getElementById("saveTeam");
  const addMember = {
    name: document.getElementById("memberName").value.trim(),
    track: document.getElementById("memberTrack").value,
    skills: document
      .getElementById("memberSkills")
      .value.split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill !== ""),
    image: document.getElementById("memberImage").value.trim(),
  };
  addTeamMember(addMember);
});
