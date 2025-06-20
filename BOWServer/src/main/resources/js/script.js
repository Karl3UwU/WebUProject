document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");

    searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            sessionStorage.setItem("searchTitle", query);
            window.location.href = "browse.html";
        }
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            searchBtn.click();
        }
    });
});