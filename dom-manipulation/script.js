// Load quotes from localStorage or defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { id: 1, text: "The best way to get started is to quit talking and begin doing.", category: "Motivation", updatedAt: Date.now() },
  { id: 2, text: "Don’t let yesterday take up too much of today.", category: "Wisdom", updatedAt: Date.now() },
  { id: 3, text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Resilience", updatedAt: Date.now() }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.createElement("div");
syncStatus.id = "syncStatus";
document.body.appendChild(syncStatus);

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ---------- UI Helpers ----------
function setStatus(msg) {
  syncStatus.textContent = "🔄 " + msg;
}

// ---------- Filtering ----------
function populateCategories() {
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) categoryFilter.value = savedFilter;
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);

  quoteDisplay.textContent = "";

  let filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "⚠️ No quotes available for this category.";
    return;
  }

  filtered.forEach(q => {
    const quoteText = document.createElement("p");
    quoteText.textContent = q.text;
    const quoteCategory = document.createElement("span");
    quoteCategory.textContent = ` (${q.category})`;

    const quoteBlock = document.createElement("div");
    quoteBlock.appendChild(quoteText);
    quoteBlock.appendChild(quoteCategory);

    quoteDisplay.appendChild(quoteBlock);
  });
}

// ---------- Add Quote ----------
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newQuote = {
    id: Date.now(), // unique ID
    text: textInput.value.trim(),
    category: categoryInput.value.trim(),
    updatedAt: Date.now()
  };

  if (newQuote.text && newQuote.category) {
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    filterQuotes();

    // Sync to server
    syncToServer(newQuote);

    textInput.value = "";
    categoryInput.value = "";
  }
}

// ---------- Server Sync ----------
async function fetchFromServer() {
  try {
    setStatus("Fetching updates...");
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await res.json();

    // Simulate server returning quotes [{id, text, category, updatedAt}]
    // For demo, map first 5 posts
    const serverQuotes = serverData.slice(0, 5).map((p, i) => ({
      id: p.id,
      text: p.title,
      category: ["Motivation", "Wisdom", "Resilience"][i % 3],
      updatedAt: Date.now()
    }));

    // Conflict resolution: server always wins
    serverQuotes.forEach(sq => {
      const localIndex = quotes.findIndex(lq => lq.id === sq.id);
      if (localIndex === -1) {
        quotes.push(sq); // add new
      } else {
        if (sq.updatedAt > quotes[localIndex].updatedAt) {
          quotes[localIndex] = sq; // overwrite with server version
        }
      }
    });

    saveQuotes();
    populateCategories();
    filterQuotes();
    setStatus("Data synced with server ✅");
  } catch (error) {
    setStatus("Failed to fetch from server ❌");
    console.error(error);
  }
}

async function syncToServer(quote) {
  try {
    setStatus("Syncing new quote...");
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-Type": "application/json" }
    });
    setStatus("Quote synced with server ✅");
  } catch (error) {
    setStatus("Failed to sync to server ❌");
    console.error(error);
  }
}

// ---------- Add Form ----------
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// ---------- Init ----------
createAddQuoteForm();
populateCategories();
filterQuotes();
fetchFromServer(); // fetch once on load
setInterval(fetchFromServer, 30000); // auto-sync every 30s
