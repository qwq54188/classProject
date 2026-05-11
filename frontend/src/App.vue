<template>
  <div id="app">
    <header>
      <div class="header-content">
        <div class="logo">
          <h1>街声</h1>
          <p class="subtitle">城市微更新公众提案平台</p>
        </div>
        <nav v-if="userStore.user">
          <span class="welcome">欢迎, {{ userStore.user.username }}</span>
          <button v-if="userStore.isAdmin()" @click="goAdmin">管理面板</button>
          <button v-else @click="goHome">首页</button>
          <button v-if="!userStore.isAdmin()" @click="showCreateModal = true">发布提案</button>
          <button @click="handleLogout">退出</button>
        </nav>
        <nav v-else>
          <button @click="goLogin">登录</button>
          <button @click="goRegister">注册</button>
        </nav>
      </div>
    </header>
    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <div v-if="showCreateModal" class="modal" @click.self="showCreateModal = false">
      <div class="modal-content">
        <h2>发布提案</h2>
        <form @submit.prevent="handleCreate">
          <div class="form-group">
            <label>标题</label>
            <input v-model="createForm.title" type="text" required>
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="createForm.description" required></textarea>
          </div>
          <div class="form-group">
            <label>分类</label>
            <select v-model="createForm.category">
              <option value="道路">道路</option>
              <option value="绿化">绿化</option>
              <option value="照明">照明</option>
              <option value="公共设施">公共设施</option>
            </select>
          </div>
          <div class="form-group">
            <label>地点名称</label>
            <input v-model="createForm.locationName" type="text" required>
          </div>
          <div class="form-group">
            <label>图片路径 (如: img/pothole.jpg)</label>
            <input v-model="createForm.photoUrl" type="text">
          </div>
          <div class="form-actions">
            <button type="submit" class="btn">发布</button>
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { userStore } from './stores/user'
import { authAPI, proposalAPI } from './utils/api'

const router = useRouter()
const showCreateModal = ref(false)
const createForm = reactive({
  title: '',
  description: '',
  category: '道路',
  locationName: '',
  photoUrl: ''
})

const goLogin = () => router.push('/login')
const goRegister = () => router.push('/register')
const goHome = () => router.push('/')
const goAdmin = () => router.push('/admin')

const handleLogout = async () => {
  await authAPI.logout()
  userStore.clearUser()
  router.push('/login')
}

const handleCreate = async () => {
  try {
    await proposalAPI.create(createForm)
    showCreateModal.value = false
    createForm.title = ''
    createForm.description = ''
    createForm.category = '道路'
    createForm.locationName = ''
    createForm.photoUrl = ''
    router.push('/')
  } catch (e) {
    alert(e.response?.data?.message || '发布失败')
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  font-size: 2rem;
  font-weight: 600;
}

.logo .subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-top: 4px;
}

nav {
  display: flex;
  gap: 10px;
  align-items: center;
}

nav .welcome {
  margin-right: 15px;
}

nav button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

nav button:hover {
  background: rgba(255, 255, 255, 0.3);
}

main {
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  margin-bottom: 25px;
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

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}

.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
  transform: none;
  box-shadow: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
