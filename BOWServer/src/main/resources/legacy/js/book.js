let currentBook = null;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("addToProfileBtn").addEventListener("click", async () => {
        if (await isUserLoggedIn()) {
            const token = localStorage.getItem("token");
            try {
                const userRes = await fetch("/api/auth/getUser", {
                    method: "GET",
                    headers: {
                        "Authorization": token,
                        "Content-Type": "application/json"
                    }
                });

                if (!userRes.ok) throw new Error("User fetch failed");

                const user = await userRes.json();
                console.log("Current user:", user);
                const email = user.email;

                const response = await fetch(`/api/books/addToBookshelf?bookId=${currentBook.id}&email=${email}`, {
                    method: "GET",
                    headers: {
                        "Authorization": token,
                        "Content-Type": "application/json"
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Book successfully added to your profile!");
                } else {
                    console.error("Add to bookshelf failed:", data.error);
                    alert("Failed to add book to profile.");
                }
            } catch (err) {
                console.error("Error adding to profile:", err);
                alert("Error while adding book to profile.");
            }
        } else {
            window.location.href = "login.html";
        }
    });


    document.getElementById("addToGroupBtn").addEventListener("click", async () => {
        if (await isUserLoggedIn()) {
            // TODO: Add to reading group logic
        } else {
            window.location.href = "login.html";
        }
    });

    document.getElementById("writeReviewBtn").addEventListener("click", async () => {
        if (await isUserLoggedIn()) {
            const token = localStorage.getItem("token");

            try {
                // Get user details first
                const userRes = await fetch("/api/auth/getUser", {
                    method: "GET",
                    headers: {
                        "Authorization": token,
                        "Content-Type": "application/json"
                    }
                });

                if (!userRes.ok) throw new Error("User fetch failed");

                const user = await userRes.json();
                const email = user.email;

                // Ask user for review input
                const rating = prompt("Enter your rating (0-10):");
                if (!rating || isNaN(rating) || rating < 0 || rating > 10) {
                    alert("Please enter a valid rating between 0 and 10.");
                    return;
                }

                const reviewText = prompt("Write your review:");
                if (!reviewText || reviewText.trim() === "") {
                    alert("Review text cannot be empty.");
                    return;
                }

                const response = await fetch(
                    `/api/books/writeReview?bookId=${currentBook.id}&email=${encodeURIComponent(email)}&rating=${rating}&review=${encodeURIComponent(reviewText)}`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": token,
                            "Content-Type": "application/json"
                        }
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    alert("Review submitted successfully!");
                } else {
                    console.error("Review submission failed:", data.error);
                    alert("Failed to submit review.");
                }

            } catch (err) {
                console.error("Error writing review:", err);
                alert("An error occurred while submitting your review.");
            }

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
            currentBook = book;
            console.log("Loaded book:", book);
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

async function isUserLoggedIn() {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
        const res = await fetch("/api/auth/verify-token", {
            method: "GET",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) return false;

        const isValid = await res.json();
        return isValid === true;
    } catch (error) {
        console.error("Token verification failed:", error);
        return false;
    }
}


