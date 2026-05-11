<template>
  <div class="admin">
    <h2>管理面板</h2>
    
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="proposals.length === 0" class="empty">暂无提案</div>
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>分类</th>
            <th>地点</th>
            <th>状态</th>
            <th>附议数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="proposal in proposals" :key="proposal.id">
            <td>{{ proposal.id }}</td>
            <td>{{ proposal.title }}</td>
            <td>{{ proposal.category || '-' }}</td>
            <td>{{ proposal.locationName || '-' }}</td>
            <td>
              <span :class="['status', proposal.status === 1 ? 'status-resolved' : 'status-pending']">
                {{ proposal.status === 1 ? '已解决' : '待处理' }}
              </span>
            </td>
            <td>{{ proposal.voteCount }}</td>
            <td>
              <button 
                v-if="proposal.status === 0"
                class="btn btn-success" 
                @click="showResolveModal(proposal.id)"
              >
                处理
              </button>
              <span v-else class="resolved-text">已处理</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="showModal" class="modal" @click.self="showModal = false">
      <div class="modal-content">
        <h2>处理提案</h2>
        <form @submit.prevent="handleResolve">
          <div class="form-group">
            <label>处理结果描述</label>
            <textarea v-model="resolveForm.resultDesc" required></textarea>
          </div>
          <div class="form-group">
            <label>处理后图片路径</label>
            <input v-model="resolveForm.resultPhotoUrl" type="text">
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-success">标记为已解决</button>
            <button type="button" class="btn btn-secondary" @click="showModal = false">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { proposalAPI } from '../utils/api'

const loading = ref(true)
const proposals = ref([])
const showModal = ref(false)
const currentProposalId = ref(null)
const resolveForm = reactive({
  resultDesc: '',
  resultPhotoUrl: ''
})

const loadProposals = async () => {
  loading.value = true
  try {
    const res = await proposalAPI.list()
    proposals.value = res.data.proposals || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const showResolveModal = (id) => {
  currentProposalId.value = id
  showModal.value = true
  resolveForm.resultDesc = ''
  resolveForm.resultPhotoUrl = ''
}

const handleResolve = async () => {
  try {
    const res = await proposalAPI.updateStatus(currentProposalId.value, {
      status: 1,
      resultDesc: resolveForm.resultDesc,
      resultPhotoUrl: resolveForm.resultPhotoUrl
    })
    if (res.data.success) {
      showModal.value = false
      loadProposals()
    } else {
      alert(res.data.message)
    }
  } catch (e) {
    alert(e.response?.data?.message || '处理失败')
  }
}

onMounted(() => {
  loadProposals()
})
</script>

<style scoped>
.admin {
  padding: 20px 0;
}

.admin h2 {
  margin-bottom: 30px;
  color: #333;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}

.empty {
  text-align: center;
  padding: 50px;
  color: #666;
  background: white;
  border-radius: 12px;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

th, td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-resolved {
  background: #d4edda;
  color: #155724;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.resolved-text {
  color: #666;
  font-size: 0.9rem;
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
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
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

.form-actions .btn {
  flex: 1;
  padding: 12px;
  font-size: 1rem;
}
</style>
