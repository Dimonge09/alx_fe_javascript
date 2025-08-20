// Quotes array
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Resilience" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// Show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Clear previous content
  quoteDisplay.textContent = "";

  // Create elements dynamically
  const quoteText = document.createElement("p");
  quoteText.textContent = randomQuote.text;

  const quoteCategory = document.createElement("span");
  quoteCategory.textContent = ` (${randomQuote.category})`;

  // Append to display
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}

newQuoteBtn.addEventListener("click", showRandomQuote);

// Add new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newQuote = {
    text: textInput.value.trim(),
    category: categoryInput.value.trim()
  };

  if (newQuote.text && newQuote.category) {
    quotes.push(newQuote);

    // Show confirmation without innerHTML
    const confirmation = do
