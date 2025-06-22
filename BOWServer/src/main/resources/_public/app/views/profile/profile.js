class ProfileView {
  container = 'register-view'
  template = '/app/views/register/register.html'
  style = '/app/views/register/register.css'

  elements = {
    readingList: 'readingList',

    userName: 'userName',
    userEmail: 'userEmail',
    userRole: 'userRole',
    userFullName: 'userFullName',

    loadMoreBooks: 'loadMoreBooks',
    loadMoreReviews: 'loadMoreReviews',
  }

  mount = async (props) => {
  }

  methods = {
  }
}

export { ProfileView }