const RESOURCE_CACHE = {}

const mountView = async (parent, ViewComponent, props) => {
  // get view
  const instance = new ViewComponent()

  parent.innerHTML = ''
  parent.setAttribute('data-component-id', instance.container)

  // load css style
  if(instance.style) {
    const css_style = await fetchResource(instance.style)
    if (!css_style) {
      console.error('Failed to load component CSS:', component)
      return
    }

    const styleTag = document.createElement('style');
    styleTag.setAttribute('data-style-id', instance.container)
    styleTag.textContent = css_style
    document.head.appendChild(styleTag)
  }

  // load html template
  if(instance.template) {
    const html_template = await fetchResource(instance.template)
    if(!html_template) {
      console.error('Failed to load component html', component)
      return
    }
    parent.innerHTML = html_template
  }

  // load elements
  if(instance.elements) for(const key of Object.keys(instance.elements)) {
    instance.elements[key] = document.getElementById(instance.elements[key])
  }

  // load child components
  if(instance.components) for(const key of Object.keys(instance.components)) {
    const instance_container = document.getElementById(key)
    instance.components[key].instance = await mountView(instance_container, instance.components[key].component, instance.components[key].props)
  }

  // mount
  await instance.mount(props)
  parent.__viewInstance = instance
  return instance
}

const unmountView = async (parent) => {
  const instance = parent.__viewInstance
  if (!instance) return

  // Remove HTML content
  parent.innerHTML = ''
  parent.removeAttribute('data-component-id')

  // Remove associated CSS
  const styleTag = document.querySelector(`style[data-style-id="${instance.container}"]`)
  if (styleTag) styleTag.remove()

  // Cleanup reference
  delete parent.__viewInstance
}

const unmountAndMount = async (parent, ViewComponent, props) => {
  const parent_instance = parent.__viewInstance
  const instance = new ViewComponent()

  let css_style = undefined
  let html_template = undefined

  // load css style
  if(instance.style) {
    css_style = await fetchResource(instance.style)
    if (!css_style) {
      console.error('Failed to load component CSS:', component)
      return
    }
  }

  // load html template
  if(instance.template) {
    html_template = await fetchResource(instance.template)
    if(!html_template) {
      console.error('Failed to load component html', component)
      return
    }
  }

  // UNMOUNT PREVIOUS INSTANCE
  if(parent_instance) {
    // Remove HTML content
    parent.innerHTML = ''
    parent.removeAttribute('data-component-id')

    // Remove associated CSS
    const styleTag = document.querySelector(`style[data-style-id="${instance.container}"]`)
    if (styleTag) styleTag.remove()

    // Cleanup reference
    delete parent.__viewInstance
  }

  // MOUNT NEW INSTANCE
  // mount css
  if(css_style) {
    const styleTag = document.createElement('style');
    styleTag.setAttribute('data-style-id', instance.container)
    styleTag.textContent = css_style
    document.head.appendChild(styleTag)
  }
  // mount html
  if(html_template) {
    parent.innerHTML = html_template
  }

  // load elements
  if(instance.elements) for(const key of Object.keys(instance.elements)) {
    instance.elements[key] = document.getElementById(instance.elements[key])
  }

  // load child components
  if(instance.components) for(const key of Object.keys(instance.components)) {
    const instance_container = document.getElementById(key)
    instance.components[key].instance = await mountView(instance_container, instance.components[key].component, instance.components[key].props)
  }

  // mount
  await instance.mount(props)
  parent.__viewInstance = instance
  return instance
}

const fetchResource = async (path) => {
  // check if resource already fetched
  const resource_path = `/resource/${path}`
  if(RESOURCE_CACHE[resource_path]) return RESOURCE_CACHE[resource_path]

  // fetch resource
  const resource = await fetch(`/resource/${path}`)
  if(!resource.ok) return null

  // save resource to cache and return
  const resource_text = await resource.text()
  RESOURCE_CACHE[resource_path] = resource_text
  return await RESOURCE_CACHE[resource_path]
}

export { mountView, unmountView, unmountAndMount }