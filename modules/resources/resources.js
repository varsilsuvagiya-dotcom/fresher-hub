const API_URL = "https://fresher-hub-api-cloudus.onrender.com/resources";

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

// ================================
// LOAD SHARED HEADER
// ================================

async function loadHeader() {
  try {
    const response = await fetch("../../header.html");

    if (!response.ok) {
      throw new Error("Header not found");
    }

    const html = await response.text();

    const headerContainer = document.getElementById("header");
    headerContainer.innerHTML = html;

    // Mobile navigation
    const menuButton = headerContainer.querySelector("#menuButton");
    const mainNavigation = headerContainer.querySelector("#mainNavigation");

    if (menuButton && mainNavigation) {
      menuButton.addEventListener("click", () => {
        const expanded = menuButton.getAttribute("aria-expanded") === "true";

        menuButton.setAttribute("aria-expanded", String(!expanded));

        mainNavigation.classList.toggle("hidden");
        mainNavigation.classList.toggle("flex");
      });

      mainNavigation.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          if (window.innerWidth < 768) {
            mainNavigation.classList.add("hidden");
            mainNavigation.classList.remove("flex");
            menuButton.setAttribute("aria-expanded", "false");
          }
        });
      });
    }

    // Fix nested module navigation paths
    headerContainer.querySelectorAll('a[href^="modules/"]').forEach((link) => {
      link.href = "../../" + link.getAttribute("href");
    });
  } catch (error) {
    console.error("Header Error:", error);
  }
}

// ================================
// LOAD SHARED FOOTER
// ================================

async function loadFooter() {
  try {
    const response = await fetch("../../footer.html");

    if (!response.ok) {
      throw new Error("Footer not found");
    }

    const html = await response.text();

    const footerContainer = document.getElementById("footer-container");

    if (!footerContainer) {
      throw new Error("Footer container not found");
    }

    footerContainer.innerHTML = html;

    // Fix all footer relative links
    footerContainer.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href");

      if (href && href.startsWith("./")) {
        link.href = "../../" + href.substring(2);
      }
    });

    // Dynamic current year
    const currentYear = footerContainer.querySelector("#currentYear");

    if (currentYear) {
      currentYear.textContent = new Date().getFullYear();
    }
  } catch (error) {
    console.error("Footer Error:", error);
  }
}

// ================================
// FETCH RESOURCES
// ================================

async function fetchResources() {
  try {
    resourceContainer.innerHTML = `
      <p class="col-span-full text-center text-gray-500 py-8">
        Loading resources...
      </p>
    `;

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch resources");
    }

    resources = await response.json();

    displayResources(resources);
  } catch (error) {
    console.error("Fetch Error:", error);

    resourceContainer.innerHTML = `
      <p class="col-span-full text-center text-red-500 py-8">
        Unable to load resources. Please try again later.
      </p>
    `;
  }
}

// ================================
// DISPLAY RESOURCES
// ================================

function displayResources(data) {
  resourceContainer.innerHTML = "";

  if (data.length === 0) {
    resourceContainer.innerHTML = `
      <p class="col-span-full text-center text-gray-500 py-8">
        No resources found.
      </p>
    `;
    return;
  }

  data.forEach((resource) => {
    const card = document.createElement("div");

    card.className = "bg-white p-5 rounded-xl shadow-sm border border-gray-200";

    const topic = document.createElement("p");
    topic.className = "text-sm font-semibold text-indigo-600 mb-2";
    topic.textContent = resource.topic || "General";

    const title = document.createElement("h3");
    title.className = "text-lg font-bold mb-2";
    title.textContent = resource.title;

    const description = document.createElement("p");
    description.className = "text-gray-600 text-sm mb-4";
    description.textContent = resource.description || "No description available.";

    const link = document.createElement("a");
    link.href = resource.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open Resource →";
    link.className = "text-indigo-600 font-semibold";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "ml-4 text-red-600 text-sm font-semibold";

    deleteButton.addEventListener("click", () => {
      deleteResource(resource.id);
    });

    card.append(topic, title, description, link, deleteButton);

    resourceContainer.appendChild(card);
  });
}

// ================================
// ADD NEW RESOURCE
// ================================

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

    await fetchResources();
  } catch (error) {
    console.error("Add Resource Error:", error);
    alert("Unable to add resource.");
  }
});

// ================================
// DELETE RESOURCE
// ================================

async function deleteResource(id) {
  const confirmDelete = confirm("Are you sure you want to delete this resource?");

  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete resource");
    }

    await fetchResources();
  } catch (error) {
    console.error("Delete Error:", error);
    alert("Unable to delete resource.");
  }
}

// ================================
// SEARCH RESOURCES
// ================================

searchInput.addEventListener("input", () => {
  const searchValue = searchInput.value.trim().toLowerCase();

  const filteredResources = resources.filter((resource) => {
    const title = (resource.title || "").toLowerCase();
    const topic = (resource.topic || "").toLowerCase();
    const description = (resource.description || "").toLowerCase();

    return title.includes(searchValue) || topic.includes(searchValue) || description.includes(searchValue);
  });

  displayResources(filteredResources);
});

// ================================
// INITIALIZE MODULE
// ================================

loadHeader();
loadFooter();
fetchResources();
