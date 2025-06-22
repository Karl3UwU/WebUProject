class BrowseView {
  container = 'browse-view'
  template = '/app/views/browse/browse.html'
  style = '/app/views/browse/browse.css'

  books = undefined
  currentPage = 0
  booksPerPage = 6
  renderedBooksCount = 0

  showLoadMore = true

  elements = {
    browse_grid: 'browse-grid',

    title_field: 'filterTitle',
    author_field: 'filterAuthor',
    genre_field: 'filterGenre',
    language_field: 'filterLanguage',
    minRating_field: 'filterMinRating',

    loadMoreButton: 'load-more-btn',
    applyFiltersButton: 'apply-filters-btn',

    exportDocBookBtn: 'exportDocBookBtn',
    exportBooksBtn: 'exportBooksBtn',
  }

  mount = async (props) => {
    this.methods.loadFilteredBooks()

    this.elements.applyFiltersButton.addEventListener('click', async () => {
      history.replaceState(null, '', window.location.pathname)
      this.methods.loadFilteredBooks()}
    )
    this.elements.loadMoreButton.addEventListener('click', async () => await this.methods.renderNextPage())
    this.elements.exportDocBookBtn.addEventListener('click', async () => await this.methods.export_doc_book())
    this.elements.exportBooksBtn.addEventListener('click', async () => await this.methods.export_csv_books())
  }

  methods = {
    loadFilteredBooks: async () => {
      const params = new URLSearchParams(window.location.search)
      const param_genre = params.get("selectedGenre")
      if(param_genre) this.elements.genre_field.value = param_genre

      const title = this.elements.title_field.value.trim()
      const author = this.elements.author_field.value.trim()
      const genre = this.elements.genre_field.value.trim()
      const language = this.elements.language_field.value.trim()
      const minRatingStr = this.elements.minRating_field.value.trim()

      const queryParts = [];

      if (title) queryParts.push(`title=${encodeURIComponent(title)}`)
      if (author) queryParts.push(`author=${encodeURIComponent(author)}`)
      if (genre) queryParts.push(`genre=${encodeURIComponent(genre)}`)
      if (language) queryParts.push(`language=${encodeURIComponent(language)}`)
      if (minRatingStr) {
        const minRating = parseFloat(minRatingStr)
        if (!isNaN(minRating)) {
          queryParts.push(`minRating=${encodeURIComponent(minRating)}`)
        }
      }

      const queryString = queryParts.join('&')
      const url = `/api/books/filter?${queryString}`

      const response = await fetch(url)

      if (!response.ok) {
        console.error('Failed to load books')
        return
      }

      this.elements.browse_grid.innerHTML = ''
      this.currentPage = 0
      this.renderedBooksCount = 0

      const books = await response.json()
      this.books = books

      window.scrollTo({ top: 0, behavior: "smooth" })
      this.methods.renderNextPage()
    },

    renderNextPage: async () => {
      const start = this.currentPage * this.booksPerPage;
      const end = start + this.booksPerPage;
      const booksToRender = this.books.slice(start, end)

      for (const book of booksToRender) {
        const card = document.createElement('div')
        card.classList.add('book-card')
        card.id = `book-card-${this.renderedBooksCount}`
        this.renderedBooksCount++

        const genreDisplay = book.genres
          .map(g => g.replace(/_/g, " ").toLowerCase())
          .map(g => g.charAt(0).toUpperCase() + g.slice(1))
          .join(", ")

        card.innerHTML = `
          <div class="book-card-content">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author"><strong>Author:</strong> ${book.author}</p>
            <p class="book-genres"><strong>Genres:</strong> ${genreDisplay}</p>
            <p class="book-language"><strong>Language:</strong> ${book.language}</p>
            <p class="book-pages"><strong>Pages:</strong> ${book.page_count}</p>
          </div>
        `

        card.addEventListener("click", () => {
          this.methods.route_to(`book?title=${encodeURIComponent(book.title)}`)
        })

        this.elements.browse_grid.appendChild(card)
      }

      this.currentPage++
      this.elements.loadMoreButton.classList.toggle('hidden', (this.currentPage * this.booksPerPage >= this.books.length))
    },

    export_doc_book: async () => {
      const header = `<?xml version="1.0" encoding="UTF-8"?>
   
      <book xmlns="http://docbook.org/ns/docbook" version="5.0">
      <title>Filtered Book List</title>
      <chapter>
      <title>Books</title>
      <itemizedlist>`;

      const itemPromises = this.books.map(async (book) => `
          <listitem>
            <para><emphasis>
            ${await this.methods.escape_xml(book.title)}</emphasis> by 
            ${await this.methods.escape_xml(book.author)} (
            ${await this.methods.escape_xml(book.genres.join(", "))}, 
            ${await this.methods.escape_xml(book.language)}) - 
            ${book.page_count} pages</para>
          </listitem>`);

      const items = (await Promise.all(itemPromises)).join("");

      const footer = `
        </itemizedlist>
        </chapter>
        </book>`;

      const fullXml = header + items + footer;

      const blob = new Blob([fullXml], { type: "application/xml;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "filtered_books.docbook.xml";
      link.click();
    },

    export_csv_books: async () => {
      const headers = ["Title", "Author", "Genres", "Language", "Pages"]
      const rows = this.books.map(book => [
        book.title,
        book.author,
        book.genres.join(", "),
        book.language,
        book.page_count
      ])
      const csvContent = [headers.join(","), ...rows.map(row =>
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )].join("\n")

      const BOM = "\uFEFF"; // UTF-8 BOM to help Excel
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })

      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = "filtered_books.csv"
      link.click()
    },

    escape_xml: async (unsafe) => {
      return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&apos;';
          case '"': return '&quot;';
        }
      });
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

export { BrowseView }