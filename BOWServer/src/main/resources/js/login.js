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

        fetch("/api/login/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                email: email,
                password: password
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("loggedInUser", JSON.stringify({ email }));

                    window.location.href = "index.html";
                } else {
                    alert(data.error || "Login failed.");
                }
            })
            .catch(error => {
                console.error("Login error:", error);
                alert("An error occurred. Please try again.");
            });

    });
});
