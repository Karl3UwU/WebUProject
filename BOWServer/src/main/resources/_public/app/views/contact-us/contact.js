class ContactView {
  container = 'contact-view'
  template = '/app/views/contact-us/contact.html'
  style = '/app/views/contact-us/contact.css'

  mount = async (props) => {
    console.log('Contact Us Mounted')
  }
}

export { ContactView }