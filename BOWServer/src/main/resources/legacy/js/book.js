document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("addToProfileBtn").addEventListener("click", () => {
        if (isUserLoggedIn()) {
            // TODO: Add to bookshelf logic
        } else {
            window.location.href = "login.html";
        }
    });

    document.getElementById("addToGroupBtn").addEventListener("click", () => {
        if (isUserLoggedIn()) {
            // TODO: Add to reading group logic
        } else {
            window.location.href = "login.html";
        }
    });

    document.getElementById("writeReviewBtn").addEventListener("click", () => {
        if (isUserLoggedIn()) {
            // TODO: Write review logic
        } else {
            window.location.href = "login.html";
        }
    });
    const params = new URLSearchParams(window.location.search);
    const title = params.get("title");

    if (!title) return;

    fetch(`/api/books/filter?title=${encodeURIComponent(title)}`)
        .then(res => res.json())
        .then(books => {
            const book = books[0];
            if (!book) {
                document.querySelector("main").innerHTML = "<p>Book not found.</p>";
                return;
            }

            renderBookInfo(book);
            loadReviews(book.title);
        })
        .catch(err => console.error("Failed to load book:", err));
});

function renderBookInfo(book) {
    document.getElementById("bookTitle").textContent = book.title;
    document.getElementById("bookAuthor").textContent = book.author;
    document.getElementById("bookLanguage").textContent = book.language;
    document.getElementById("bookGenres").textContent = book.genres.join(", ");
    document.getElementById("bookPages").textContent = book.page_count;
    document.getElementById("bookRating").textContent = book.rating?.toFixed(1) || "N/A";

    fetchCoverByTitle(book.title)
        .then(coverUrl => {
            document.getElementById("bookCover").src = coverUrl;
        })
        .catch(() => {
            document.getElementById("bookCover").src = "images/default-cover.jpg";
        });
}

async function fetchCoverByTitle(title) {
    const res = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`);
    const data = await res.json();

    if (data.docs.length > 0 && data.docs[0].cover_i) {
        const coverId = data.docs[0].cover_i;
        return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
    }

    return "images/default-cover.jpg";
}


function loadReviews(bookTitle) {
    const reviewsList = document.getElementById("reviewsList");
    fetch(`/api/reviews/filter?bookTitle=${encodeURIComponent(bookTitle)}`)
        .then(res => res.json())
        .then(reviews => {
            if (reviews.length === 0) {
                reviewsList.innerHTML = "<p>No reviews yet.</p>";
                return;
            }

            reviews.forEach(review => {
                const card = document.createElement("div");
                card.className = "review-card";
                card.innerHTML = `
                    <h3>${review.title}</h3>
                    <p><strong>Reviewer:</strong> ${review.username}</p>
                    <p>${review.content}</p>
                    <p>${getStarRating(review.rating)}</p>
                `;
                reviewsList.appendChild(card);
            });
        })
        .catch(err => console.error("Failed to load reviews:", err));
}

function getStarRating(rating) {
    if (!rating) return "";
    return "★".repeat(Math.round(rating)) + "☆".repeat(10 - Math.round(rating));
}

function isUserLoggedIn() {
    // TODO: Replace this logic with your actual auth check
    // Example: return Boolean(sessionStorage.getItem("userToken"));
    // Or call /api/auth/status and cache the result
    return false; // Simulating a not-logged-in user
}

