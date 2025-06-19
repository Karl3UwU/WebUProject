let lastTitle = "";
let lastAuthor = "";

document.addEventListener("DOMContentLoaded", () => {
    const shuffleBtn = document.getElementById("shuffleBtn");
    const bookResult = document.getElementById("bookResult");
    const addToSiteDiv = document.getElementById("addToSite");
    const addToSiteBtn = document.getElementById("addToSiteBtn");
    addToSiteBtn.addEventListener("click", () => {
        const url = new URL("/submissions.html", window.location.origin);
        url.searchParams.append("title", lastTitle);
        url.searchParams.append("author", lastAuthor);
        window.location.href = url.toString();
    });

    addToSiteDiv.style.display = "none";

    shuffleBtn.addEventListener("click", async () => {
        const genre = document.getElementById("genreSelect").value;
        bookResult.innerHTML = "Loading...";

        addToSiteDiv.style.display = "none";

        setTimeout(() => {
            addToSiteDiv.style.display = "block";
        }, 2000);

        try {
            const subject = genre.toLowerCase().replace(/\s+/g, "_");
            const url = `https://openlibrary.org/subjects/${subject}.json?limit=50`;

            const response = await fetch(url);
            const data = await response.json();

            if (!data.works || data.works.length === 0) {
                bookResult.innerHTML = "No books found in this genre.";
                return;
            }

            const randomBook = data.works[Math.floor(Math.random() * data.works.length)];
            const title = randomBook.title;
            const author = randomBook.authors?.[0]?.name || "Unknown";
            lastTitle = title;
            lastAuthor = author;

            const coverId = randomBook.cover_id;
            const link = `https://openlibrary.org${randomBook.key}`;

            // Fetch full work data for the description
            const workResponse = await fetch(`https://openlibrary.org${randomBook.key}.json`);
            const workData = await workResponse.json();

            let description = "No description available.";
            if (typeof workData.description === "string") {
                description = workData.description;
            } else if (typeof workData.description === "object" && workData.description.value) {
                description = workData.description.value;
            }


            const coverImg = coverId
                ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
                : "images/book-placeholder.png";

            bookResult.innerHTML = `
                <div class="book-card" onclick="window.open('${link}', '_blank')">
                    <img src="${coverImg}" alt="${title} Cover">
                    <div class="book-info">
                        <h3>${title}</h3>
                        <p class="author">by ${author}</p>
                        <p class="description">${description}</p>
                    </div>
                </div>
            `;

        } catch (err) {
            console.error(err);
            bookResult.innerHTML = "An error occurred while fetching the book.";
        }
    });
});
