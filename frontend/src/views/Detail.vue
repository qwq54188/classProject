<template>
  <div class="detail">
    <button class="btn btn-secondary" @click="goBack">← 返回</button>
    
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="!proposal" class="empty">提案不存在</div>
    <div v-else class="proposal-detail">
      <h2>{{ proposal.title }}</h2>
      <div class="meta">
        <span :class="['status', proposal.status === 1 ? 'status-resolved' : 'status-pending']">
          {{ proposal.status === 1 ? '已解决' : '待处理' }}
        </span>
        <span>{{ proposal.category || '未分类' }}</span>
        <span>📍 {{ proposal.locationName || '未知地点' }}</span>
      </div>
      
      <img v-if="proposal.photoUrl" :src="getImageUrl(proposal.photoUrl)" class="proposal-image">
      
      <p class="description">{{ proposal.description }}</p>
      
      <div class="vote-section">
        <span class="vote-count">👍 {{ proposal.voteCount }} 附议</span>
        <button 
          v-if="!proposal.hasVoted" 
          class="btn" 
          @click="handleVote"
        >
          附议
        </button>
        <span v-else class="voted">已附议</span>
      </div>
      
      <div v-if="proposal.status === 1 && proposal.resultDesc" class="result-section">
        <h3>处理结果</h3>
        <p>{{ proposal.resultDesc }}</p>
        <div v-if="proposal.resultPhotoUrl || proposal.photoUrl" class="image-comparison">
          <div v-if="proposal.photoUrl" class="comparison-item">
            <img :src="getImageUrl(proposal.photoUrl)">
            <div class="label">整改前</div>
          </div>
          <div v-if="proposal.resultPhotoUrl" class="comparison-item">
            <img :src="getImageUrl(proposal.resultPhotoUrl)">
            <div class="label">整改后</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { proposalAPI } from '../utils/api'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const proposal = ref(null)

const goBack = () => router.push('/')

const getImageUrl = (path) => {
  if (!path) return ''
  return path.startsWith('/') ? path : '/' + path
}

const loadProposal = async () => {
  loading.value = true
  try {
    const res = await proposalAPI.get(route.params.id)
    if (res.data.success) {
      proposal.value = res.data.proposal
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleVote = async () => {
  try {
    const res = await proposalAPI.vote(route.params.id)
    if (res.data.success) {
      loadProposal()
    } else {
      alert(res.data.message)
    }
  } catch (e) {
    alert(e.response?.data?.message || '附议失败')
  }
}

onMounted(() => {
  loadProposal()
})
</script>

<style scoped>
.detail {
  padding: 20px 0;
}

.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  background: #f0f0f0;
  color: #333;
  margin-bottom: 20px;
}

.btn-secondary:hover {
  background: #e0e0e0;
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
}

.proposal-detail {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.proposal-detail h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 1.8rem;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-resolved {
  background: #d4edda;
  color: #155724;
}

.proposal-image {
  max-width: 100%;
  max-height: 400px;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 12px;
  margin-bottom: 20px;
  display: block;
}

.description {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #444;
  margin-bottom: 25px;
}

.vote-section {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 30px;
}

.vote-count {
  font-size: 1.2rem;
  color: #555;
}

.btn {
  padding: 12px 30px;
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

.voted {
  padding: 12px 30px;
  background: #d4edda;
  color: #155724;
  border-radius: 8px;
}

.result-section {
  background: #d4edda;
  padding: 25px;
  border-radius: 12px;
  margin-top: 30px;
}

.result-section h3 {
  color: #155724;
  margin-bottom: 15px;
}

.result-section p {
  color: #155724;
  line-height: 1.8;
}

.image-comparison {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.comparison-item {
  flex: 1;
  min-width: 200px;
}

.comparison-item img {
  width: 100%;
  max-height: 300px;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  display: block;
}

.comparison-item .label {
  text-align: center;
  margin-top: 10px;
  font-size: 0.9rem;
  color: #155724;
  font-weight: 500;
}
</style>
