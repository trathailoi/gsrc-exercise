import Axios from 'axios'

const api = Axios.create({
  baseURL: `${import.meta.env.VITE_BASE_API || ''}${import.meta.env.VITE_BASE_API_VERSION || '/api/v1.0'}`,
  withCredentials: true
})

const SOMETHING_WRONG_MESSAGE = 'Something went wrong'

api.interceptors.response.use(
  (res) => res,
  (err: any) => {
    if (err instanceof Axios.Cancel) {
      return
    }
    window.$message.destroyAll()
    if (err.response) {
      if (err.response.data.showMessage) {
        window.$message.error(err.response.data.message || SOMETHING_WRONG_MESSAGE)
      } else {
        window.$message.error(err.message)
      }
    } else if (err.request) {
      window.$message.error(err.request.responseText || SOMETHING_WRONG_MESSAGE)
    } else {
      window.$message.error(err.message || SOMETHING_WRONG_MESSAGE)
    }
    return Promise.reject(err)
  }
)

export default api
