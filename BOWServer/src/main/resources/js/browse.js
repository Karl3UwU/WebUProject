let currentPage = 0;
const booksPerPage = 6;
let currentBooks = [];

window.addEventListener("DOMContentLoaded", () => {
    const storedGenre = sessionStorage.getItem("selectedGenre");
    const searchTitle = sessionStorage.getItem("searchTitle");
    if(searchTitle) {
        const titleInput = document.getElementById("filterTitle");
        const applyBtn = document.getElementById("applyFiltersBtn");

        if (titleInput) {
            titleInput.value = searchTitle;
            sessionStorage.removeItem("searchTitle");

            setTimeout(() => {
                applyBtn?.click(); // ✅ Simulate the user clicking Apply Filters
            }, 150);
        }
    }
    if (storedGenre) {
        const genreInput = document.getElementById("filterGenre"); // ✅ Corrected ID
        const applyBtn = document.getElementById("applyFiltersBtn"); // ✅ Also matches your button

        if (genreInput) {
            genreInput.value = storedGenre;
            sessionStorage.removeItem("selectedGenre");

            setTimeout(() => {
                applyBtn?.click(); // ✅ Simulate the user clicking Apply Filters
            }, 150);
        }
    }
});


function updatePageTitles(sort) {
    const title = document.getElementById("browseTitle");
    const subtitle = document.getElementById("browseSubtitle");

    switch (sort) {
        case "language":
            title.textContent = "Browse by Language";
            subtitle.textContent = "Explore books in different languages";
            break;
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

function loadFilteredBooks() {
    const title = document.getElementById("filterTitle").value.trim();
    const author = document.getElementById("filterAuthor").value.trim();
    const genre = document.getElementById("filterGenre").value.trim();
    const language = document.getElementById("filterLanguage").value.trim();
    const minRatingStr = document.getElementById("filterMinRating").value.trim();

    // Manually build query string with proper encoding
    const queryParts = [];

    if (title) queryParts.push(`title=${encodeURIComponent(title)}`);
    if (author) queryParts.push(`author=${encodeURIComponent(author)}`);
    if (genre) queryParts.push(`genre=${encodeURIComponent(genre)}`);
    if (language) queryParts.push(`language=${encodeURIComponent(language)}`);
    if (minRatingStr) {
        const minRating = parseFloat(minRatingStr);
        if (!isNaN(minRating)) {
            queryParts.push(`minRating=${encodeURIComponent(minRating)}`);
        }
    }

    const queryString = queryParts.join('&');
    const url = `/api/books/filter?${queryString}`;

    console.log("Final URL:", url);

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Failed to load books.");
            return response.json();
        })
        .then(books => {
            currentBooks = books;
            currentPage = 0;
            window.scrollTo({ top: 0, behavior: "smooth" });
            renderNextPage();
        })
        .catch(error => {
            console.error("Error loading books:", error);
        });
}


function renderNextPage() {
    const start = currentPage * booksPerPage;
    const end = start + booksPerPage;
    const booksToRender = currentBooks.slice(start, end);

    const grid = document.getElementById("browseGrid");

    if (currentPage === 0) {
        grid.innerHTML = "";
    }

    if (booksToRender.length === 0 && currentPage === 0) {
        grid.innerHTML = "<p>No books found.</p>";
        return;
    }

    booksToRender.forEach(book => {
        const card = document.createElement("div");
        card.className = "book-card";

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
        card.addEventListener("click", () => {
            window.location.href = `book.html?title=${encodeURIComponent(book.title)}`;
        });

        grid.appendChild(card);
    });

    currentPage++;

    // Hide "Load More" if all books are rendered
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (currentPage * booksPerPage >= currentBooks.length) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "inline-flex";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const sort = params.get("sort") || "all";

    document.getElementById("loadMoreBtn").addEventListener("click", () => {
        renderNextPage();
    });

    document.getElementById("applyFiltersBtn").addEventListener("click", () => {
        loadFilteredBooks();
    });


    updatePageTitles(sort);
    loadFilteredBooks(sort);
});



