document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  const closeModal = document.getElementById("close-modal");

  document.getElementById("terms-link").addEventListener("click", () => {
    modalTitle.textContent = "Terms of Service";
    modalBody.textContent = "Noone reads the 'Terms of Service' anyway. So we will not be held responsible for anything.";
    modal.style.display = "block";
  });

  document.getElementById("privacy-link").addEventListener("click", () => {
    modalTitle.textContent = "Privacy Policy";
    modalBody.textContent = "The 'Privacy Policy' is that there is no Privacy Policy. We WILL use your data.";
    modal.style.display = "block";
  });

  document.getElementById("register-link").addEventListener("click", () => {
    modalTitle.textContent = "Register";
    modalBody.innerHTML = `
      <form id="registration-form">
        <label for="username">Username:</label><br>
        <input type="text" id="username" name="username" required><br><br>

        <label for="email">Email:</label><br>
        <input type="email" id="email" name="email" required><br><br>

        <label for="password">Password:</label><br>
        <input type="password" id="password" name="password" required><br><br>

        <label for="confirm-password">Confirm Password:</label><br>
        <input type="confirm password" id="confirm-password" name="confirm-password" required><br><br>
        
        <button type="submit">Register</button>
      </form>
    `;
    modal.style.display = "block";
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      modal.style.display = "none";
    }
  });
});