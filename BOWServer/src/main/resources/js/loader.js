// loader.js - Updated loader script
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

            // Initialize header authentication after header is loaded
            if (file === "header.html") {
                initializeHeader();
            }
            if (file === "footer.html" && typeof initializeFooter === "function") {
                initializeFooter();
            }
        })
        .catch(err => console.error(err));
}

// Initialize header with authentication
function initializeHeader() {
    // Initialize mobile menu toggle if it exists
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Initialize authentication header manager
    if (typeof AuthHeaderManager !== 'undefined') {
        window.authHeaderManager = new AuthHeaderManager();
    }
}