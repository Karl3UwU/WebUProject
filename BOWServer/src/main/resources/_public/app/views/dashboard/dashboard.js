class DashboardView {
  container = 'dashboard-view'
  template = '/app/views/dashboard/dashboard.html'
  style = '/app/views/dashboard/dashboard.css'

  currentSuggestionPage = 0
  suggestionsPerPage = 3
  currentSuggestions = []

  elements = {
    suggestionList: 'suggestionList',
    loadMoreSuggestionsBtn: 'loadMoreSuggestionsBtn',
  }

  mount = async (props) => {
    await this.methods.check_permissions()
    await this.methods.get_all_suggestions()
    await this.methods.render_next_suggestion_page()

    this.elements.loadMoreSuggestionsBtn.addEventListener('click', async () => this.methods.render_next_suggestion_page())
  }

  methods = {
    get_all_suggestions: async () => {
      const token = localStorage.getItem("authToken")
      const response = await fetch('/api/books/getAllSuggestions', {
        method: 'GET',
        headers: {
          'Authorization': token
        }
      })
      if (!response.ok) {
        console.error('Failed to get suggestions')
        return
      }
      const suggestions = await response.json()

      if (suggestions.length === 0) {
        this.elements.suggestionList.innerHTML = '<p>No suggestions available.</p>'
        return
      }

      this.currentSuggestions = suggestions
      this.currentSuggestionPage = 0
    },

    render_next_suggestion_page: async () => {
      const start = this.currentSuggestionPage * this.suggestionsPerPage;
      const end = start + this.suggestionsPerPage;
      const toRender = this.currentSuggestions.slice(start, end);

      if (this.currentSuggestionPage === 0) {
        this.elements.suggestionList.innerHTML = ''
      }

      for(const suggestion of toRender) {
        const card = document.createElement("div");
        card.className = "suggestion-card";
        card.innerHTML = `
          <div class="suggestion-card-content">
            <h3>${suggestion.title}</h3>
            <p><strong>Author:</strong> ${suggestion.author}</p>
          </div>
          <button class="btn btn-secondary" data-id="${suggestion.title}&${suggestion.author}">Review</button>
        `;
        card.querySelector("button").addEventListener("click", async () => {
          const encodedTitle = encodeURIComponent(suggestion.title)
          const encodedAuthor = encodeURIComponent(suggestion.author)
          await this.methods.route_to(`dashboard-suggestions?title=${encodedTitle}&author=${encodedAuthor}`)
        })
        this.elements.suggestionList.appendChild(card)
      }

      this.currentSuggestionPage++

      this.elements.loadMoreSuggestionsBtn.classList.toggle('hidden', (this.currentSuggestionPage * this.suggestionsPerPage) >= this.currentSuggestions.length)
    },

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

export { DashboardView }