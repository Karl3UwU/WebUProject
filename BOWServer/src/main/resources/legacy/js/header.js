// Header-specific functionality
function initializeHeader() {
    console.log('should be called to init')
    const authButtonsContainer = document.querySelector('.auth-buttons');
    const user = JSON.parse(localStorage.getItem('loggedInUser'));

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function () {
            navLinks.classList.toggle('active');

            const icon = document.getElementById('menuIcon');
            icon.src = navLinks.classList.contains('active') ? 'images/x.svg' : 'images/menu.svg';
            icon.alt = navLinks.classList.contains('active') ? 'Close menu' : 'Open menu';
        });
    }

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.nav') && navLinks?.classList.contains('active')) {
            navLinks.classList.remove('active');
            const icon = document.getElementById('menuIcon');
            icon.src = 'images/menu.svg';
            icon.alt = 'Open menu';
        }
    });

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    if (user?.email) {
        console.log("TuruDoiInapoi", user.email);
        authButtonsContainer.innerHTML = `
            <button class="btn btn-secondary" id="logoutBtn">
                <img src="images/log-out.svg" alt="Log out" class="icon"> Log Out
            </button> 
            <a href="profile.html" class="btn btn-primary">
                <img src="images/user.svg" alt="Profile" class="icon"> Profile
            </a> `;

        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            window.location.reload();
        });
    }
}