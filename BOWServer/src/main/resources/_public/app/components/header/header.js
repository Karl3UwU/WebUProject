class HeaderComponent {
  container = 'site-header'
  template = '/app/components/header/header.html'
  style = '/app/components/header/header.css'

  mount = async (props) => {
    console.log('Header Mounted')
  }
}

export { HeaderComponent }