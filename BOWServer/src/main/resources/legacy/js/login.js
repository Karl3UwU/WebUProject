// login.js - Updated login script
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

        fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(loginData)
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to login.");
                return response.json();
            })
            .then(data => {
                console.log("Login response:", data);
                if (data && data.authToken) {
                    localStorage.setItem("token", data.authToken);

                    window.location.href = "index.html";
                } else {
                    alert(data.message || "Login failed.");
                }
            })
            .catch(error => {
                console.error("Login error:", error);
                alert("An error occurred. Please try again.");
            });
    });
});