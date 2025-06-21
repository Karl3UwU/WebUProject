document.addEventListener("DOMContentLoaded", () => {
    loadHTML("header.html", "#header");
    loadHTML("footer.html", "#footer");

    const genreInfoIcon = document.getElementById("genreInfo");
    const genreList = document.getElementById("genreList");

    if (genreInfoIcon && genreList) {
        genreInfoIcon.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent outside click from closing immediately
            genreList.style.display = genreList.style.display === "block" ? "none" : "block";
        });
        // Hide the genre list when clicking outside
        document.addEventListener("click", (e) => {
            if (!genreList.contains(e.target) && e.target !== genreInfoIcon) {
                genreList.style.display = "none";
            }
        });
    }
    const form = document.getElementById("submissionForm");

    const urlParams = new URLSearchParams(window.location.search);
    const prefillTitle = urlParams.get("title");
    const prefillAuthor = urlParams.get("author");

    if (prefillTitle) {
        const titleField = document.getElementById("title");
        if (titleField) titleField.value = prefillTitle;
    }

    if (prefillAuthor) {
        const authorField = document.getElementById("author");
        if (authorField) authorField.value = prefillAuthor;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("title").value.trim();
        const author = document.getElementById("author").value.trim();
        const language = document.getElementById("language")?.value.trim();
        const pageCountStr = document.getElementById("page_count")?.value.trim();
        const genresInput = document.getElementById("genres")?.value.trim();

        const errors = [];
        if (!title) errors.push("Title is required.");
        if (!author) errors.push("Author is required.");
        if (errors.length > 0) {
            alert(errors.join("\n"));
            return;
        }

        // Prepare form data as URLSearchParams
        const formData = new URLSearchParams();
        formData.append("title", title);
        formData.append("author", author);
        if (language) formData.append("language", language);
        if (pageCountStr) formData.append("page_count", parseInt(pageCountStr));
        if (genresInput) {
            const genres = genresInput.split(",").map(g => g.trim()).filter(g => g);
            for (const genre of genres) {
                formData.append("genres", genre);
            }
        }

        try {
            const response = await fetch("/api/books/suggest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString()
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message || "Book suggestion submitted successfully!");
                form.reset();
            } else {
                alert(result.error || "An error occurred while submitting the suggestion.");
            }
        } catch (err) {
            console.error("Submission failed:", err);
            alert("An unexpected error occurred.");
        }
    });
});
