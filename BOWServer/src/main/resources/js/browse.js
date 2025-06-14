function updatePageTitles(sort) {
    const title = document.getElementById("browseTitle");
    const subtitle = document.getElementById("browseSubtitle");

    switch (sort) {
        case "new":
            title.textContent = "New Releases";
            subtitle.textContent = "Check out the latest additions to our library";
            break;
        case "best":
            title.textContent = "Best Sellers";
            subtitle.textContent = "These books are loved by the community";
            break;
        case "genre":
            title.textContent = "Browse by Genre";
            subtitle.textContent = "Find books based on your favorite genres";
            break;
        default:
            title.textContent = "Browse Books";
            subtitle.textContent = "Explore our collection";
    }
}

function loadBooksBy(sort) {
    let url;

    switch (sort) {
        case "new":
            url = "/api/books?sort=new"; // Placeholder: update when backend supports this
            break;
        case "best":
            url = "/api/books?sort=best"; // Placeholder
            break;
        case "genre":
            url = "/api/books?sort=genre"; // Placeholder or could trigger local genre filter
            break;
        default:
            url = "/api/books/all"; // Load all books
    }
    console.log("balls", url); // ✅ Add this
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Failed to load books.");
            return response.json();
        })
        .then(books => {
            renderBooks(books);
        })
        .catch(error => {
            console.error("Error loading books:", error);
        });
}


function renderBooks(books) {
    console.log("Rendering books:", books); // ✅ Add this
    const grid = document.getElementById("browseGrid");
    grid.innerHTML = ""; // Clear previous books

    if (!books || books.length === 0) {
        grid.innerHTML = "<p>No books found.</p>";
        return;
    }

    books.forEach(book => {
        const card = document.createElement("div");
        card.className = "book-card"; // Ensure this class exists in your CSS

        const genreDisplay = book.genres
            .map(g => g.replace(/_/g, " ").toLowerCase())
            .map(g => g.charAt(0).toUpperCase() + g.slice(1))
            .join(", ");

        card.innerHTML = `
            <div class="book-card-content">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author"><strong>Author:</strong> ${book.author}</p>
                <p class="book-genres"><strong>Genres:</strong> ${genreDisplay}</p>
                <p class="book-language"><strong>Language:</strong> ${book.language}</p>
                <p class="book-pages"><strong>Pages:</strong> ${book.page_count}</p>
            </div>
        `;

        grid.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const sort = params.get("sort") || "all";

    updatePageTitles(sort);
    loadBooksBy(sort);
});



