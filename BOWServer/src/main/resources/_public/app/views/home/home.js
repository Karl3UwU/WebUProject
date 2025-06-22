class HomeView {
  container = 'home-view'
  template = '/app/views/home/home.html'
  style = '/app/views/home/home.css'

  currentNewsPage = 0
  newsPerPage = 1
  allNews = []

  elements = {
    searchForm: 'searchForm',
    searchInput: 'searchInput',

    booksGrid: 'booksGrid',
    newsGrid: 'newsGrid',
    loadMoreBtn: 'loadMoreBtn',
  }

  mount = async (props) => {
    this.elements.searchForm.addEventListener('submit', async () => this.methods.search_books())
    this.elements.loadMoreBtn.addEventListener('click', async () => this.methods.render_news_page())

    this.methods.get_all_news()
    this.methods.get_trending()
  }

  methods = {
    search_books: async () => {
      const search_title = this.elements.searchInput.value.trim()
      sessionStorage.setItem('search_title', search_title)
      await this.methods.route_to(`browse`)
    },

    render_news_page: async () => {
      const start = this.currentNewsPage * this.newsPerPage
      const end = start + this.newsPerPage
      const newsToRender = this.allNews.slice(start, end)

      if (this.currentNewsPage === 0) {
        newsGrid.innerHTML = ''
      }

      for (const news of newsToRender) {
        const newsItem = document.createElement("div")
        newsItem.classList.add("news-item")

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
        `

        this.elements.newsGrid.appendChild(newsItem)
      }

      this.currentNewsPage++
      this.elements.loadMoreBtn.classList.toggle('hidden', (this.currentNewsPage * this.newsPerPage) >= this.allNews.length)
    },

    get_all_news: async () => {
      const response = await fetch('/api/news/all')
      if (!response.ok) {
        console.error('Failed to fetch news')
        this.elements.newsGrid.innerHTML = '<p>Failed to load news.</p>'
        return
      }
      const newsData = await response.json()
      this.allNews = newsData
      this.currentNewsPage = 0
      await this.methods.render_news_page()
    },

    get_trending: async () => {
      const response = await fetch('/api/books/trending')
      if (!response.ok) {
        console.error('Failed to fetch trending books')
        this.elements.booksGrid.innerHTML = '<p>Failed to load trending books.</p>'
        return
      }
      const books = await response.json()
      this.elements.booksGrid.innerHTML = ''

      for (const book of books) {
        const card = document.createElement('div')
        card.className = 'book-card'
        card.style.cursor = 'pointer'

        const genreDisplay = book.genres
          ?.map(g => g.replace(/_/g, " ").toLowerCase())
          .map(g => g.charAt(0).toUpperCase() + g.slice(1))
          .join(', ') || 'Various'

        const avgRating = book.rating?.toFixed(1) ?? 'N/A'
        const author = book.author ?? 'Unknown Author'

        card.innerHTML = `
          <div class="book-card-content">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author"><strong>Author:</strong> ${author}</p>
            <p class="book-genres"><strong>Genres:</strong> ${genreDisplay}</p>
            <p class="book-rating"><strong>Rating:</strong> ${avgRating}</p>
          </div>
        `

        card.addEventListener("click", async () => {
          this.methods.route_to(`book?title=${encodeURIComponent(book.title)}`)
        })

        this.elements.booksGrid.appendChild(card)
      }
    },

    route_to: async (href) => {
      const link = document.createElement('a')
      link.href = href
      link.style.display = 'none'
      document.body.appendChild(link)

      const event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window })
      link.dispatchEvent(event)

      document.body.removeChild(link)
    }
  }
}

export { HomeView }