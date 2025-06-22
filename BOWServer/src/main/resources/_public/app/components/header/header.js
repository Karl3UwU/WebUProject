class HeaderComponent {
  container = 'site-header'
  template = '/app/components/header/header.html'
  style = '/app/components/header/header.css'

  previous_login_state = false
  isLoggedIn = false

  elements = {
    login_btn: 'login-btn',
    signup_btn: 'signup-btn',
    logout_btn: 'logout-btn',
    profile_btn: 'profile-btn',
  }

  mount = async (props) => {
    this.elements.logout_btn.addEventListener('click', async () => this.methods.logout_user())

    await this.methods.verify_login()
  }

  methods = {
    verify_token: async () => {
      const authToken = window.localStorage.getItem('authToken')
      if(!authToken) {
        this.isLoggedIn = false
        return
      }

      const result = await fetch('/api/auth/verify-token', {
        method: 'GET',
        headers: {
          'Authorization': authToken
        }
      })
      if(!result.ok) {
        this.isLoggedIn = false
        return
      }

      const isValidToken = await result.json()
      if(!isValidToken) {
        this.isLoggedIn = false
        return
      }
      this.isLoggedIn = true
    },

    verify_login: async () => {
      await this.methods.verify_token()
      if(this.previous_login_state === this.isLoggedIn) return

      this.previous_login_state = this.isLoggedIn
      await this.methods.update_header()
    },

    update_header: async () => {
      this.elements.login_btn.classList.toggle('hidden', this.isLoggedIn)
      this.elements.signup_btn.classList.toggle('hidden', this.isLoggedIn)

      this.elements.logout_btn.classList.toggle('hidden', !this.isLoggedIn)
      this.elements.profile_btn.classList.toggle('hidden', !this.isLoggedIn)
    },

    logout_user: async () => {
      const authToken = window.localStorage.getItem('authToken')
      if(!authToken) {
        this.isLoggedIn = false
        console.warn('logout_user called but no auth token was found')
        return
      }

      const result = await fetch('/api/auth/logout-user', {
        method: 'POST',
        headers: {
          'Authorization': authToken
        }
      })

      console.log(`Lodded out with response: ${await result.json()}`)
      window.localStorage.removeItem('authToken')
      await this.methods.verify_login()
    }
  }
}

export { HeaderComponent }