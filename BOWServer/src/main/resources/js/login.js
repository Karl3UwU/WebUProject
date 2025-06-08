document.addEventListener("DOMContentLoaded", () => {
    loadHTML("header.html", "#header");
    loadHTML("footer.html", "#footer");

    const form = document.getElementById("loginForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const errors = [];

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            errors.push("Valid email is required.");
        }

        if (!password) {
            errors.push("Password is required.");
        }

        if (errors.length > 0) {
            alert(errors.join("\n"));
            return;
        }

        const loginData = { email, password };
        console.log("Logging in with:", loginData);

        // Example: simulate successful login
        // fetch("/api/login", {...})

        localStorage.setItem("loggedInUser", JSON.stringify({ email }));

        // Redirect to home if successful
        window.location.href = "index.html";
    });
});
