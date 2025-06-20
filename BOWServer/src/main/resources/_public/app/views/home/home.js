class HomeView {
  container = 'home-view'
  template = '/app/views/home/home.html'
  style = '/app/views/home/home.css'

  elements = {
    message: 'props-message',
  }

  props = {
    message: 'fallback message',
  }

  methods = {
    update_message: async () => {
      this.elements.message.innerHTML = this.props.message
    }
  }

  mount = async (props) => {
    if(props?.message) this.props.message = props.message

    this.methods.update_message()

    console.log('Home Mounted')
  }
}

export { HomeView }