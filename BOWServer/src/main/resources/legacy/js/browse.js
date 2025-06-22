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
                applyBtn?.click();
            }, 150);
        }
    }
    if (storedGenre) {
        const genreInput = document.getElementById("filterGenre");
        const applyBtn = document.getElementById("applyFiltersBtn");

        if (genreInput) {
            genreInput.value = storedGenre;
            sessionStorage.removeItem("selectedGenre");

            setTimeout(() => {
                applyBtn?.click();
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
            console.log("Books loaded:", books);
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
document.addEventListener("DOMContentLoaded", () => {
    const exportBtn = document.getElementById("exportBooksBtn");
    if (!exportBtn) return;

    exportBtn.addEventListener("click", () => {
        if (!currentBooks || currentBooks.length === 0) {
            alert("There are no books to export.");
            return;
        }

        const headers = ["Title", "Author", "Genres", "Language", "Pages"];
        const rows = currentBooks.map(book => [
            book.title,
            book.author,
            book.genres.join(", "),
            book.language,
            book.page_count
        ]);

        exportCSV("filtered_books.csv", headers, rows);
    });

    function exportCSV(filename, headers, rows) {
        const csvContent = [headers.join(","), ...rows.map(row =>
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )].join("\n");

        const BOM = "\uFEFF"; // UTF-8 BOM to help Excel
        const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const exportDocBookBtn = document.getElementById("exportDocBookBtn");
    if (!exportDocBookBtn) return;

    exportDocBookBtn.addEventListener("click", () => {
        if (!currentBooks || currentBooks.length === 0) {
            alert("There are no books to export.");
            return;
        }

        exportDocBook("filtered_books.docbook.xml", currentBooks);
    });

    function exportDocBook(filename, books) {
        const header = `<?xml version="1.0" encoding="UTF-8"?>
<book xmlns="http://docbook.org/ns/docbook" version="5.0">
  <title>Filtered Book List</title>
  <chapter>
    <title>Books</title>
    <itemizedlist>`;

        const items = books.map(book => `
      <listitem>
        <para><emphasis>${escapeXml(book.title)}</emphasis> by ${escapeXml(book.author)} (${escapeXml(book.genres.join(", "))}, ${escapeXml(book.language)}) - ${book.page_count} pages</para>
      </listitem>`).join("");

        const footer = `
    </itemizedlist>
  </chapter>
</book>`;

        const fullXml = header + items + footer;

        const blob = new Blob([fullXml], { type: "application/xml;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    // Basic XML escape function to avoid invalid XML characters
    function escapeXml(unsafe) {
        return unsafe.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }
});

