// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    initializeApp();
});

// Sample data for news and books
const newsData = [
    {
        id: 1,
        title: "New Fantasy Epic Breaks Pre-order Records",
        content: "The latest installment in the popular fantasy series has already sold over 500,000 copies in pre-orders, making it one of the most anticipated releases of the year.",
        author: "Sarah Johnson",
        date: "2 hours ago",
        category: "News"
    },
    {
        id: 2,
        title: "Independent Authors Gaining Ground in Digital Market",
        content: "Recent studies show that independent authors now account for 40% of all digital book sales, marking a significant shift in the publishing landscape.",
        author: "Mike Chen",
        date: "5 hours ago",
        category: "Industry"
    },
    {
        id: 3,
        title: "Book Clubs See 300% Increase in Online Participation",
        content: "Virtual book clubs have exploded in popularity, with reading communities forming around genres, authors, and even specific series.",
        author: "Emma Wilson",
        date: "1 day ago",
        category: "Community"
    },
    {
        id: 4,
        title: "AI-Generated Books Spark Publishing Debate",
        content: "The rise of AI-assisted writing tools has publishers and authors debating the future of creative writing and intellectual property.",
        author: "David Park",
        date: "2 days ago",
        category: "Technology"
    },
    {
        id: 5,
        title: "Climate Fiction Genre Sees Unprecedented Growth",
        content: "Books addressing climate change and environmental themes have seen a 250% increase in sales over the past year.",
        author: "Lisa Rodriguez",
        date: "3 days ago",
        category: "Trends"
    },
    {
        id: 6,
        title: "Audiobook Market Reaches New Heights",
        content: "Audiobook sales have surpassed traditional print books for the first time in publishing history, driven by commuter-friendly formats.",
        author: "James Thompson",
        date: "4 days ago",
        category: "Market"
    }
];

const booksData = [
    {
        id: 1,
        title: "The Midnight Library",
        author: "Matt Haig",
        rating: 4.5,
        genre: "Fiction"
    },
    {
        id: 2,
        title: "Atomic Habits",
        author: "James Clear",
        rating: 4.8,
        genre: "Self-Help"
    },
    {
        id: 3,
        title: "The Seven Husbands of Evelyn Hugo",
        author: "Taylor Jenkins Reid",
        rating: 4.6,
        genre: "Historical Fiction"
    },
    {
        id: 4,
        title: "Educated",
        author: "Tara Westover",
        rating: 4.4,
        genre: "Memoir"
    },
    {
        id: 5,
        title: "The Song of Achilles",
        author: "Madeline Miller",
        rating: 4.7,
        genre: "Historical Fiction"
    },
    {
        id: 6,
        title: "Sapiens",
        author: "Yuval Noah Harari",
        rating: 4.3,
        genre: "Non-Fiction"
    }
];

// State management
let displayedNewsCount = 3;
let searchHistory = [];

// Initialize the application
function initializeApp() {
    renderNews();
    renderBooks();
    setupEventListeners();
    addAnimations();
}

// Render news items
function renderNews() {
    const newsGrid = document.getElementById('newsGrid');
    const newsToShow = newsData.slice(0, displayedNewsCount);

    newsGrid.innerHTML = newsToShow.map(news => `
        <article class="news-item" data-id="${news.id}">
            <h3>${news.title}</h3>
            <p>${news.content}</p>
            <div class="news-meta">
                <span class="news-author">By ${news.author}</span>
                <span class="news-date">${news.date}</span>
            </div>
        </article>
    `).join('');

    // Update load more button visibility
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (displayedNewsCount >= newsData.length) {
        loadMoreBtn.style.display = 'none';
    }
}

// Render featured books
function renderBooks() {
    const booksGrid = document.getElementById('booksGrid');

    booksGrid.innerHTML = booksData.map(book => `
        <div class="book-card" data-id="${book.id}">
            <div class="book-cover">
                <i data-lucide="book-open"></i>
            </div>
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">by ${book.author}</p>
            <div class="book-rating">
                ${generateStarRating(book.rating)}
            </div>
        </div>
    `).join('');

    // Re-initialize icons for new content
    lucide.createIcons();
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';

    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i data-lucide="star" class="star-filled"></i>';
    }

    if (hasHalfStar) {
        starsHTML += '<i data-lucide="star" class="star-half"></i>';
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i data-lucide="star" class="star-empty"></i>';
    }

    return starsHTML;
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Load more news
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.addEventListener('click', loadMoreNews);

    // Authentication buttons
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');

    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showAuthModal('login');
    });

    signupBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showAuthModal('signup');
    });

    // Book card clicks
    document.addEventListener('click', function(e) {
        const bookCard = e.target.closest('.book-card');
        if (bookCard) {
            const bookId = bookCard.dataset.id;
            handleBookClick(bookId);
        }

        const newsItem = e.target.closest('.news-item');
        if (newsItem) {
            const newsId = newsItem.dataset.id;
            handleNewsClick(newsId);
        }
    });

    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Handle search functionality
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();

    if (!query) {
        showNotification('Please enter a search term', 'warning');
        return;
    }

    // Add to search history
    if (!searchHistory.includes(query)) {
        searchHistory.unshift(query);
        if (searchHistory.length > 10) {
            searchHistory.pop();
        }
    }

    // Simulate search (in real app, this would make an API call)
    showNotification(`Searching for "${query}"...`, 'info');

    setTimeout(() => {
        const results = performSearch(query);
        displaySearchResults(results);
    }, 1000);
}

// Simulate search functionality
function performSearch(query) {
    const allBooks = [...booksData];
    const results = allBooks.filter(book =>
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.genre.toLowerCase().includes(query.toLowerCase())
    );

    return results;
}

// Display search results
function displaySearchResults(results) {
    if (results.length === 0) {
        showNotification('No books found matching your search', 'warning');
        return;
    }

    showNotification(`Found ${results.length} book(s)`, 'success');

    // Update the books grid with search results
    const booksGrid = document.getElementById('booksGrid');
    booksGrid.innerHTML = results.map(book => `
        <div class="book-card search-result" data-id="${book.id}">
            <div class="book-cover">
                <i data-lucide="book-open"></i>
            </div>
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">by ${book.author}</p>
            <div class="book-rating">
                ${generateStarRating(book.rating)}
            </div>
        </div>
    `).join('');

    // Re-initialize icons
    lucide.createIcons();
}

// Load more news articles
function loadMoreNews() {
    displayedNewsCount += 3;
    renderNews();

    // Add fade-in animation to new items
    const newItems = document.querySelectorAll('.news-item');
    newItems.forEach((item, index) => {
        if (index >= displayedNewsCount - 3) {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
                item.style.transition = 'all 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}

// Handle book card clicks
function handleBookClick(bookId) {
    const book = booksData.find(b => b.id == bookId);
    if (book) {
        showNotification(`Opening "${book.title}" by ${book.author}`, 'info');
        // In a real app, this would navigate to the book detail page
        setTimeout(() => {
            window.location.href = `#book-${bookId}`;
        }, 500);
    }
}

// Handle news item clicks
function handleNewsClick(newsId) {
    const news = newsData.find(n => n.id == newsId);
    if (news) {
        showNotification(`Reading: "${news.title}"`, 'info');
        // In a real app, this would navigate to the full article
        setTimeout(() => {
            window.location.href = `#news-${newsId}`;
        }, 500);
    }
}

// Show authentication modal (placeholder)
function showAuthModal(type) {
    const action = type === 'login' ? 'Login' : 'Sign Up';
    showNotification(`${action} functionality coming soon!`, 'info');

    // In a real app, this would open a modal or redirect to auth page
    console.log(`${action} modal would open here`);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i data-lucide="${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i data-lucide="x"></i>
            </button>
        </div>
    `;

    document.body.appendChild(notification);
    lucide.createIcons();

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);

    // Manual close
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-100%)';
        setTimeout(() => notification.remove(), 300);
    });
}

// Get notification icon based on type
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'warning': return 'alert-triangle';
        case 'error': return 'x-circle';
        default: return 'info';
    }
}

// Add scroll animations
function addAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.news-item, .book-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search with debounce for better UX
const debouncedSearch = debounce(handleSearch, 300);

// Update search input to use debounced search on input
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            if (this.value.length > 2) {
                debouncedSearch();
            } else if (this.value.length === 0) {
                // Reset to default books when search is cleared
                renderBooks();
            }
        });
    }
});

// Add loading states
function showLoading(element) {
    element.innerHTML = `
        <div class="loading">
            <i data-lucide="loader-2" class="spin"></i>
            <span>Loading...</span>
        </div>
    `;
    lucide.createIcons();
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Press '/' to focus search
    if (e.key === '/' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }

    // ESC to clear search
    if (e.key === 'Escape' && e.target.matches('#searchInput')) {
        e.target.value = '';
        renderBooks();
    }
});

// Theme toggle functionality (bonus feature)
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');

    // Store preference
    try {
        // Note: We can't use localStorage in Claude artifacts
        console.log(`Theme changed to: ${isDark ? 'dark' : 'light'}`);
    } catch (e) {
        console.log('Theme preference not saved (localStorage not available)');
    }
}

// Performance optimization: Lazy loading for images (if added later)
function lazyLoadImages() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Error handling for failed requests
function handleError(error) {
    console.error('Application error:', error);
    showNotification('Something went wrong. Please try again.', 'error');
}