import { RegisterModalComponent } from "../../components/register-modal/register-modal.js"

class RegisterView {
  container = 'register-view'
  template = '/app/views/register/register.html'
  style = '/app/views/register/register.css'

  components = {
    'confirmation-modal': {
      component: RegisterModalComponent,
      props: undefined
    }
  }

  elements = {
    registerForm: 'registerForm',
    username: 'username',
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'email',
    password: 'password',
    confirmPassword: 'confirmPassword',

    test_modal: 'test-modal',
  }

  mount = async (props) => {
    this.elements.registerForm.addEventListener('submit', async (event) => await this.methods.register_user(event))
  }

  methods = {
    open_modal: async () => {
      this.components['confirmation-modal'].instance.methods.update_visibility(true)
    },

    register_user: async (event) => {
      event.preventDefault()
      const form = {
        'username': this.elements.username.value.trim(),
        'firstName': this.elements.firstName.value.trim(),
        'lastName': this.elements.lastName.value.trim(),
        'email': this.elements.email.value.trim(),
        'password': this.elements.password.value,
        'confirmPassword': this.elements.confirmPassword.value,
      }

      const errors = []

      // Basic validation
      if (!form['username']) errors.push("Username is required.");
      if (!form['email'] || !/\S+@\S+\.\S+/.test(form['email'])) errors.push("Valid email is required.")
      if (!form['password'] || form['password'].length < 6) errors.push("Password must be at least 6 characters.")
      if (form['password'] !== form['confirmPassword']) errors.push("Passwords do not match.")

      if (errors.length > 0) {
        alert(errors.join("\n"))
        return;
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form)
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.text()
        window.sessionStorage.setItem('registrationSessionId', result)
        await this.methods.open_modal()

      } catch (error) {
        console.error('Error registering user:', error)
      }
    },
  }
}

export { RegisterView }