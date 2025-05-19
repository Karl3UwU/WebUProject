document.addEventListener("DOMContentLoaded", () => {
  const googleLoginBtn = document.querySelector(".google-login");
  const accountLoginBtn = document.querySelector(".account-login");
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  
  // Google login button
  googleLoginBtn.addEventListener("click", () => {
    // In a real app, you would implement Google OAuth
    console.log("Google login clicked");
    // Simulating redirect for now
    window.location.href = "browsing_page.html";
  });
  
  // Account login button
  accountLoginBtn.addEventListener("click", () => {
    modalTitle.textContent = "Login";
    modalBody.innerHTML = `
      <form id="login-form">
        <label for="login-username">Username:</label><br>
        <input type="text" id="login-username" name="username" required><br><br>
        
        <label for="login-password">Password:</label><br>
        <input type="password" id="login-password" name="password" required><br><br>
        
        <button type="submit">Login</button>
        <p id="login-error" style="color: red; display: none;"></p>
      </form>
    `;
    
    modal.style.display = "block";
    
    // Add form submission handler
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("login-username").value;
      const password = document.getElementById("login-password").value;
      const loginError = document.getElementById("login-error");
      
      // Basic form validation
      if (!username || !password) {
        loginError.textContent = "Please fill in all fields";
        loginError.style.display = "block";
        return;
      }
      
      // Create form data to send to server
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      
      // Send login request to servlet
      fetch("/WebUProject/src/main/java/com/WebUProject/servlets/LoginServlet.java", {  // Update this path to match your deployment context
        method: "POST",
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Store user info in session storage
          sessionStorage.setItem("user", JSON.stringify(data.user));
          // Redirect to browsing page
          window.location.href = "browsing_page.html";
        } else {
          // Show error message
          loginError.textContent = data.message || "Login failed. Please try again.";
          loginError.style.display = "block";
        }
      })
      .catch(error => {
        console.error("Login error:", error);
        loginError.textContent = "An error occurred. Please try again later.";
        loginError.style.display = "block";
      });
    });
  });
});