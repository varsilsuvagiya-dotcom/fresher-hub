
const API_URL = "https://fresher-hub-api-cloudus.onrender.com/resources";

// DOM elements
let resourceContainer;
let resourceForm;
let searchInput;
let resourceCount;
let formMessage;
let addResourceButton;
let resources = [];

// Prevent multiple submissions from the same page
let isSubmittingResource = false;
let isDeletingResource = false;


// URL VALIDATION


function getSafeResourceUrl(value) {
    if (typeof value !== "string" || !value.trim()) {
        return null;
    }

    try {
        const parsedUrl = new URL(value.trim());

        if (
            parsedUrl.protocol !== "http:" &&
            parsedUrl.protocol !== "https:"
        ) {
            return null;
        }

        if (!parsedUrl.hostname) {
            return null;
        }

        return parsedUrl.href;
    } catch {
        return null;
    }
}



// DUPLICATE RESOURCE HELPERS


function normalizeText(value) {
    return String(value ?? "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}

function getResourceKey(resource) {
    const safeUrl = getSafeResourceUrl(resource?.url);

    if (!safeUrl) return null;

    return [
        normalizeText(resource?.topic),
        normalizeText(resource?.title),
        safeUrl.toLowerCase()
    ].join("|");
}

function getUniqueResources(data) {
    const seen = new Set();

    return data.filter(resource => {
        const key = getResourceKey(resource);

        if (!key) return true;
        if (seen.has(key)) return false;

        seen.add(key);
        return true;
    });
}



// LOAD SHARED HEADER


async function loadHeader() {
    try {
        const response = await fetch("../../header.html");

        if (!response.ok) {
            throw new Error("Header not found");
        }

        const html = await response.text();
        const headerContainer = document.getElementById("header");

        if (!headerContainer) {
            throw new Error("Header container not found");
        }

        headerContainer.innerHTML = html;

        const menuButton = headerContainer.querySelector("#menuButton");
        const mainNavigation =
            headerContainer.querySelector("#mainNavigation");

        if (menuButton && mainNavigation) {
            menuButton.addEventListener("click", () => {
                const expanded =
                    menuButton.getAttribute("aria-expanded") === "true";

                menuButton.setAttribute(
                    "aria-expanded",
                    String(!expanded)
                );

                mainNavigation.classList.toggle("hidden");
                mainNavigation.classList.toggle("flex");
            });

            mainNavigation.querySelectorAll("a").forEach(link => {
                link.addEventListener("click", () => {
                    if (window.innerWidth < 768) {
                        mainNavigation.classList.add("hidden");
                        mainNavigation.classList.remove("flex");

                        menuButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }
                });
            });
        }

        // Fix navigation paths on nested module pages
        headerContainer
            .querySelectorAll('a[href^="modules/"]')
            .forEach(link => {
                link.href = `../../${link.getAttribute("href")}`;
            });

    } catch (error) {
        console.error("Header Error:", error);
    }
}


// LOAD SHARED FOOTER


async function loadFooter() {
    try {
        const response = await fetch("../../footer.html");

        if (!response.ok) {
            throw new Error("Footer not found");
        }

        const html = await response.text();

        const footerContainer =
            document.getElementById("footer-container");

        if (!footerContainer) {
            throw new Error("Footer container not found");
        }

        footerContainer.innerHTML = html;

        // Fix footer links on nested module pages
        footerContainer.querySelectorAll("a").forEach(link => {
            const href = link.getAttribute("href");

            if (href?.startsWith("./")) {
                link.href = `../../${href.substring(2)}`;
            }
        });

        // Dynamic copyright year
        const currentYear =
            footerContainer.querySelector("#currentYear");

        if (currentYear) {
            currentYear.textContent = new Date().getFullYear();
        }

    } catch (error) {
        console.error("Footer Error:", error);
    }
}



// FORM MESSAGE


function showFormMessage(message, type = "error") {
    if (!formMessage) return;

    formMessage.textContent = message;

    formMessage.className =
        type === "success"
            ? "text-sm mt-4 text-green-600"
            : "text-sm mt-4 text-red-600";
}



// FETCH RESOURCES


async function fetchResources() {
    if (!resourceContainer) return;

    resourceContainer.innerHTML = `
        <p class="col-span-full text-center text-slate-500 py-8">
            Loading resources...
        </p>
    `;

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch resources");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid resources response");
        }

        resources = data;

        filterResources();

    } catch (error) {
        console.error("Fetch Error:", error);

        resourceContainer.innerHTML = `
            <p class="col-span-full text-center text-red-500 py-8">
                Unable to load resources. Please try again later.
            </p>
        `;

        if (resourceCount) {
            resourceCount.textContent = "0 resources";
        }
    }
}




function filterResources() {
    if (!searchInput) return;

    const searchValue = normalizeText(searchInput.value);

    const filteredResources = resources.filter(resource => {
        return (
            normalizeText(resource.title).includes(searchValue) ||
            normalizeText(resource.topic).includes(searchValue) ||
            normalizeText(resource.description).includes(searchValue) ||
            normalizeText(resource.url).includes(searchValue)
        );
    });

    displayResources(getUniqueResources(filteredResources));
}


// DISPLAY RESOURCES


function displayResources(data) {
    if (!resourceContainer) return;

    resourceContainer.innerHTML = "";

    if (resourceCount) {
        resourceCount.textContent =
            `Showing ${data.length} ${
                data.length === 1 ? "resource" : "resources"
            }`;
    }

    if (data.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className =
            "col-span-full text-center text-slate-500 py-8";

        emptyMessage.textContent = searchInput?.value.trim()
            ? "No matching resources found."
            : "No resources found. Add your first resource.";

        resourceContainer.appendChild(emptyMessage);
        return;
    }

    data.forEach(resource => {
        const card = document.createElement("div");

        card.className =
            "bg-white p-5 rounded-xl shadow-sm border border-slate-200";

        const topic = document.createElement("p");
        topic.className =
            "text-sm font-semibold text-indigo-600 mb-2";
        topic.textContent = resource.topic || "General";

        const title = document.createElement("h3");
        title.className = "text-lg font-bold mb-2";
        title.textContent = resource.title || "Untitled Resource";

        const description = document.createElement("p");
        description.className = "text-slate-600 text-sm mb-4";
        description.textContent =
            resource.description || "No description available.";

        card.append(topic, title, description);

        // Safe resource link
        const safeUrl = getSafeResourceUrl(resource.url);

        if (safeUrl) {
            const link = document.createElement("a");

            link.href = safeUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Open Resource →";
            link.className =
                "text-indigo-600 font-semibold hover:text-indigo-800";

            card.appendChild(link);
        } else {
            const invalidMessage = document.createElement("p");

            invalidMessage.textContent =
                "Invalid or unsafe resource URL.";

            invalidMessage.className =
                "text-red-600 text-sm font-medium";

            card.appendChild(invalidMessage);
        }

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-danger-border bg-danger-bg px-4 py-2 text-sm font-semibold text-danger-text transition hover:bg-danger-bg-hover";
        deleteButton.innerHTML = `
                <span>🗑</span>
                <span>Delete</span>
            `;

        deleteButton.addEventListener("click", () => {
            deleteResource(resource);
        });

        card.appendChild(deleteButton);
        resourceContainer.appendChild(card);
    });
}



// ADD RESOURCE

async function addResource(event) {
    event.preventDefault();

    // Stop rapid repeated submissions
    if (isSubmittingResource) return;

    const topic = document.getElementById("topic")?.value.trim() ?? "";
    const title = document.getElementById("title")?.value.trim() ?? "";
    const url = document.getElementById("url")?.value.trim() ?? "";
    const description =
        document.getElementById("description")?.value.trim() ?? "";

    if (!topic || !title || !url) {
        showFormMessage("Please fill in all required fields.");
        return;
    }

    const safeUrl = getSafeResourceUrl(url);

    if (!safeUrl) {
        showFormMessage(
            "Enter a valid URL starting with http:// or https://."
        );

        document.getElementById("url")?.focus();
        return;
    }

    const newResource = {
        topic,
        title,
        url: safeUrl,
        description,
        createdAt: new Date().toISOString()
    };

    // Lock immediately before any asynchronous request
    isSubmittingResource = true;

    if (addResourceButton) {
        addResourceButton.disabled = true;
        addResourceButton.textContent = "Adding...";
    }

    try {
        // Check latest server data before adding
        const checkResponse = await fetch(API_URL);

        if (!checkResponse.ok) {
            throw new Error("Could not check existing resources");
        }

        const latestResources = await checkResponse.json();

        if (!Array.isArray(latestResources)) {
            throw new Error("Invalid resources response");
        }

        resources = latestResources;

        const newResourceKey = getResourceKey(newResource);

        const alreadyExists = resources.some(resource =>
            getResourceKey(resource) === newResourceKey
        );

        if (alreadyExists) {
            showFormMessage("This resource already exists.");
            filterResources();
            return;
        }

        // Add resource
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newResource)
        });

        if (!response.ok) {
            throw new Error("Failed to add resource");
        }

        resourceForm.reset();
        showFormMessage(
            "Resource added successfully!",
            "success"
        );

        await fetchResources();

    } catch (error) {
        console.error("Add Resource Error:", error);

        showFormMessage(
            "Unable to add resource. Please try again."
        );

    } finally {
        isSubmittingResource = false;

        if (addResourceButton) {
            addResourceButton.disabled = false;
            addResourceButton.textContent = "+ Add Resource";
        }
        alert("resource added successfully!")
    }
}


// ========================================
// DELETE RESOURCE
// ========================================

async function deleteResource(resource) {
    if (isDeletingResource) return;

    const resourceKey = getResourceKey(resource);

    const matchingResources = resourceKey
        ? resources.filter(item => getResourceKey(item) === resourceKey)
        : resources.filter(
            item => String(item.id) === String(resource.id)
        );

    const recordsToDelete = matchingResources.filter(
        item => item.id !== undefined && item.id !== null
    );

    if (recordsToDelete.length === 0) {
        alert("This resource cannot be deleted because its ID is missing.");
        return;
    }

    const message = recordsToDelete.length > 1
        ? `This resource has ${recordsToDelete.length} copies. Delete all copies?`
        : "Are you sure you want to delete this resource?";

    if (!confirm(message)) return;

    isDeletingResource = true;

    try {
        for (const item of recordsToDelete) {
            const response = await fetch(
                `${API_URL}/${encodeURIComponent(item.id)}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                throw new Error(`Failed to delete resource ${item.id}`);
            }
        }

        await fetchResources();

    } catch (error) {
        console.error("Delete Error:", error);

        alert(
            "Unable to delete all copies. Please refresh and try again."
        );

        await fetchResources();

    } finally {
        isDeletingResource = false;
    }
}



// INITIALIZE RESOURCES MODULE


function initializeResourcesModule() {
    resourceContainer = document.getElementById("resourceContainer");
    resourceForm = document.getElementById("resourceForm");
    searchInput = document.getElementById("searchInput");
    resourceCount = document.getElementById("resourceCount");
    formMessage = document.getElementById("formMessage");

    if (
        !resourceContainer ||
        !resourceForm ||
        !searchInput ||
        !resourceCount
    ) {
        console.error("Resources module HTML elements not found.");
        return;
    }

    addResourceButton =
        document.getElementById("addResourceButton") ||
        resourceForm.querySelector('button[type="submit"]');

    const urlInput = document.getElementById("url");

    // Validate URL while typing
    if (urlInput) {
        urlInput.addEventListener("input", () => {
            urlInput.setCustomValidity("");

            if (
                urlInput.value.trim() &&
                !getSafeResourceUrl(urlInput.value)
            ) {
                urlInput.setCustomValidity(
                    "Enter a valid URL starting with http:// or https://."
                );
            }
        });
    }

    // Search
    searchInput.addEventListener("input", filterResources);
    searchInput.addEventListener("search", filterResources);

    // Form submission
    resourceForm.addEventListener("submit", addResource);

    // Load shared components and resources
    loadHeader();
    loadFooter();
    fetchResources();
}


if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeResourcesModule
    );
} else {
    initializeResourcesModule();
}
