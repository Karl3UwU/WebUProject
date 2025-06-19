let currentNewsPage = 0;
const newsPerPage = 1;
let allNews = [];

function renderNewsPage() {
    const newsGrid = document.getElementById("newsGrid");
    const start = currentNewsPage * newsPerPage;
    const end = start + newsPerPage;
    const newsToRender = allNews.slice(start, end);

    if (currentNewsPage === 0) {
        newsGrid.innerHTML = "";
    }

    newsToRender.forEach(news => {
        const newsItem = document.createElement("div");
        newsItem.classList.add("news-item");

        const date = new Date(news.posted).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        newsItem.innerHTML = `
            <h3>${news.title}</h3>
            <p>${news.content}</p>
            <div class="news-meta">
                <span class="news-author">Posted by: ${news.username}</span>
                <span class="news-date">${date}</span>
            </div>
        `;

        newsGrid.appendChild(newsItem);
    });

    currentNewsPage++;

    // Hide "Load More" if all news are rendered
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (currentNewsPage * newsPerPage >= allNews.length) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "inline-flex";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const newsGrid = document.getElementById("newsGrid");
    const loadMoreBtn = document.getElementById("loadMoreBtn");

    fetch("/api/news/all")
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch news");
            return response.json();
        })
        .then(newsData => {
            allNews = newsData;
            currentNewsPage = 0;
            renderNewsPage();
        })
        .catch(error => {
            console.error("Error fetching news:", error);
            newsGrid.innerHTML = "<p>Failed to load news.</p>";
        });

    loadMoreBtn.addEventListener("click", () => {
        renderNewsPage();
    });
});