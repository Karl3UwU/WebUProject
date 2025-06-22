class DashboardSuggestionsView {
  container = 'dashboard-suggestions-view'
  template = '/app/views/dashboard-suggestions/dashboard-suggestions.html'
  style = '/app/views/dashboard-suggestions/dashboard-suggestions.css'

  elements = {
    genreInfo: 'genreInfo',
    genreList: 'genreList',

    title: 'title',
    author: 'author',
    language: 'language',
    page_count: 'page_count',
    genres: 'genres',

    submissionForm: 'submissionForm',
    deleteSuggestionBtn: 'deleteSuggestionBtn',
  }

  mount = async (props) => {
    await this.methods.check_permissions()
    await this.methods.load_suggestions()

    this.elements.submissionForm.addEventListener('submit', async (event) => this.methods.submit_suggestion(event))
    this.elements.deleteSuggestionBtn.addEventListener('click', async () => this.methods.delete_suggestion())

    this.elements.genreInfo.addEventListener('click', async () => this.methods.toggle_info(true))
    document.addEventListener('click', async (event) => {
      if (!this.elements.genreList.contains(event.target) && event.target !== this.elements.genreInfo) {
        this.methods.toggle_info(false)
      }
    })
  }

  methods = {
    check_permissions: async () => {
      const token = localStorage.getItem("authToken")
      const response = await fetch('/api/auth/getUser', {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      })
      if (!response.ok) {
        alert('Unauthorized')
        this.methods.route_to('home')
      }
      const userData = await response.json()

      if (userData.role?.toLowerCase() !== "admin") {
        alert('Unauthorized')
        this.methods.route_to('home')
      }
    },

    load_suggestions: async () => {
      const suggestion = JSON.parse(sessionStorage.getItem('suggestion'))

      if(!suggestion) {
        await this.methods.route_to('dashboard')
      }

      this.elements.title.value = suggestion.title
      this.elements.author.value = suggestion.author
      this.elements.language.value = suggestion.language
      this.elements.page_count.value = Number(suggestion.page_count)
      this.elements.genres.value = suggestion.genres?.join(',')
    },

    submit_suggestion: async (event) => {
      event.preventDefault()

      const token = localStorage.getItem('authToken')
      const suggestion_body = {
        title: this.elements.title.value.trim(),
        author: this.elements.author.value.trim(),
        language: this.elements.language.value.trim(),
        pageCount: this.elements.page_count.value.trim(),
        genres: this.elements.genres.value.trim(),
      }

      const response = await fetch(`/api/books/postSuggestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(suggestion_body)
      })
      if(!response.ok) {
        alert('Failed to post suggestion')
        return
      }

      const data = await response.json()
      alert(data.message || 'Book has been posted to catalog!')
      await this.methods.delete_suggestion()
      await this.methods.route_to('dashboard')
    },

    delete_suggestion: async () => {
      if (!confirm('Are you sure you want to delete this suggestion?')) return;

      const token = localStorage.getItem('authToken')
      const title = this.elements.title.value.trim()
      const author = this.elements.author.value.trim()

      if (!title || !author) {
        alert('Both title and author are required to delete.')
        return
      }

      const response = await fetch(`/api/books/deleteSuggestion?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`, {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      })
      if (!response.ok) {
        alert('Something went wrong when trying to delete suggestion')
        return
      }

      const data = await response.json()
      alert(data.message || 'Suggestion deleted successfully')
      sessionStorage.removeItem('suggestion')
      this.methods.route_to('dashboard')
    },

    toggle_info: async (value) => {
      this.elements.genreList.classList.toggle('hidden', !value)
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

export { DashboardSuggestionsView }