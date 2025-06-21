class LoginView {
  container = 'login-view'
  template = '/app/views/login/login.html'
  style = '/app/views/login/login.css'

  elements = {
    HEADER: 'components-header',
    loginForm: 'loginForm',
    email: 'email',
    password: 'password',
  }

  mount = async (props) => {
    // verify if user is already logged in
    if(this.elements.HEADER.__instance.isLoggedIn) {
      await this.methods.route_to('home')
      return
    }

    this.elements.loginForm.addEventListener('submit', async (event) => this.methods.send_login(event))
  }

  methods = {
    send_login: async (event) => {
      event.preventDefault()

      const email = this.elements.email.value.trim()
      const password = this.elements.password.value

      const errors = []

      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        errors.push("Valid email is required.")
      }

      if (!password) {
        errors.push("Password is required.")
      }

      if (errors.length > 0) {
        alert(errors.join("\n"))
        return
      }

      const loginData = { email, password }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(loginData)
      })

      if(!response.ok) {
        alert('Login failed')
        return
      }
      
      const data = await response.json()
      if(!data) {
        alert(data.message || 'Login failed')
        return
      }

      localStorage.setItem('authToken', data.authToken)
      console.log(this.elements.HEADER)
      await this.elements.HEADER.__instance.methods.verify_login()
      await this.methods.route_to('home')
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

export { LoginView }