// doubts-board module
const API_URL = "https://fresher-hub-api-cloudus.onrender.com/doubts";

const doubtForm = document.getElementById("doubt-form");
const doubtInput = document.getElementById("doubt-input");
const doubtTopic = document.getElementById("doubt-topic");
const doubtsList = document.getElementById("doubts-list");
const filterButtons = document.querySelectorAll(".filter-btn");

let allDoubts = [];
let currentFilter = "all";
let errorMessage = "";

// helper clean
function escapeHTML(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// helper error showing
function showFormError(message) {
  const errorEl = document.getElementById("doubt-error");
  if (!errorEl) return;

  if (message) {
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  } else {
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
  }
}

async function fetchDoubts() {
  try {
    const response = await axios.get(API_URL);
    allDoubts = response.data;
    showFormError("");
    renderDoubts();
  } catch (error) {
    console.error("Failed to fetch doubts:", error);
    doubtsList.innerHTML = `<p class="text-red-600 text-center py-4">Failed to load doubts.</p>`;
  }
}

function renderDoubts() {
  const filteredDoubts = [...allDoubts].reverse().filter((doubt) => {
    if (currentFilter === "open") return doubt.status === "open";
    if (currentFilter === "solved") return doubt.status === "solved";
    return true;
  });

  if (filteredDoubts.length === 0) {
    doubtsList.innerHTML = `<p class="text-sm text-slate-500">No doubts found.</p>`;
    return;
  }

  doubtsList.innerHTML = filteredDoubts
    .map((doubt) => {
      const isSolved = doubt.status === "solved";

      return `
        <article class="mb-3">
          <div
            class="block bg-primaryLight hover:bg-primaryHover border border-primaryBorder rounded-lg p-4 transition"
          >
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div class="flex-1 min-w-0">
                <p class="max-h-20 overflow-y-auto bg-white/80 rounded px-3 py-2 text-base font-semibold">
                  ${escapeHTML(doubt.text)}
                </p>
                <footer class="mt-2 text-xs text-slate-600 shrink-0">
                  ${escapeHTML(doubt.topic)} &middot; ${escapeHTML(doubt.date)}
                </footer>
              </div>

              <div class="flex flex-row items-center justify-between md:justify-end gap-2 shrink-0">
                <span class="px-3 py-2 text-xs leading-6 font-medium border border-slate-300 rounded bg-white">
                  ${isSolved ? "Solved" : "Open"}
                </span>
                ${
                  !isSolved
                    ? `<button
                        type="button"
                        data-id="${escapeHTML(doubt.id)}"
                        class="solve-btn px-3 py-2 text-xs leading-6 font-medium border border-slate-300 rounded bg-white hover:bg-slate-100 transition cursor-pointer"
                      >
                        Mark solved
                      </button>`
                    : ""
                }
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

// Post a new doubt (POST)
doubtForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = doubtInput.value.trim();
  const topic = doubtTopic.value;
  if (!text) return;

  const submitBtn = doubtForm.querySelector('button[type="submit"]');
  if (submitBtn && submitBtn.disabled) return;

  const originalBtnText = submitBtn ? submitBtn.textContent : "Post Doubt";

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const newDoubt = {
    text,
    topic,
    date: today,
    status: "open",
  };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Posting...";
  }

  try {
    const response = await axios.post(API_URL, newDoubt);
    allDoubts.push(response.data);
    showFormError("");
    doubtForm.reset();
    renderDoubts();
  } catch (error) {
    console.error("Failed to post doubt:", error);
    showFormError("Failed to post doubt.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  }
});

// Filter buttons (All / Open / Solved)
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    errorMessage = "";

    filterButtons.forEach((b) => {
      const isActive = b === btn;
      b.classList.toggle("bg-primary", isActive);
      b.classList.toggle("text-white", isActive);
      b.classList.toggle("bg-white", !isActive);
      b.classList.toggle("text-text", !isActive);
      b.style.backgroundColor = isActive ? "var(--primary)" : "";
    });

    renderDoubts();
  });
});

// Mark doubt as solved (PATCH)
doubtsList.addEventListener("click", async (e) => {
  const solveBtn = e.target.closest(".solve-btn");
  if (!solveBtn) return;
  const id = solveBtn.dataset.id;

  try {
    await axios.patch(`${API_URL}/${id}`, { status: "solved" });
    allDoubts = allDoubts.map((doubt) =>
      String(doubt.id) === String(id) ? { ...doubt, status: "solved" } : doubt,
    );
    showFormError("");
    renderDoubts();
  } catch (error) {
    console.error("Failed to mark doubt as solved:", error);
    showFormError("Failed to update doubt status.");
  }
});

fetchDoubts();