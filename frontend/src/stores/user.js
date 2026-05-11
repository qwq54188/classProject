import { reactive } from 'vue'

export const userStore = reactive({
  user: null,
  
  setUser(user) {
    this.user = user
  },
  
  clearUser() {
    this.user = null
  },
  
  isLoggedIn() {
    return this.user !== null
  },
  
  isAdmin() {
    return this.user && this.user.role === 1
  }
})
