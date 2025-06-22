class ProfileView {
  container = 'profile-view'
  template = '/app/views/profile/profile.html'
  style = '/app/views/profile/profile.css'

  pageSize = 3
  reviewPage = 0
  booksPage = 0
  admin_button_visible = false

  elements = {
    readingList: 'readingList',

    userName: 'userName',
    userEmail: 'userEmail',
    userRole: 'userRole',
    userFullName: 'userFullName',

    userBooks: 'userBooks',
    userReviews: 'userReviews',
    loadMoreBooks: 'loadMoreBooks',
    loadMoreReviews: 'loadMoreReviews',

    changePasswordBtn: 'changePasswordBtn',
    dashboardBtn: 'dashboardBtn',
  }

  mount = async (props) => {
    this.elements.changePasswordBtn.addEventListener('click', async () => await this.methods.change_password())
    this.elements.loadMoreBooks.addEventListener('click', async () => await this.methods.load_books())
    this.elements.loadMoreReviews.addEventListener('click', async () => await this.methods.load_reviews())
    this.elements.dashboardBtn.addEventListener('click', async () => await this.methods.route_to('/dashboard'))

    await this.methods.load_user()

    this.methods.load_books()
    this.methods.load_reviews()
  }

  methods = {
    load_user: async () => {
      const token = localStorage.getItem('authToken')

      const respose = await fetch('/api/auth/getUser', {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      })
      if (!respose.ok) {
        localStorage.removeItem('authToken')
        console.error('Unauthorized')
        await this.methods.route_to('home')
        return
      }

      const user = await respose.json()

      this.elements.userName.textContent = user.username || "User"
      this.elements.userEmail.textContent = `Email: ${user.email || ""}`
      this.elements.userRole.textContent = `Role: ${user.role || ""}`
      this.elements.userFullName.textContent = `Full Name: ${user.firstName || ""} ${user.lastName || ""}`

      this.admin_button_visible = (user.role?.toLowerCase() === "admin")
      await this.methods.set_admin_dashboard_visibility()
    },

    load_books: async () => {
      const token = localStorage.getItem('authToken')

      const response = await fetch('/api/auth/getBookshelf', {
        method: 'GET',
        headers: { 'Authorization': token }
      })
      if (!response.ok) {
        alert('Failed to get user books')
        return
      }
      const data = await response.json()

      const paginatedBooks = data.slice(this.booksPage * this.pageSize, (this.booksPage + 1) * this.pageSize)

      if (data.length === 0 && this.booksPage === 0) {
        this.elements.userBooks.innerHTML = '<p>No books in your shelf yet.</p>'
        this.elements.loadMoreBooks.classList.toggle('hidden', true)
        return
      }

      for (const book of paginatedBooks) {
        const bookDiv = document.createElement('div')
        bookDiv.className = 'book-card'
        bookDiv.style.position = 'relative'
        bookDiv.innerHTML = `
          <div style="position:absolute; top:8px; right:8px; display:flex; gap:4px;">
            <button class="btn btn-secondary edit-book-btn" title="Edit Status" style="padding:4px 8px;">
              <img src="resource/app/assets/edit.svg" alt="Edit" style="width:16px;height:16px;vertical-align:middle;">
            </button>
            <button class="btn btn-secondary delete-book-btn" title="Remove Book" style="padding:4px 8px;">
              <img src="resource/app/assets/trash.svg" alt="Delete" style="width:16px;height:16px;vertical-align:middle;">
            </button>
          </div>
          <h3>${book.title}</h3>
          <p><strong>Author:</strong> ${book.author}</p>
          <p><strong>Status:</strong> <span class="book-status">${book.Status}</span></p>
        `

        bookDiv.querySelector('.edit-book-btn').addEventListener('click', async () => {
          const newStatus = prompt("Enter new status ('Reading', 'Completed', 'Wishlist'):", book.Status);
          if (!newStatus || newStatus === book.Status) return
          const token = localStorage.getItem('authToken')
          const edit_result = await fetch(`/api/auth/editBookStatus?bookId=${book.bookId}&Status=${newStatus}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            }
          })
          if (!edit_result.ok) {
            alert('Failed to update book status')
            return
          }
          bookDiv.querySelector(".book-status").textContent = newStatus
          alert('Successfully updated book status')
        })

        bookDiv.querySelector(".delete-book-btn").addEventListener("click", async () => {
          if (!confirm("Are you sure you want to remove this book from your shelf?")) return

          const delete_response = await fetch(`/api/auth/deleteBookFromShelf?bookId=${book.bookId}`, {
            method: "GET",
            headers: { "Authorization": token }
          })
          if (!delete_response.ok) {
            alert('Book deletion failed')
            return
          }

          bookDiv.remove()
        })

        this.elements.userBooks.appendChild(bookDiv)
      }

      this.booksPage++
      this.elements.loadMoreBooks.classList.toggle('hidden', (this.booksPage * this.pageSize) >= data.length)
    },

    load_reviews: async () => {
      const token = localStorage.getItem('authToken')
      const userName = this.elements.userName.textContent

      const response = await fetch('api/auth/getReviews', {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      })
      if (!response.ok) {
        console.error('Failed to retrieve user reviews')
        return
      }
      const data = await response.json()

      const userReviews = data.filter(review => review.username === userName);
      const paginatedReviews = userReviews.slice(this.reviewPage * this.pageSize, (this.reviewPage + 1) * this.pageSize);

      if (userReviews.length === 0 && this.reviewPage === 0) {
        reviewsContainer.innerHTML = "<p>You haven't posted any reviews yet.</p>"
        loadMoreReviews.classList.toggle('hidden', true)
        return
      }

      for (const review of paginatedReviews) {
        const reviewDiv = document.createElement("div")
        reviewDiv.className = 'review-card'
        reviewDiv.style.position = 'relative'
        reviewDiv.innerHTML = `
          <button class="btn btn-secondary delete-review-btn" data-id="${review.bookId}" style="position:absolute;top:8px;right:8px;padding:4px 8px;">
            <img src="resource/app/assets/trash.svg" alt="Delete" style="width:16px;height:16px;vertical-align:middle;">
          </button>
          <h3>${review.bookTitle}</h3>
          <p><strong>Rating:</strong> ${review.rating}/10</p>
          <p>${review.content}</p>
        `;

        reviewDiv.querySelector(".delete-review-btn").addEventListener("click", async () => {
          if (!confirm("Are you sure you want to delete this review?")) return

          const token = localStorage.getItem('authToken')
          const delete_response = await fetch(`/api/auth/deleteReview?bookId=${encodeURIComponent(review.bookId)}`, {
            method: 'GET',
            headers: { 'Authorization': token }
          })
          if(!delete_response.ok) {
            alert('Failed to delete review')
            return
          }
          reviewDiv.remove()
        })

        this.elements.userReviews.appendChild(reviewDiv)
      }

      this.reviewPage++
      this.elements.loadMoreReviews.classList.toggle('hidden', (this.reviewPage * this.pageSize) >= userReviews.length)
    },

    change_password: async () => {
      const token = localStorage.getItem('authToken')

      const oldPassword = prompt('Enter your current password:')
      if (!oldPassword) return

      const newPassword = prompt('Enter your new password:')
      if (!newPassword) return

      const response = await fetch(`/api/auth/changePassword?oldPassword=${encodeURIComponent(oldPassword)}&newPassword=${encodeURIComponent(newPassword)}`, {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      })
      if (!response.ok) {
        alert('Failed to change password')
        return
      }
      const message = (await response.json()).message
      alert(message || 'Password changed successfully')
    },

    set_admin_dashboard_visibility: async () => {
      this.elements.dashboardBtn.classList.toggle('hidden', !this.admin_button_visible)
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
  }
}

export { ProfileView }