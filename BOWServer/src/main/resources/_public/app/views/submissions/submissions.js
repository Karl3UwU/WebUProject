class SubmissionsView {
  container = 'submissions-view'
  template = '/app/views/submissions/submissions.html'
  style = '/app/views/register/register.css'

  elements = {
    title: 'title',
    author: 'author',
    language: 'language',
    page_count: 'page_count',
    genres: 'genres',

    genreInfo: 'genreInfo',
    genreList: 'genreList',
    submissionForm: 'submissionForm',
  }

  mount = async (props) => {
    this.elements.submissionForm.addEventListener('submit', async (event) => this.methods.submit_request(event))
    this.elements.genreInfo.addEventListener('click', async () => this.methods.toggle_info(true))
    document.addEventListener('click', async (event) => {
      if (!this.elements.genreList.contains(event.target) && event.target !== this.elements.genreInfo) {
        this.methods.toggle_info(false)
      }
    })

    await this.methods.load_page()
  }

  methods = {
    load_page: async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const prefillTitle = urlParams.get("title");
      const prefillAuthor = urlParams.get("author");

      if (prefillTitle) this.elements.title.value = prefillTitle
      if (prefillAuthor) this.elements.author.value = prefillAuthor
    },

    submit_request: async (event) => {
      event.preventDefault()

      const title = this.elements.title.value.trim()
      const author = this.elements.author.value.trim()
      const language = this.elements.language?.value.trim()
      const pageCountStr = this.elements.page_count?.value.trim()
      const genresInput = this.elements.genres?.value.trim()

      const errors = []
      if (!title) errors.push("Title is required.")
      if (!author) errors.push("Author is required.")
      if (errors.length > 0) {
        alert(errors.join("\n"))
        return
      }

      // Prepare form data as URLSearchParams
      const formData = new URLSearchParams()
      formData.append("title", title)
      formData.append("author", author)
      if (language) formData.append("language", language);
      if (pageCountStr) formData.append("page_count", parseInt(pageCountStr))
      if (genresInput) {
        const genres = genresInput.split(",").map(g => g.trim()).filter(g => g)
        for (const genre of genres) {
          formData.append("genres", genre)
        }
      }

      try {
        const response = await fetch("/api/books/suggest", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString()
        })
        if(!response.ok) {
          alert(result.error || "An error occurred while submitting the suggestion.")
        }
        const result = await response.json()
        alert(result.message || "Book suggestion submitted successfully!")
        form.reset()

      } catch (err) {
        console.error("Submission failed:", err);
        alert("An unexpected error occurred.");
      }
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

export { SubmissionsView }