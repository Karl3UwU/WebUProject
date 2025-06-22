document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const token = localStorage.getItem("token");

    const prefillTitle = params.get("title");
    const prefillAuthor = params.get("author");
    const prefillLanguage = params.get("language");
    const prefillPageCount = params.get("page_count");
    const prefillGenres = params.get("genres");

    if (prefillTitle) {
        const titleField = document.getElementById("title");
        if (titleField) titleField.value = prefillTitle;
    }

    if (prefillAuthor) {
        const authorField = document.getElementById("author");
        if (authorField) authorField.value = prefillAuthor;
    }

    if (prefillLanguage) {
        const languageField = document.getElementById("language");
        if (languageField) languageField.value = prefillLanguage;
    }

    if (prefillPageCount) {
        const pageCountField = document.getElementById("page_count");
        if (pageCountField) pageCountField.value = prefillPageCount;
    }

    if (prefillGenres) {
        const genresField = document.getElementById("genres");
        if (genresField) genresField.value = prefillGenres;
    }

    // Submit handler (already existing)
    document.getElementById("submissionForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        const title = document.getElementById("title").value.trim();
        const author = document.getElementById("author").value.trim();
        const language = document.getElementById("language").value.trim();
        const pageCount = document.getElementById("page_count").value.trim();
        const genres = document.getElementById("genres").value.trim();
            // .split(",")
            // .map(g => g.trim().toUpperCase())
            // .filter(g => g !== "");

        // Manually construct query string
        let query = `title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&language=${encodeURIComponent(language)}&page_count=${encodeURIComponent(pageCount)}&genres=${encodeURIComponent(genres)}`;

        // Append each genre as a separate genres parameter
        // for (const genre of genres) {
        //     query += `&genres=${encodeURIComponent(genre)}`;
        // }

        try {
            console.log("Posting suggestion with query:", query);
            const res = await fetch(`/api/books/postSuggestion?${query}`, {
                method: "GET",
                headers: {
                    "Authorization": token
                }
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message || "Book has been posted to catalog!");
                window.location.href = "dashboard.html";
                // delete the suggestion from the database

                await fetch(`/api/books/deleteSuggestion?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`, {
                    method: "GET",
                    headers: {
                        "Authorization": token
                    }
                });
            } else {
                alert("Failed to post book: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            console.error("Error posting suggestion:", err);
            alert("An error occurred while posting the suggestion.");
        }
    });


    // Add delete button event listener
    const deleteBtn = document.getElementById("deleteSuggestionBtn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
            if (!confirm("Are you sure you want to delete this suggestion?")) return;

            const title = document.getElementById("title").value.trim();
            const author = document.getElementById("author").value.trim();

            if (!title || !author) {
                alert("Both title and author are required to delete.");
                return;
            }

            try {
                const res = await fetch(`/api/books/deleteSuggestion?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`, {
                    method: "GET",
                    headers: {
                        "Authorization": token
                    }
                });

                let data;
                try {
                    data = await res.json();
                } catch {
                    data = {};
                }

                if (res.ok) {
                    alert(data.message || "Suggestion deleted successfully.");
                    window.location.href = "dashboard.html";
                } else {
                    alert("Failed to delete suggestion: " + (data.error || "Unknown error"));
                }
            } catch (err) {
                console.error("Error deleting suggestion:", err);
                alert("An error occurred while deleting the suggestion.");
            }
        });
    }
});
