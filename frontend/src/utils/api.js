import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
})

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  current: () => api.get('/auth/current')
}

export const proposalAPI = {
  list: (params) => api.get('/proposals', { params }),
  get: (id) => api.get(`/proposals/${id}`),
  create: (data) => api.post('/proposals', data),
  vote: (id) => api.post(`/proposals/${id}/vote`),
  updateStatus: (id, data) => api.put(`/proposals/${id}/status`, data)
}
