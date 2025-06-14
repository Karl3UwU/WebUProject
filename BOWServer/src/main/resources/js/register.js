document.addEventListener("DOMContentLoaded", () => {
    loadHTML("header.html", "#header");
    loadHTML("footer.html", "#footer");

    const form = document.getElementById("registerForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
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

        try {
            const userData = { username, firstName, lastName, email, password };
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            })

            if(!response) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('User registered successfully:', result);
        } catch (error) {
            console.error('Error registering user:', error);
        }


        window.location.href = "index.html";
    });
});