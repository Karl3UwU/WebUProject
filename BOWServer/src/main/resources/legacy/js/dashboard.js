let currentSuggestionPage = 0;
const suggestionsPerPage = 3;
let currentSuggestions = [];
let token = localStorage.getItem("token");
document.addEventListener("DOMContentLoaded", () => {
    checkAuthAndLoadSuggestions();

    fetch("/api/books/getAllSuggestions") // Make sure this endpoint returns all suggestions
        .then(res => res.json())
        .then(suggestions => {
            const container = document.getElementById("suggestionList");

            if (suggestions.length === 0) {
                container.innerHTML = "<p>No suggestions available.</p>";
                return;
            }

            currentSuggestions = suggestions;
            currentSuggestionPage = 0;
            renderNextSuggestionPage();


        })
        .catch(err => {
            console.error("Failed to load suggestions:", err);
        });
});

function renderNextSuggestionPage() {
    const start = currentSuggestionPage * suggestionsPerPage;
    const end = start + suggestionsPerPage;
    const toRender = currentSuggestions.slice(start, end);

    const container = document.getElementById("suggestionList");

    if (currentSuggestionPage === 0) {
        container.innerHTML = ""; // Clear on first load
    }

    toRender.forEach(suggestion => {
        const card = document.createElement("div");
        card.className = "suggestion-card";
        card.innerHTML = `
            <div class="suggestion-card-content">
                <h3>${suggestion.title}</h3>
                <p><strong>Author:</strong> ${suggestion.author}</p>
            </div>
            <button class="btn btn-secondary" data-id="${suggestion.title}&${suggestion.author}">Review</button>
        `;
        card.querySelector("button").addEventListener("click", () => {
            encodedTitle = encodeURIComponent(suggestion.title);
            encodedAuthor = encodeURIComponent(suggestion.author);
            window.location.href = `dashboard-suggestions.html?title=${encodedTitle}&author=${encodedAuthor}`;
        });
        container.appendChild(card);
    });

    currentSuggestionPage++;

    // Toggle visibility of the load more button
    const loadMoreBtn = document.getElementById("loadMoreSuggestionsBtn");
    if (currentSuggestionPage * suggestionsPerPage >= currentSuggestions.length) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "inline-flex";
    }
}
document.getElementById("loadMoreSuggestionsBtn").addEventListener("click", () => {
    renderNextSuggestionPage();
});

function checkAuthAndLoadSuggestions() {
    fetch("/api/auth/getUser", {
        method: "GET",
        headers: {
            "Authorization": token
        }
    })
        .then(response => {
            if (!response.ok) throw new Error("Unauthorized");
            return response.json();
        })
        .then(user => {
            if (user.role?.toLowerCase() !== "admin") {
                // User is either not logged in or not an admin
                window.location.href= "login.html"; // Redirect to an error page or login page
                return;
            }

            // User is valid and is admin
            renderNextSuggestionPage(); // Call your existing logic here
        })
        .catch(() => {
            window.location.href= "login.html"; // Redirect to login if auth fails
        });
}

