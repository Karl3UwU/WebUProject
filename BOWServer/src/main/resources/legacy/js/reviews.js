let currentPage = 0;
const reviewsPerPage = 3;
let currentReviews = [];

document.addEventListener("DOMContentLoaded", () => {
    const bookTitleInput = document.getElementById("bookTitle");
    const reviewerInput = document.getElementById("reviewerName");
    const applyBtn = document.getElementById("applyReviewFilters");

    applyBtn.addEventListener("click", () => {
        loadReviews(bookTitleInput.value.trim(), reviewerInput.value.trim());
    });

    document.getElementById("loadMoreReviewsBtn").addEventListener("click", () => {
        renderNextReviewPage();
    });

    loadReviews();
});

function loadReviews(bookTitle = "", reviewer = "") {
    let url = "/api/reviews/filter";
    const params = new URLSearchParams();

    if (bookTitle) params.append("bookTitle", bookTitle);
    if (reviewer) params.append("username", reviewer);

    if ([...params].length > 0) {
        url += "?" + params.toString();
    }

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("Failed to load reviews.");
            return res.json();
        })
        .then(reviews => {
            currentReviews = reviews;
            currentPage = 0;
            window.scrollTo({ top: 0, behavior: "smooth" });

            const list = document.getElementById("reviewsList");
            list.innerHTML = ""; // clear previous

            renderNextReviewPage();
        })
        .catch(err => console.error("Error:", err));
}

function renderNextReviewPage() {
    const list = document.getElementById("reviewsList");
    const start = currentPage * reviewsPerPage;
    const end = start + reviewsPerPage;
    const reviewsToRender = currentReviews.slice(start, end);

    if (reviewsToRender.length === 0 && currentPage === 0) {
        list.innerHTML = "<p>No reviews found.</p>";
        return;
    }

    reviewsToRender.forEach(review => {
        const stars = getStarRating(review.rating);

        const card = document.createElement("div");
        card.className = "review-card";

        card.innerHTML = `
            <h3>${review.title}</h3>
            <p class="reviewer"><strong>Reviewer:</strong> ${review.username}</p>
            <p class="review-content">${review.content}</p>
            <p class="review-rating">${stars}</p>
        `;

        list.appendChild(card);
    });

    currentPage++;

    const loadMoreBtn = document.getElementById("loadMoreReviewsBtn");
    if (currentPage * reviewsPerPage >= currentReviews.length) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "inline-flex";
    }
}

function getStarRating(rating) {
    if (rating == null) return "";

    let starHtml = "";

    for (let i = 1; i <= 10; i++) {
        if (i <= rating) {
            starHtml += "★";
        } else {
            starHtml += "☆";
        }
    }

    return starHtml;
}


