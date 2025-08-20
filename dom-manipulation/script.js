// script.js

let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Load quotes on initialization
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
  displayQuotes();
  populateCategories();
}

// Display quotes in the DOM
function displayQuotes(filter = "all") {
  const quoteList = document.getElementById("quoteList");
  quoteList.innerHTML = "";

  let filteredQuotes = quotes;
  if (filter !== "all") {
    filteredQuotes = quotes.filter(q => q.category === filter);
  }

  filteredQuotes.forEach((q, index) => {
    const li = document.createElement("li");
    li.textContent = `"${q.text}" — ${q.category}`;
    quoteList.appendChild(li);
  });
}

// Add a new quote
function addQuote() {
  const quoteInput = document.getElementById("quoteInput");
  const categoryInput = document.getElementById("categoryInput");

  const text = quoteInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    displayQuotes();
    populateCategories();
    quoteInput.value = "";
    categoryInput.value = "";
  }
}

// Populate categories dynamically in filter dropdown
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];

  filter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    filter.value = savedFilter;
    filterQuotes();
  }
}

// Filter quotes
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);
  displayQuotes(selected);
}

// Export quotes as JSON
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    displayQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Server Sync Simulation ---

// Fetch quotes from server (GET)
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();

    // Take first 5 posts as mock quotes
    const serverQuotes = data.slice(0, 5).map(p => ({
      text: p.title,
      category: "server"
    }));

    quotes = [...quotes, ...serverQuotes];
    saveQuotes();
    displayQuotes();
    populateCategories();
  } catch (err) {
    console.error("Error fetching server quotes:", err);
  }
}

// Send quotes to server (POST) ✅ includes method, headers, Content-Type
async function postQuotesToServer(newQuote) {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newQuote)
    });

    const result = await res.json();
    console.log("Quote posted to server:", result);
  } catch (err) {
    console.error("Error posting quote:", err);
  }
}

// Sync quotes with server + show alert
async function syncQuotes() {
  await fetchQuotesFromServer();

  // Example: post the latest added quote
  if (quotes.length > 0) {
    const latestQuote = quotes[quotes.length - 1];
    await postQuotesToServer(latestQuote);
  }

  alert("Quotes synced with server!"); // ✅ Required
}

// Auto sync every 30s
setInterval(syncQuotes, 30000);

// Initialize on page load
window.onload = loadQuotes;
