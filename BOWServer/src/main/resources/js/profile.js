document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    const reviewsContainer = document.getElementById("userReviews");
    const userBooksContainer = document.getElementById("userBooks");
    const loadMoreReviews = document.getElementById("loadMoreReviews");
    const loadMoreBooks = document.getElementById("loadMoreBooks");
    const changePasswordBtn = document.getElementById("changePasswordBtn");

    let reviewPage = 0;
    let booksPage = 0;
    const pageSize = 3;

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    if (changePasswordBtn) {
        changePasswordBtn.addEventListener("click", () => {
            const oldPassword = prompt("Enter your current password:");
            if (!oldPassword) return;

            const newPassword = prompt("Enter your new password:");
            if (!newPassword) return;

            fetch(`/api/auth/changePassword?oldPassword=${encodeURIComponent(oldPassword)}&newPassword=${encodeURIComponent(newPassword)}`, {
                method: "GET",
                headers: {
                    "Authorization": token
                }
            })
                .then(res => {
                    if (!res.ok) throw new Error("Password change failed");
                    return res.json();
                })
                .then(response => {
                    alert(response.message || "Password changed successfully.");
                })
                .catch(err => {
                    console.error("Error changing password:", err);
                    alert("Failed to change password. Please check your current password.");
                });
        });
    }

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
            document.getElementById("userName").textContent = user.username || "User";
            document.getElementById("userEmail").textContent = `Email: ${user.email || ""}`;
            document.getElementById("userRole").textContent = `Role: ${user.role || ""}`;
            document.getElementById("userFullName").textContent = `Full Name: ${user.firstName || ""} ${user.lastName || ""}`;

            if (user.role?.toLowerCase() === "admin") {
                const dashboardBtn = document.getElementById("dashboardBtn");
                if (dashboardBtn) {
                    dashboardBtn.style.display = "inline-block";

                    dashboardBtn.addEventListener("click", () => {
                        window.location.href = "../dashboard.html";
                    });
                }
            }


            loadReviews(user.username);
            loadBooks();
        })
        .catch(() => {
            localStorage.removeItem("token");
            window.location.href = "login.html";
        });

    function loadReviews(username) {
        fetch("api/auth/getReviews", {
            method: "GET",
            headers: {
                "Authorization": token
            }
        })
            .then(response => response.json())
            .then(data => {
                const userReviews = data.filter(review => review.username === username);
                const paginatedReviews = userReviews.slice(reviewPage * pageSize, (reviewPage + 1) * pageSize);

                if (userReviews.length === 0 && reviewPage === 0) {
                    reviewsContainer.innerHTML = "<p>You haven't posted any reviews yet.</p>";
                    loadMoreReviews.style.display = "none";
                    return;
                }

                for (const review of paginatedReviews) {
                    const reviewDiv = document.createElement("div");
                    reviewDiv.className = "review-card";
                    reviewDiv.style.position = "relative";
                    reviewDiv.innerHTML = `
                    <button class="btn btn-secondary delete-review-btn" data-id="${review.bookId}" style="position:absolute;top:8px;right:8px;padding:4px 8px;">
                        <img src="images/trash.svg" alt="Delete" style="width:16px;height:16px;vertical-align:middle;">
                    </button>
                    <h3>${review.bookTitle}</h3>
                    <p><strong>Rating:</strong> ${review.rating}/10</p>
                    <p>${review.content}</p>
                `;

                    reviewDiv.querySelector(".delete-review-btn").addEventListener("click", () => {
                        if (confirm("Are you sure you want to delete this review?")) {
                            fetch(`/api/auth/deleteReview?bookId=${encodeURIComponent(review.bookId)}`, {
                                method: "GET",
                                headers: { "Authorization": token }
                            })
                                .then(res => res.json())
                                .then(() => {
                                    reviewDiv.remove();
                                })
                                .catch(err => {
                                    console.error("Error deleting review:", err);
                                    alert("Failed to delete review.");
                                });
                        }
                    });

                    reviewsContainer.appendChild(reviewDiv);
                }

                reviewPage++;
                loadMoreReviews.style.display = ((reviewPage * pageSize) < userReviews.length) ? "block" : "none";
            })
            .catch(error => console.error("Error loading reviews:", error));
    }


    function loadBooks() {
        fetch("/api/auth/getBookshelf", {
            method: "GET",
            headers: { "Authorization": token }
        })
            .then(response => response.json())
            .then(data => {
                const paginatedBooks = data.slice(booksPage * pageSize, (booksPage + 1) * pageSize);

                if (data.length === 0 && booksPage === 0) {
                    userBooksContainer.innerHTML = "<p>No books in your shelf yet.</p>";
                    loadMoreBooks.style.display = "none";
                    return;
                }

                for (const book of paginatedBooks) {
                    const bookDiv = document.createElement("div");
                    bookDiv.className = "book-card";
                    bookDiv.style.position = "relative";
                    bookDiv.innerHTML = `
                        <div style="position:absolute; top:8px; right:8px; display:flex; gap:4px;">
                            <button class="btn btn-secondary edit-book-btn" title="Edit Status" style="padding:4px 8px;">
                                <img src="images/edit.svg" alt="Edit" style="width:16px;height:16px;vertical-align:middle;">
                            </button>
                            <button class="btn btn-secondary delete-book-btn" title="Remove Book" style="padding:4px 8px;">
                                <img src="images/trash.svg" alt="Delete" style="width:16px;height:16px;vertical-align:middle;">
                            </button>
                        </div>
                        <h3>${book.title}</h3>
                        <p><strong>Author:</strong> ${book.author}</p>
                        <p><strong>Status:</strong> <span class="book-status">${book.Status}</span></p>
                    `;

                    bookDiv.querySelector(".edit-book-btn").addEventListener("click", () => {
                        const newStatus = prompt("Enter new status ('Reading', 'Completed', 'Wishlist'):", book.Status);
                        if (newStatus && newStatus !== book.Status) {
                            fetch(`/api/auth/editBookStatus?bookId=${book.bookId}&Status=${newStatus}`, {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": token
                                }
                            })
                                .then(res => {
                                    if (!res.ok) throw new Error("Edit failed");
                                    return res.json();
                                })
                                .then(() => {
                                    bookDiv.querySelector(".book-status").textContent = newStatus;
                                })
                                .catch(err => {
                                    console.error("Error editing book status:", err);
                                    alert("Failed to edit book status.");
                                });
                        }
                    });

                    bookDiv.querySelector(".delete-book-btn").addEventListener("click", () => {
                        if (confirm("Are you sure you want to remove this book from your shelf?")) {
                            fetch(`/api/auth/deleteBookFromShelf?bookId=${book.bookId}`, {
                                method: "GET",
                                headers: { "Authorization": token }
                            })
                                .then(res => {
                                    if (!res.ok) throw new Error("Delete failed");
                                    return res.json();
                                })
                                .then(() => {
                                    bookDiv.remove();
                                })
                                .catch(err => {
                                    console.error("Error deleting book:", err);
                                    alert("Failed to delete book.");
                                });
                        }
                    });

                    userBooksContainer.appendChild(bookDiv);
                }

                booksPage++;
                loadMoreBooks.style.display = ((booksPage * pageSize) < data.length) ? "block" : "none";
            })
            .catch(error => console.error("Error loading books:", error));
    }

    if (loadMoreReviews) {
        loadMoreReviews.addEventListener("click", () => {
            const username = document.getElementById("userName")?.textContent;
            if (username) loadReviews(username);
        });
    }

    if (loadMoreBooks) {
        loadMoreBooks.addEventListener("click", () => {
            loadBooks();
        });
    }
});
