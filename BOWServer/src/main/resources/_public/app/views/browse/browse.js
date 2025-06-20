class BrowseView {
  container = 'browse-view'
  template = '/app/views/browse/browse.html'
  style = '/app/views/browse/browse.css'

  mount = async (props) => {
    console.log('Browse Mounted')
  }
}

export { BrowseView }