const genres = {
  FANTASY: "Magic, mythical creatures, and epic adventures.",
  SCIENCE_FICTION: "Futuristic tech, space travel, and scientific speculation.",
  MYSTERY: "Investigations, secrets, and unsolved crimes.",
  THRILLER: "Fast-paced, tense, and full of suspense.",
  ROMANCE: "Emotional love stories and relationships.",
  HORROR: "Terrifying tales of the supernatural and unknown.",
  YOUNG_ADULT: "Coming-of-age stories for teen readers.",
  CHILDREN_FICTION: "Stories for young readers with fun and lessons.",
  BIOGRAPHY: "Real stories of remarkable people's lives.",
  AUTOBIOGRAPHY: "People telling their own life story.",
  HISTORY: "Books rooted in past events and civilizations.",
  SELF_HELP: "Guides to improve life, mindset, and productivity.",
  SCIENCE: "Books about the natural world and discoveries.",
  TRAVEL: "Adventures, cultures, and destinations around the world.",
  CYBERPUNK: "Dystopian futures with high tech and low life.",
  CLASSIC: "Timeless literature that shaped the literary world.",
  MEMOIR: "Personal reflections and lived experiences.",
  DRAMA: "Emotion-driven stories often exploring real conflicts.",
  HUMOR: "Light-hearted, funny books to make you laugh.",
  FICTION: "Imaginative storytelling across genres.",
  PHILOSOPHY: "Thought-provoking texts on life, ethics, and existence."
}

class CategoriesView {
  container = 'categories-view'
  template = '/app/views/categories/categories.html'
  style = '/app/views/categories/categories.css'

  elements = {
    genresGrid: 'genresGrid'
  }

  mount = async (props) => {
    this.methods.load_categories()
  }

  methods = {
    load_categories: async () => {
      for(const key of Object.keys(genres)) {
        const description = genres[key]
        const readableName = key
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase())
        
        const card = document.createElement("div")
        card.classList.add('genre-card')
        card.innerHTML = `
          <h3>${readableName}</h3>
          <p class="genre-description">${description}</p>
        `
        card.addEventListener('click', async () => {
          const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
          this.methods.route_to(`/browse?selectedGenre=${formattedKey}`)
        })
        this.elements.genresGrid.appendChild(card)
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

export { CategoriesView }