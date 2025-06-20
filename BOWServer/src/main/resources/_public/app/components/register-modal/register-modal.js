class RegisterModalComponent {
  container = 'register-modal'
  template = '/app/components/register-modal/register-modal.html'
  style = '/app/components/register-modal/register-modal.css'

  visible = false

  elements = {
    CONTAINER: this.container,
    closeButton: 'close-button',
    code_field: 'verification-code',
    verification_form: 'verification-form'
  }

  mount = async (props) => {
    this.methods.update_visibility(false)

    this.elements.closeButton.addEventListener('click', async (event) => await this.methods.update_visibility(false))

    this.elements.verification_form.addEventListener('submit', async (event) => await this.methods.confirm_user(event))
  }

  methods = {
    update_visibility: async (new_state) => {
      this.visible = new_state
      this.elements.CONTAINER.classList.toggle('hidden', !this.visible)
    },

    confirm_user: async (event) => {
      event.preventDefault()
      const sessionId = window.sessionStorage.getItem('registrationSessionId')
      const verificationCode = this.elements.code_field.value.trim()
      const params_data = {
        'sessionId': sessionId,
        'verificationCode': verificationCode
      }

      try {
        const response = await fetch('/api/auth/confirm-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(params_data)
        })

        if(!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.text()

        if(result !== 'confirm') {
          throw new Error(`Failed to confirm user: ${response.status}`)
        }

        this.methods.update_visibility(false)

      } catch (error) {
        console.error('Error registering user:', error)
      }
    }
  }
}

export { RegisterModalComponent }