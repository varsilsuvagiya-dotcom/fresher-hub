// resources module

const API_URL = "https://fresher-hub-api-cloudus.onrender.com/resources";
// const API_URL = "http://localhost:3000/resources";

const resourceContainer = document.getElementById("resourceContainer");
const resourceForm = document.getElementById("resourceForm");
const searchInput = document.getElementById("searchInput");

let resources = [];

// Load shared header
fetch("../../header.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("header").innerHTML = data;
  })
  .catch((error) => console.error("Header error:", error));

// Fetch resources from JSON Server
async function fetchResources() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch resources");
    }

    resources = await response.json();
    displayResources(resources);
  } catch (error) {
    console.error(error);
    resourceContainer.textContent = "Unable to load resources. Start JSON Server first.";
  }
}

// Display resources
function displayResources(data) {
  resourceContainer.innerHTML = "";

  if (data.length === 0) {
    resourceContainer.innerHTML = `<p class="col-span-full text-center text-gray-500 py-8">
        No resources found.
      </p>`;
    return;
  }

  data.forEach((resource) => {
    const card = document.createElement("div");

    card.className = "bg-white p-5 rounded-xl shadow-sm border border-gray-200";

    const topic = document.createElement("p");
    topic.className = "text-sm font-semibold text-indigo-600 mb-2";
    topic.textContent = resource.topic;

    const title = document.createElement("h3");
    title.className = "text-lg font-bold mb-2";
    title.textContent = resource.title;

    const description = document.createElement("p");
    description.className = "text-gray-600 text-sm mb-4";
    description.textContent = resource.description || "";

    const link = document.createElement("a");
    link.href = resource.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open Resource →";
    link.className = "text-indigo-600 font-semibold";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "ml-4 text-red-600 text-sm font-semibold";

    deleteButton.addEventListener("click", () => {
      deleteResource(resource.id);
    });

    card.append(topic, title, description, link, deleteButton);
    resourceContainer.appendChild(card);
  });
}

// Add new resource
resourceForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const newResource = {
    topic: document.getElementById("topic").value,
    title: document.getElementById("title").value.trim(),
    url: document.getElementById("url").value.trim(),
    description: document.getElementById("description").value.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newResource),
    });

    if (!response.ok) {
      throw new Error("Failed to add resource");
    }

    resourceForm.reset();
    fetchResources();
  } catch (error) {
    console.error(error);
    alert("Unable to add resource.");
  }
});

// Delete resource
async function deleteResource(id) {
  if (!confirm("Are you sure you want to delete this resource?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete resource");
    }

    fetchResources();
  } catch (error) {
    console.error(error);
    alert("Unable to delete resource.");
  }
}

// Search resources
searchInput.addEventListener("input", () => {
  const searchValue = searchInput.value.toLowerCase();

  const filteredResources = resources.filter((resource) => resource.title.toLowerCase().includes(searchValue) || resource.topic.toLowerCase().includes(searchValue) || (resource.description || "").toLowerCase().includes(searchValue));

  displayResources(filteredResources);
});

// Initial load
fetchResources();
