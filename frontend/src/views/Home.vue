<template>
  <div class="home">
    <h2>热点地图</h2>
    <div class="heatmap">
      <div 
        v-for="(point, index) in heatmapPoints" 
        :key="index"
        class="heatmap-point"
        :style="{
          left: point.x + '%',
          top: point.y + '%',
          width: getPointSize(point.voteCount) + 'px',
          height: getPointSize(point.voteCount) + 'px',
          background: `rgba(102,126,234,${getPointOpacity(point.voteCount)})`
        }"
      >
        <span class="heatmap-label">{{ point.location }} ({{ point.voteCount }})</span>
      </div>
    </div>
    
    <h2>提案列表</h2>
    <div class="filters">
      <select v-model="filters.category" @change="loadProposals">
        <option value="">全部分类</option>
        <option value="道路">道路</option>
        <option value="绿化">绿化</option>
        <option value="照明">照明</option>
        <option value="公共设施">公共设施</option>
      </select>
      <select v-model="filters.status" @change="loadProposals">
        <option value="">全部状态</option>
        <option value="0">待处理</option>
        <option value="1">已解决</option>
      </select>
    </div>
    
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="proposals.length === 0" class="empty">暂无提案</div>
    <div v-else class="proposal-list">
      <div 
        v-for="proposal in proposals" 
        :key="proposal.id" 
        class="card"
        @click="goDetail(proposal.id)"
      >
        <h3>{{ proposal.title }}</h3>
        <div class="meta">
          <span :class="['status', proposal.status === 1 ? 'status-resolved' : 'status-pending']">
            {{ proposal.status === 1 ? '已解决' : '待处理' }}
          </span>
          <span>{{ proposal.category || '未分类' }}</span>
          <span>📍 {{ proposal.locationName || '未知地点' }}</span>
        </div>
        <p class="description">{{ proposal.description }}</p>
        <div class="actions">
          <span class="vote-count">👍 {{ proposal.voteCount }} 附议</span>
          <button 
            class="btn" 
            @click.stop="handleVote(proposal.id)"
            :disabled="proposal.hasVoted"
          >
            {{ proposal.hasVoted ? '已附议' : '附议' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { proposalAPI } from '../utils/api'

const router = useRouter()
const loading = ref(true)
const proposals = ref([])
const filters = reactive({
  category: '',
  status: ''
})

const heatmapPoints = ref([
  { x: 20, y: 30, location: '市中心广场', voteCount: 0 },
  { x: 50, y: 50, location: '东区公园', voteCount: 0 },
  { x: 75, y: 25, location: '西湖边', voteCount: 0 },
  { x: 35, y: 70, location: '南区社区', voteCount: 0 },
  { x: 65, y: 65, location: '北区商圈', voteCount: 0 }
])

const getPointSize = (count) => Math.min(100, Math.max(30, count * 10 + 30))
const getPointOpacity = (count) => Math.min(0.9, 0.3 + count * 0.1)

const goDetail = (id) => router.push(`/detail/${id}`)

const loadProposals = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.category) params.category = filters.category
    if (filters.status !== '') params.status = filters.status
    
    const res = await proposalAPI.list(params)
    proposals.value = res.data.proposals || []
    
    heatmapPoints.value.forEach(point => {
      const matching = proposals.value.filter(p => 
        p.locationName && p.locationName.includes(point.location)
      )
      point.voteCount = matching.reduce((sum, p) => sum + (p.voteCount || 0), 0)
    })
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleVote = async (id) => {
  try {
    const res = await proposalAPI.vote(id)
    if (res.data.success) {
      loadProposals()
    } else {
      alert(res.data.message)
    }
  } catch (e) {
    alert(e.response?.data?.message || '附议失败')
  }
}

onMounted(() => {
  loadProposals()
})
</script>

<style scoped>
.home {
  padding: 20px 0;
}

.home h2 {
  margin: 20px 0;
  color: #333;
}

.heatmap {
  position: relative;
  height: 300px;
  background: linear-gradient(180deg, #e8f4fd 0%, #f5f7fa 100%);
  border-radius: 12px;
  margin-bottom: 30px;
  overflow: hidden;
}

.heatmap-point {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  cursor: pointer;
}

.heatmap-point:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.heatmap-label {
  font-size: 0.8rem;
  color: white;
  text-align: center;
  padding: 5px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.filters select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
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

.proposal-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.card h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.2rem;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
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

.description {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.6;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vote-count {
  font-size: 0.95rem;
  color: #555;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
