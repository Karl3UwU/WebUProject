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

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});