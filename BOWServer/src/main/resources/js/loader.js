document.addEventListener("DOMContentLoaded", () => {
    loadHTML("header.html", "#header");
    loadHTML("footer.html", "#footer");
});

function loadHTML(file, selector) {
    fetch(file)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${file}`);
            return response.text();
        })
        .then(data => {
            document.querySelector(selector).innerHTML = data;

            // Call initializer if defined inside loaded HTML
            if (file === "header.html" && typeof initializeHeader === "function") {
                initializeHeader();
            }
            if (file === "footer.html" && typeof initializeFooter === "function") {
                initializeFooter();
            }
        })
        .catch(err => console.error(err));
}
