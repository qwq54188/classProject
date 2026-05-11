<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="form.username" type="text" required placeholder="请输入用户名">
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" required placeholder="请输入密码">
        </div>
        <button type="submit" class="btn" style="width:100%;">登录</button>
      </form>
      <p class="link">
        还没有账号? <a href="#" @click.prevent="goRegister">立即注册</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { userStore } from '../stores/user'
import { authAPI } from '../utils/api'

const router = useRouter()
const form = reactive({
  username: '',
  password: ''
})

const goRegister = () => router.push('/register')

const handleLogin = async () => {
  try {
    const res = await authAPI.login(form)
    if (res.data.success) {
      userStore.setUser(res.data.user)
      if (res.data.user.role === 1) {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } else {
      alert(res.data.message)
    }
  } catch (e) {
    alert(e.response?.data?.message || '登录失败')
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.link a {
  color: #667eea;
  text-decoration: none;
}

.link a:hover {
  text-decoration: underline;
}
</style>
