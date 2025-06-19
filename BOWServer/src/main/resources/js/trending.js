document.addEventListener("DOMContentLoaded", () => {
    const booksGrid = document.getElementById("booksGrid");

    fetch("/api/books/trending")
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch trending books");
            return response.json();
        })
        .then(books => {
            // Clear the grid
            booksGrid.innerHTML = "";

            books.forEach(book => {
                const card = document.createElement("div");
                card.className = "book-card"; // ✅ Use the reusable book-card style
                card.style.cursor = "pointer";

                const genreDisplay = book.genres
                    ?.map(g => g.replace(/_/g, " ").toLowerCase())
                    .map(g => g.charAt(0).toUpperCase() + g.slice(1))
                    .join(", ") || "Various";

                const avgRating = book.rating?.toFixed(1) ?? "N/A";
                const author = book.author ?? "Unknown Author";

                card.innerHTML = `
                    <div class="book-card-content">
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-author"><strong>Author:</strong> ${author}</p>
                        <p class="book-genres"><strong>Genres:</strong> ${genreDisplay}</p>
                        <p class="book-rating"><strong>Rating:</strong> ${avgRating}</p>
                    </div>
                `;

                card.addEventListener("click", () => {
                    window.location.href = `book.html?title=${encodeURIComponent(book.title)}`;
                });

                booksGrid.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error fetching trending books:", error);
            booksGrid.innerHTML = "<p>Failed to load trending books.</p>";
        });
});
