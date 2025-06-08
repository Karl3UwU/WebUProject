function updatePageTitles(sort) {
    const title = document.getElementById("browseTitle");
    const subtitle = document.getElementById("browseSubtitle");

    switch (sort) {
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

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const sort = params.get("sort") || "all";

    updatePageTitles(sort);
    loadBooksBy(sort); // Your function to fetch/render books by criteria
});

