class FooterComponent {
  container = 'site-footer'
  template = '/app/components/footer/footer.html'
  style = '/app/components/footer/footer.css'

  mount = async (props) => {
    console.log('Footer Mounted')
  }
}

export { FooterComponent }