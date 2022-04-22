import api from './index'

const signup = (payload: { email: string, password: string, confirmPassword: string }) => api.post('/authen/signup', payload)
const signin = (payload: { email: string, password: string }) => api.post('/authen/signin', payload)
const signout = () => api.get('/authen/logout')

const authCheckSvc = () => api.get('/authen/check', {
  validateStatus: status => status >= 200 && status < 500
})

export {
  signup,
  signin,
  signout,
  authCheckSvc
}
