class ReviewsView {
  container = 'reviews-view'
  template = '/app/views/reviews/reviews.html'
  style = '/app/views/reviews/reviews.css'

  currentPage = 0
  reviewsPerPage = 3
  currentReviews = []

  elements = {
    bookTitle: 'bookTitle',
    reviewerName: 'reviewerName',
    applyReviewFilters: 'applyReviewFilters',
    reviewsList: 'reviewsList',
    loadMoreReviewsBtn: 'loadMoreReviewsBtn'
  }

  mount = async (props) => {
    await this.methods.load_reviews()

    this.elements.applyReviewFilters.addEventListener('click', async () => this.methods.load_reviews())
    this.elements.loadMoreReviewsBtn.addEventListener('click', async () => this.methods.render_next_review_page())
  }

  methods = {
    load_reviews: async () => {
      const bookTitle = this.elements.bookTitle.value.trim()
      const reviewer = this.elements.reviewerName.value.trim()
      let url = "/api/reviews/filter"
      const params = new URLSearchParams()

      if (bookTitle) params.append("bookTitle", bookTitle)
      if (reviewer) params.append("username", reviewer)

      if ([...params].length > 0) {
        url += "?" + params.toString()
      }

      const response = await fetch(url)
      if (!response.ok) {
        console.error('Failed to load reviews')
        return
      }
      const reviews = await response.json()

      this.currentReviews = reviews
      this.currentPage = 0
      window.scrollTo({ top: 0, behavior: "smooth" })

      this.elements.reviewsList.innerHTML = ''
      this.methods.render_next_review_page()
    },

    render_next_review_page: async () => {
      const start = this.currentPage * this.reviewsPerPage
      const end = start + this.reviewsPerPage
      const reviewsToRender = this.currentReviews.slice(start, end)

      if (reviewsToRender.length === 0 && this.currentPage === 0) {
        this.elements.reviewsList.innerHTML = "<p>No reviews found.</p>"
        return
      }

      for(const review of reviewsToRender) {
        const stars = await this.methods.get_star_rating(review.rating)

        const card = document.createElement("div")
        card.className = "review-card";

        card.innerHTML = `
            <h3>${review.title}</h3>
            <p class="reviewer"><strong>Reviewer:</strong> ${review.username}</p>
            <p class="review-content">${review.content}</p>
            <p class="review-rating">${stars}</p>
        `;

        this.elements.reviewsList.appendChild(card)
      }

      this.currentPage++
      this.elements.loadMoreReviewsBtn.classList.toggle('hidden', (this.currentPage * this.reviewsPerPage) >= this.currentReviews.length)
    },

    get_star_rating: async (rating) => {
      if (rating == null) return ""

      let starHtml = ""

      for (let i = 1; i <= 10; i++) {
        if (i <= rating) {
          starHtml += "★"
        } else {
          starHtml += "☆"
        }
      }

      return starHtml
    },
  }
}

export { ReviewsView }