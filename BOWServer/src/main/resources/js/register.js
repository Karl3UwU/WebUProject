document.addEventListener("DOMContentLoaded", () => {
    loadHTML("header.html", "#header");
    loadHTML("footer.html", "#footer");

    const form = document.getElementById("registerForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const errors = [];

        // Basic validation
        if (!username) errors.push("Username is required.");
        if (!email || !/\S+@\S+\.\S+/.test(email)) errors.push("Valid email is required.");
        if (!password || password.length < 6) errors.push("Password must be at least 6 characters.");
        if (password !== confirmPassword) errors.push("Passwords do not match.");

        if (errors.length > 0) {
            alert(errors.join("\n"));
            return;
        }

        const userData = { username, email, password };
        console.log("Registered User:", userData);

        // Optional: Save to backend here

        // Redirect after success
        window.location.href = "index.html";
    });
});
