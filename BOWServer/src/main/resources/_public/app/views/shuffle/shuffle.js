class ShuffleView {
  container = 'shuffle-view'
  template = '/app/views/shuffle/shuffle.html'
  style = '/app/views/shuffle/shuffle.css'

  lastTitle = ''
  lastAuthor = ''

  elements = {
    genreSelect: 'genreSelect',
    shuffleBtn: 'shuffleBtn',
    addToSite: 'addToSite',
    addToSiteBtn: 'addToSiteBtn',
    bookResult: 'bookResult'
  }

  mount = async (props) => {
    this.elements.addToSiteBtn.addEventListener('click', async () => this.methods.add_to_site())
    this.elements.shuffleBtn.addEventListener('click', async () => this.methods.shuffe())
  }

  methods = {
    shuffe: async () => {
      const genre = this.elements.genreSelect.value;
      this.elements.bookResult.innerHTML = "Loading...";

      this.elements.addToSite.classList.toggle('hidden', true)

      try {
        const subject = genre.toLowerCase().replace(/\s+/g, "_")
        const url = `https://openlibrary.org/subjects/${subject}.json?limit=50`

        const response = await fetch(url)
        const data = await response.json()

        if (!data.works || data.works.length === 0) {
          this.elements.bookResult.innerHTML = "No books found in this genre.";
          return;
        }

        const randomBook = data.works[Math.floor(Math.random() * data.works.length)];
        const title = randomBook.title;
        const author = randomBook.authors?.[0]?.name || "Unknown";
        this.lastTitle = title;
        this.lastAuthor = author;

        const coverId = randomBook.cover_id;
        const link = `https://openlibrary.org${randomBook.key}`;

        // Fetch full work data for the description
        const workResponse = await fetch(`https://openlibrary.org${randomBook.key}.json`);
        const workData = await workResponse.json();

        let description = "No description available.";
        if (typeof workData.description === "string") {
          description = workData.description;
        } else if (typeof workData.description === "object" && workData.description.value) {
          description = workData.description.value;
        }


        const coverImg = coverId
          ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
          : "images/book-placeholder.png";

        this.elements.bookResult.innerHTML = `
          <div class="book-card" onclick="window.open('${link}', '_blank')">
            <img src="${coverImg}" alt="${title} Cover">
            <div class="book-info">
              <h3>${title}</h3>
              <p class="author">by ${author}</p>
              <p class="description">${description}</p>
            </div>
          </div>
        `;

        this.elements.addToSite.classList.toggle('hidden', false)

      } catch (err) {
        console.error(err)
        this.elements.bookResult.innerHTML = "An error occurred while fetching the book"
      }
    },

    add_to_site: async () => {
      this.methods.route_to(`/submissions?title=${this.lastTitle}&author=${this.lastAuthor}`)
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

export { ShuffleView }