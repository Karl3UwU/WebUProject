class BookView {
  container = 'book-view'
  template = '/app/views/book/book.html'
  style = '/app/views/book/book.css'

  book_data = undefined

  elements = {
    bookCover: 'bookCover',
    bookTitle: 'bookTitle',
    bookAuthor: 'bookAuthor',
    bookLanguage: 'bookLanguage',
    bookGenres: 'bookGenres',
    bookPages: 'bookPages',
    bookRating: 'bookRating',

    addToProfileBtn: 'addToProfileBtn',
    addToGroupBtn: 'addToGroupBtn',
    writeReviewBtn: 'writeReviewBtn',

    reviewsList: 'reviewsList',
  }

  mount = async (props) => {
    this.elements.addToProfileBtn.addEventListener('clicl', async () => {})
    this.elements.addToGroupBtn.addEventListener('clicl', async () => {})
    this.elements.writeReviewBtn.addEventListener('clicl', async () => {})

    this.methods.load_book()
  }

  methods = {
    load_book: async () => {
      const params = new URLSearchParams(window.location.search)
      const title = params.get("title")

      if (!title) return

      const result = await fetch(`/api/books/filter?title=${encodeURIComponent(title)}`)
      if (!result.ok) {
        console.error('Failed to fetch book')
        return
      }

      this.book = (await result.json())[0]
      this.methods.render_book_info()
      this.methods.load_reviews(this.book.title)
    },

    render_book_info: async () => {
      this.elements.bookTitle.textContent = this.book.title
      this.elements.bookAuthor.textContent = this.book.author
      this.elements.bookLanguage.textContent = this.book.language
      this.elements.bookGenres.textContent = this.book.genres.join(", ")
      this.elements.bookPages.textContent = this.book.page_count
      this.elements.bookRating.textContent = this.book.rating?.toFixed(1) || "N/A"

      const cover_url = await this.methods.fetch_cover_by_title(this.book.title)
      this.elements.bookCover.src = cover_url
    },

    fetch_cover_by_title: async (title) => {
      const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`)
      const data = await response.json()

      if (data.docs.length > 0 && data.docs[0].cover_i) {
        const coverId = data.docs[0].cover_i
        return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      }

      return 'resource/app/assets/default-cover.jpg'
    },

    load_reviews: async (bookTitle) => {
      const result = await fetch(`/api/reviews/filter?bookTitle=${encodeURIComponent(bookTitle)}`)
      const reviews = await result.json()

      if (reviews.length === 0) {
        this.elements.reviewsList.innerHTML = "<p>No reviews yet.</p>";
        return;
      }

      for (const review of reviews) {
        const card = document.createElement('div')
        card.classList.add('review-card')
        card.innerHTML = `
          <h3>${review.title}</h3>
          <p><strong>Reviewer:</strong> ${review.username}</p>
          <p>${review.content}</p>
          <p>${await this.methods.getStarRating(review.rating)}</p>
        `;
        this.elements.reviewsList.appendChild(card);
      }
    },

    getStarRating: async (rating) => {
      if (!rating) return "";
      return "★".repeat(Math.round(rating)) + "☆".repeat(10 - Math.round(rating));
    },

    isUserLoggedIn: async () => {
      // TODO: Replace this logic with your actual auth check
      // Example: return Boolean(sessionStorage.getItem("userToken"));
      // Or call /api/auth/status and cache the result
      return false; // Simulating a not-logged-in user
    }
  }
}

export { BookView }