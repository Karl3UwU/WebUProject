import { mountView, unmountView, unmountAndMount } from "./core.js"

import { HomeView } from "../app/views/home/home.js"
import { BrowseView } from "../app/views/browse/browse.js"
import { ContactView } from "../app/views/contact-us/contact.js"
import { RegisterView } from "../app/views/register/register.js"
import { LoginView } from "../app/views/login/login.js"
import { BookView } from "../app/views/book/book.js"
import { CategoriesView } from "../app/views/categories/categories.js"
import { ProfileView } from "../app/views/profile/profile.js"
import { AccessibilityView } from "../app/views/accessibility/accessibility.js"
import { ShuffleView } from "../app/views/shuffle/shuffle.js"
import { ReviewsView } from "../app/views/reviews/reviews.js"
import { SubmissionsView } from "../app/views/submissions/submissions.js"
import { DashboardView } from "../app/views/dashboard/dashboard.js"

import { HeaderComponent } from "../app/components/header/header.js"
import { FooterComponent } from "../app/components/footer/footer.js"
import { DashboardSuggestionsView } from "../app/views/dashboard-suggestions/dashboard-suggestions.js"

const header_element = document.getElementById('components-header')
const footer_element = document.getElementById('components-footer')
const router_element = document.getElementById('views-router')

let current_route = ''

const routes = {
  '/home': HomeView,
  '/browse': BrowseView,
  '/contact-us': ContactView,
  '/register': RegisterView,
  '/login': LoginView,
  '/book': BookView,
  '/categories': CategoriesView,
  '/profile': ProfileView,
  '/accessibility': AccessibilityView,
  '/shuffle': ShuffleView,
  '/reviews': ReviewsView,
  '/submissions': SubmissionsView,
  '/dashboard': DashboardView,
  '/dashboard-suggestions': DashboardSuggestionsView,
}

const onRouteChange = async () => {
  let path = window.location.pathname;
  console.log(`Changing route from ${current_route} to ${path}`)
  if (current_route === path) return

  // Redirect '/' to '/home' internally (no reload)
  if (path === '/') {
    await route_to('/home')
    return
  }

  const ViewComponent = routes[path];
  if (!ViewComponent) {
    console.error('Route not found:', path)
    await route_to('/home')
    return
  }

  // Unmount and mount to new view
  await unmountAndMount(router_element, ViewComponent)
  current_route = path
}

// Intercept link clicks to prevent full page reload
document.body.addEventListener('click', (event) => {
  if (event.target.tagName === 'A') {
    const href = event.target.getAttribute('href')

    // Absolute external path, make exception
    const isExternal = href.startsWith('http') && !href.startsWith(location.origin)

    // Allow "mailto:" and "tel:"
    const isSpecialLink = href.startsWith('mailto:') || href.startsWith('tel:')

    if (isExternal || isSpecialLink) return

    // Default internal navigation
    event.preventDefault()
    history.pushState(null, '', href)
    onRouteChange()
  }
})

// Handle back/forward browser buttons
window.addEventListener('popstate', onRouteChange)

window.addEventListener('DOMContentLoaded', async () => {
  await mountView(header_element, HeaderComponent)
  mountView(footer_element, FooterComponent)
  onRouteChange()
})

const route_to = async (href) => {
  const link = document.createElement('a')
  link.href = href
  link.style.display = 'none'
  document.body.appendChild(link)

  const event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window })
  link.dispatchEvent(event)

  document.body.removeChild(link)
}