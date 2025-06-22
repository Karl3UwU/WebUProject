class BookView {
  container = 'book-view'
  template = '/app/views/book/book.html'
  style = '/app/views/book/book.css'

  book = undefined

  elements = {
    bookCover: 'bookCover',
    bookTitle: 'bookTitle',
    bookAuthor: 'bookAuthor',
    bookLanguage: 'bookLanguage',
    bookGenres: 'bookGenres',
    bookPages: 'bookPages',
    bookRating: 'bookRating',

    addToProfileBtn: 'addToProfileBtn',
    findBookButton: 'findBookButton',
    writeReviewBtn: 'writeReviewBtn',

    reviewsList: 'reviewsList',
  }

  mount = async (props) => {
    this.elements.addToProfileBtn.addEventListener('click', async () => await this.methods.addToBookshelf())
    this.elements.findBookButton.addEventListener('click', async () => await this.methods.findBook())
    this.elements.writeReviewBtn.addEventListener('click', async () => await this.methods.writeReview())

    await this.methods.load_book()
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
      await this.methods.render_book_info()
      await this.methods.load_reviews(this.book.title)
      await this.methods.checkBookInBookshelf();

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

    writeReview : async () => {
      if (await this.methods.isUserLoggedIn()) {
        const token = localStorage.getItem("authToken");

        try {
          const userRes = await fetch("/api/auth/getUser", {
            method: "GET",
            headers: {
              "Authorization": token,
              "Content-Type": "application/json"
            }
          });

          if (!userRes.ok) throw new Error("User fetch failed");

          const user = await userRes.json();
          const email = user.email;

          const rating = prompt("Enter your rating (0-10):");
          if (!rating || isNaN(rating) || rating < 0 || rating > 10) {
            alert("Please enter a valid rating between 0 and 10.");
            return;
          }

          const reviewText = prompt("Write your review:");
          if (!reviewText || reviewText.trim() === "") {
            alert("Review text cannot be empty.");
            return;
          }

          const response = await fetch(
              `/api/books/writeReview?bookId=${this.book.id}&email=${encodeURIComponent(email)}&rating=${rating}&review=${encodeURIComponent(reviewText)}`,
              {
                method: "GET",
                headers: {
                  "Authorization": token,
                  "Content-Type": "application/json"
                }
              }
          );

          const data = await response.json();

          if (response.ok) {
            alert("Review submitted successfully!");
            this.methods.load_book();
          } else {
            console.error("Review submission failed:", data.error);
            alert("Failed to submit review.");
          }

        } catch (err) {
          console.error("Error writing review:", err);
          alert("An error occurred while submitting your review.");
        }

      } else {
        this.methods.route_to("login");
      }
    },

    isUserLoggedIn: async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return false;

      try {
        const res = await fetch("/api/auth/verify-token", {
          method: "GET",
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) return false;

        const isValid = await res.json();
        return isValid === true;
      } catch (error) {
        console.error("Token verification failed:", error);
        return false;
      }
    },

    addToBookshelf: async () => {
      if (await this.methods.isUserLoggedIn()) {
        const token = localStorage.getItem("authToken");
        try {
          const userRes = await fetch("/api/auth/getUser", {
            method: "GET",
            headers: {
              "Authorization": token,
              "Content-Type": "application/json"
            }
          });

          if (!userRes.ok) throw new Error("User fetch failed");

          const user = await userRes.json();
          console.log("Current user:", user);
          const email = user.email;

          const response = await fetch(`/api/books/addToBookshelf?bookId=${this.book.id}&email=${email}`, {
            method: "GET",
            headers: {
              "Authorization": token,
              "Content-Type": "application/json"
            }
          });

          const data = await response.json();

          if (response.ok) {
            alert("Book successfully added to your profile!");
            this.methods.load_book();
          } else {
            console.error("Add to bookshelf failed:", data.error);
            alert("Failed to add book to profile.");
          }
        } catch (err) {
          console.error("Error adding to profile:", err);
          alert("Error while adding book to profile.");
        }
      } else {
        this.methods.route_to("login");
      }
    },

    findBook: async () => {
      if (!this.book) return;
        const query = `${this.book.title} ${this.book.author}`;
        window.open(`https://www.worldcat.org/search?q=${encodeURIComponent(query)}`, "_blank");
    },

    route_to: async (href) => {
      const link = document.createElement('a')
      link.href = href
      link.style.display = 'none'
      document.body.appendChild(link)

      const event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window })
      link.dispatchEvent(event)

      document.body.removeChild(link)
    },

    checkBookInBookshelf: async () => {
      if (!(await this.methods.isUserLoggedIn())) {
        return;
      }

      const token = localStorage.getItem("authToken");
      try {
        const userRes = await fetch("/api/auth/getUser", {
          method: "GET",
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          }
        });

        if (!userRes.ok) throw new Error("Failed to fetch user");


        const checkRes = await fetch(`/api/books/isInBookshelf?bookId=${this.book.id}`, {
          method: "GET",
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          }
        });

        if (!checkRes.ok) throw new Error("Failed to check bookshelf");

        const isInBookshelf = await checkRes.json();

        if (isInBookshelf === true) {
          this.elements.addToProfileBtn.disabled = true;
          this.elements.addToProfileBtn.textContent = "Already in Bookshelf";
        }
      } catch (err) {
        console.error("Error checking bookshelf:", err);
      }
    }

  }
}

export { BookView }