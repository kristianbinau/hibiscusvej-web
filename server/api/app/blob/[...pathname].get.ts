export default eventHandler(async (event) => {
    const { pathname } = getRouterParams(event)

    console.log('Blob', pathname)
  
    setHeader(event, 'Content-Security-Policy', 'default-src \'none\';')
    return hubBlob().serve(event, pathname)
  })