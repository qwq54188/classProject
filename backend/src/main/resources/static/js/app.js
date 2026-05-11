let currentUser = null;
let currentPage = 'home';

const heatmapPoints = [
    { x: 20, y: 30, location: '市中心广场', voteCount: 0 },
    { x: 50, y: 50, location: '东区公园', voteCount: 0 },
    { x: 75, y: 25, location: '西湖边', voteCount: 0 },
    { x: 35, y: 70, location: '南区社区', voteCount: 0 },
    { x: 65, y: 65, location: '北区商圈', voteCount: 0 }
];

async function init() {
    await checkAuth();
    renderNav();
    router();
}

async function checkAuth() {
    try {
        const res = await fetch('/api/auth/current');
        const data = await res.json();
        if (data.success) {
            currentUser = data.user;
        }
    } catch (e) {
        console.error(e);
    }
}

function renderNav() {
    const nav = document.getElementById('nav');
    let html = '';
    
    if (currentUser) {
        html += `&lt;span style="color:white; margin-right:20px;"&gt;欢迎, ${currentUser.username}&lt;/span&gt;`;
        
        if (currentUser.role === 1) {
            html += `&lt;button onclick="navigate('admin')"&gt;管理面板&lt;/button&gt;`;
        } else {
            html += `&lt;button onclick="navigate('home')"&gt;首页&lt;/button&gt;`;
            html += `&lt;button onclick="showCreateModal()"&gt;发布提案&lt;/button&gt;`;
        }
        
        html += `&lt;button onclick="logout()"&gt;退出&lt;/button&gt;`;
    } else {
        html += `&lt;button onclick="navigate('login')"&gt;登录&lt;/button&gt;`;
        html += `&lt;button onclick="navigate('register')"&gt;注册&lt;/button&gt;`;
    }
    
    nav.innerHTML = html;
}

function navigate(page) {
    currentPage = page;
    router();
}

function router() {
    const main = document.getElementById('main');
    
    if (!currentUser) {
        if (currentPage === 'register') {
            renderRegister();
        } else {
            renderLogin();
        }
        return;
    }
    
    if (currentUser.role === 1) {
        renderAdmin();
    } else {
        if (currentPage === 'detail') {
            renderDetail();
        } else {
            renderHome();
        }
    }
}

function renderLogin() {
    const main = document.getElementById('main');
    main.innerHTML = `
        &lt;div style="max-width:400px; margin:0 auto;"&gt;
            &lt;h2 style="text-align:center; margin-bottom:30px;"&gt;登录&lt;/h2&gt;
            &lt;form onsubmit="handleLogin(event)"&gt;
                &lt;div class="form-group"&gt;
                    &lt;label&gt;用户名&lt;/label&gt;
                    &lt;input type="text" id="loginUsername" required&gt;
                &lt;/div&gt;
                &lt;div class="form-group"&gt;
                    &lt;label&gt;密码&lt;/label&gt;
                    &lt;input type="password" id="loginPassword" required&gt;
                &lt;/div&gt;
                &lt;button type="submit" class="btn" style="width:100%;"&gt;登录&lt;/button&gt;
            &lt;/form&gt;
            &lt;p style="text-align:center; margin-top:20px;"&gt;
                还没有账号? &lt;a href="#" onclick="navigate('register')"&gt;立即注册&lt;/a&gt;
            &lt;/p&gt;
        &lt;/div&gt;
    `;
}

function renderRegister() {
    const main = document.getElementById('main');
    main.innerHTML = `
        &lt;div style="max-width:400px; margin:0 auto;"&gt;
            &lt;h2 style="text-align:center; margin-bottom:30px;"&gt;注册&lt;/h2&gt;
            &lt;form onsubmit="handleRegister(event)"&gt;
                &lt;div class="form-group"&gt;
                    &lt;label&gt;用户名&lt;/label&gt;
                    &lt;input type="text" id="registerUsername" required&gt;
                &lt;/div&gt;
                &lt;div class="form-group"&gt;
                    &lt;label&gt;密码&lt;/label&gt;
                    &lt;input type="password" id="registerPassword" required&gt;
                &lt;/div&gt;
                &lt;button type="submit" class="btn" style="width:100%;"&gt;注册&lt;/button&gt;
            &lt;/form&gt;
            &lt;p style="text-align:center; margin-top:20px;"&gt;
                已有账号? &lt;a href="#" onclick="navigate('login')"&gt;立即登录&lt;/a&gt;
            &lt;/p&gt;
        &lt;/div&gt;
    `;
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    if (data.success) {
        currentUser = data.user;
        renderNav();
        router();
    } else {
        alert(data.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    if (data.success) {
        alert('注册成功，请登录');
        navigate('login');
    } else {
        alert(data.message);
    }
}

async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    currentUser = null;
    renderNav();
    router();
}

async function renderHome() {
    const main = document.getElementById('main');
    main.innerHTML = '&lt;p&gt;加载中...&lt;/p&gt;';
    
    const proposals = await fetchProposals();
    
    heatmapPoints.forEach(point =&gt; {
        const matching = proposals.filter(p =&gt; p.locationName &amp;&amp; p.locationName.includes(point.location));
        point.voteCount = matching.reduce((sum, p) =&gt; sum + (p.voteCount || 0), 0);
    });
    
    main.innerHTML = `
        &lt;h2&gt;热点地图&lt;/h2&gt;
        &lt;div class="heatmap" id="heatmap"&gt;
            ${heatmapPoints.map(point =&gt; {
                const size = Math.min(100, Math.max(30, point.voteCount * 10 + 30));
                const opacity = Math.min(0.9, 0.3 + point.voteCount * 0.1);
                return `
                    &lt;div class="heatmap-point" style="left:${point.x}%; top:${point.y}%; width:${size}px; height:${size}px; background:rgba(102,126,234,${opacity});"&gt;
                        &lt;span class="heatmap-label"&gt;${point.location} (${point.voteCount})&lt;/span&gt;
                    &lt;/div&gt;
                `;
            }).join('')}
        &lt;/div&gt;
        
        &lt;h2&gt;提案列表&lt;/h2&gt;
        &lt;div class="filters"&gt;
            &lt;select id="filterCategory" onchange="loadProposals()"&gt;
                &lt;option value=""&gt;全部分类&lt;/option&gt;
                &lt;option value="道路"&gt;道路&lt;/option&gt;
                &lt;option value="绿化"&gt;绿化&lt;/option&gt;
                &lt;option value="照明"&gt;照明&lt;/option&gt;
                &lt;option value="公共设施"&gt;公共设施&lt;/option&gt;
            &lt;/select&gt;
            &lt;select id="filterStatus" onchange="loadProposals()"&gt;
                &lt;option value=""&gt;全部状态&lt;/option&gt;
                &lt;option value="0"&gt;待处理&lt;/option&gt;
                &lt;option value="1"&gt;已解决&lt;/option&gt;
            &lt;/select&gt;
        &lt;/div&gt;
        &lt;div id="proposalList"&gt;&lt;/div&gt;
    `;
    
    loadProposals();
}

async function fetchProposals() {
    const category = document.getElementById('filterCategory')?.value || '';
    const status = document.getElementById('filterStatus')?.value;
    
    let url = '/api/proposals?';
    if (category) url += `category=${category}&amp;`;
    if (status !== undefined &amp;&amp; status !== '') url += `status=${status}&amp;`;
    
    const res = await fetch(url);
    const data = await res.json();
    return data.proposals || [];
}

async function loadProposals() {
    const list = document.getElementById('proposalList');
    if (!list) return;
    
    const proposals = await fetchProposals();
    
    list.innerHTML = proposals.map(p =&gt; `
        &lt;div class="card" style="cursor:pointer;" onclick="showDetail(${p.id})"&gt;
            &lt;h3&gt;${p.title}&lt;/h3&gt;
            &lt;div class="meta"&gt;
                &lt;span class="status ${p.status === 1 ? 'status-resolved' : 'status-pending'}"&gt;
                    ${p.status === 1 ? '已解决' : '待处理'}
                &lt;/span&gt;
                &lt;span style="margin-left:10px;"&gt;${p.category || '未分类'}&lt;/span&gt;
                &lt;span style="margin-left:10px;"&gt;📍 ${p.locationName || '未知地点'}&lt;/span&gt;
            &lt;/div&gt;
            &lt;p style="color:#666; margin:10px 0;"&gt;${p.description || ''}&lt;/p&gt;
            &lt;div style="display:flex; justify-content:space-between; align-items:center;"&gt;
                &lt;span class="vote-count"&gt;👍 ${p.voteCount} 附议&lt;/span&gt;
                &lt;button class="btn" onclick="event.stopPropagation(); vote(${p.id})"&gt;附议&lt;/button&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    `).join('');
}

async function showDetail(id) {
    window.currentProposalId = id;
    navigate('detail');
}

async function renderDetail() {
    const main = document.getElementById('main');
    main.innerHTML = '&lt;p&gt;加载中...&lt;/p&gt;';
    
    const res = await fetch(`/api/proposals/${window.currentProposalId}`);
    const data = await res.json();
    
    if (!data.success) {
        main.innerHTML = '&lt;p&gt;加载失败&lt;/p&gt;';
        return;
    }
    
    const p = data.proposal;
    
    main.innerHTML = `
        &lt;button class="btn btn-secondary" onclick="navigate('home')"&gt;← 返回&lt;/button&gt;
        &lt;h2 style="margin:20px 0;"&gt;${p.title}&lt;/h2&gt;
        &lt;div class="meta"&gt;
            &lt;span class="status ${p.status === 1 ? 'status-resolved' : 'status-pending'}"&gt;
                ${p.status === 1 ? '已解决' : '待处理'}
            &lt;/span&gt;
            &lt;span style="margin-left:10px;"&gt;${p.category || '未分类'}&lt;/span&gt;
            &lt;span style="margin-left:10px;"&gt;📍 ${p.locationName || '未知地点'}&lt;/span&gt;
        &lt;/div&gt;
        ${p.photoUrl ? `&lt;img src="${p.photoUrl}" class="proposal-image" style="margin-top:20px;"&gt;` : ''}
        &lt;p style="margin:20px 0; font-size:1.1rem;"&gt;${p.description || ''}&lt;/p&gt;
        &lt;div style="display:flex; gap:10px; align-items:center; margin-bottom:30px;"&gt;
            &lt;span class="vote-count"&gt;👍 ${p.voteCount} 附议&lt;/span&gt;
            ${!p.hasVoted ? `&lt;button class="btn" onclick="vote(${p.id})"&gt;附议&lt;/button&gt;` : '&lt;span style="color:#28a745;"&gt;已附议&lt;/span&gt;'}
        &lt;/div&gt;
        ${p.status === 1 ? `
            &lt;div style="background:#d4edda; padding:20px; border-radius:12px; margin-top:20px;"&gt;
                &lt;h3 style="color:#155724; margin-bottom:15px;"&gt;处理结果&lt;/h3&gt;
                &lt;p&gt;${p.resultDesc || ''}&lt;/p&gt;
                ${p.resultPhotoUrl ? `
                    &lt;div class="image-comparison"&gt;
                        ${p.photoUrl ? `
                            `&lt;div&gt;&lt;img src="${p.photoUrl}"&gt;&lt;div class="label"&gt;整改前&lt;/div&gt;&lt;/div&gt;` : ''}
                        &lt;div&gt;&lt;img src="${p.resultPhotoUrl}"&gt;&lt;div class="label"&gt;整改后&lt;/div&gt;&lt;/div&gt;
                    &lt;/div&gt;
                ` : ''}
            &lt;/div&gt;
        ` : ''}
    `;
}

async function vote(id) {
    const res = await fetch(`/api/proposals/${id}/vote`, { method: 'POST' });
    const data = await res.json();
    
    if (data.success) {
        if (currentPage === 'home') {
            loadProposals();
        } else {
            renderDetail();
        }
    } else {
        alert(data.message);
    }
}

function showCreateModal() {
    const modal = document.createElement('div');
    modal.id = 'createModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        &lt;div class="modal-content" onclick="event.stopPropagation()"&gt;
            &lt;h2&gt;发布提案&lt;/h2&gt;
            &lt;form onsubmit="handleCreate(event)"&gt;
                &lt;div class="form-group"&gt;
                    &lt;label&gt;标题&lt;/label&gt;
                    &lt;input type="text" id="createTitle" required&gt;
                &lt;/div&gt;
                &lt;div class="form-group"&gt;
                    &lt;label&gt;描述&lt;/label&gt;
                    &lt;textarea id="createDescription" required&gt;&lt;/textarea&gt;
                &lt;/div&gt;
                &lt;div class="form-group"&gt;
                    &lt;label&gt;分类&lt;/label&gt;
                    &lt;select id="createCategory"&gt;
                        &lt;option value="道路"&gt;道路&lt;/option&gt;
                        &lt;option value="绿化"&gt;绿化&lt;/option&gt;
                        &lt;option value="照明"&gt;照明&lt;/option&gt;
                        &lt;option value="公共设施"&gt;公共设施&lt;/option&gt;
                    &lt;/select&gt;
                &lt;/div&gt;
                &lt;div class="form-group"&gt;
                    &lt;label&gt;地点名称&lt;/label&gt;
                    &lt;input type="text" id="createLocationName" required&gt;
                &lt;/div&gt;
                &lt;div class="form-group"&gt;
                    &lt;label&gt;图片路径 (如: img/pothole.jpg)&lt;/label&gt;
                    &lt;input type="text" id="createPhotoUrl"&gt;
                &lt;/div&gt;
                &lt;div style="display:flex; gap:10px;"&gt;
                    &lt;button type="submit" class="btn"&gt;发布&lt;/button&gt;
                    &lt;button type="button" class="btn btn-secondary" onclick="closeCreateModal()"&gt;取消&lt;/button&gt;
                &lt;/div&gt;
            &lt;/form&gt;
        &lt;/div&gt;
    `;
    modal.onclick = closeCreateModal;
    document.body.appendChild(modal);
}

function closeCreateModal() {
    const modal = document.getElementById('createModal');
    if (modal) modal.remove();
}

async function handleCreate(e) {
    e.preventDefault();
    
    const proposal = {
        title: document.getElementById('createTitle').value,
        description: document.getElementById('createDescription').value,
        category: document.getElementById('createCategory').value,
        locationName: document.getElementById('createLocationName').value,
        photoUrl: document.getElementById('createPhotoUrl').value
    };
    
    const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposal)
    });
    
    const data = await res.json();
    if (data.success) {
        closeCreateModal();
        loadProposals();
    } else {
        alert(data.message);
    }
}

async function renderAdmin() {
    const main = document.getElementById('main');
    main.innerHTML = '&lt;p&gt;加载中...&lt;/p&gt;';
    
    const res = await fetch('/api/proposals');
    const data = await res.json();
    const proposals = data.proposals || [];
    
    main.innerHTML = `
        &lt;h2&gt;管理面板&lt;/h2&gt;
        &lt;table&gt;
            &lt;thead&gt;
                &lt;tr&gt;
                    &lt;th&gt;ID&lt;/th&gt;
                    &lt;th&gt;标题&lt;/th&gt;
                    &lt;th&gt;分类&lt;/th&gt;
                    &lt;th&gt;地点&lt;/th&gt;
                    &lt;th&gt;状态&lt;/th&gt;
                    &lt;th&gt;附议数&lt;/th&gt;
                    &lt;th&gt;操作&lt;/th&gt;
                &lt;/tr&gt;
            &lt;/thead&gt;
            &lt;tbody&gt;
                ${proposals.map(p =&gt; `
                    &lt;tr&gt;
                        &lt;td&gt;${p.id}&lt;/td&gt;
                        &lt;td&gt;${p.title}&lt;/td&gt;
                        &lt;td&gt;${p.category || '-'}&lt;/td&gt;
                        &lt;td&gt;${p.locationName || '-'}&lt;/td&gt;
                        &lt;td&gt;&lt;span class="status ${p.status === 1 ? 'status-resolved' : 'status-pending'}"&gt;${p.status === 1 ? '已解决' : '待处理'}&lt;/span&gt;&lt;/td&gt;
                        &lt;td&gt;${p.voteCount}&lt;/td&gt;
                        &lt;td&gt;
                            &lt;button class="btn btn-success" onclick="showResolveModal(${p.id})"&gt;处理&lt;/button&gt;
                        &lt;/td&gt;
                    &lt;/tr&gt;
                `).join('')}
            &lt;/tbody&gt;
        &lt;/table&gt;
    `;
}

function showResolveModal(id) {
    const modal = document.createElement('div');
    modal.id = 'resolveModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        &lt;div class="modal-content" onclick="event.stopPropagation()"&gt;
            &lt;h2&gt;处理提案&lt;/h2&gt;
            &lt;form onsubmit="handleResolve(event, ${id})"&gt;
                &lt;div class="form-group"&gt;
                    &lt;label&gt;处理结果描述&lt;/label&gt;
                    &lt;textarea id="resolveResultDesc" required&gt;&lt;/textarea&gt;
                &lt;/div&gt;
                &lt;div class="form-group"&gt;
                    &lt;label&gt;处理后图片路径&lt;/label&gt;
                    &lt;input type="text" id="resolveResultPhotoUrl"&gt;
                &lt;/div&gt;
                &lt;div style="display:flex; gap:10px;"&gt;
                    &lt;button type="submit" class="btn btn-success"&gt;标记为已解决&lt;/button&gt;
                    &lt;button type="button" class="btn btn-secondary" onclick="closeResolveModal()"&gt;取消&lt;/button&gt;
                &lt;/div&gt;
            &lt;/form&gt;
        &lt;/div&gt;
    `;
    modal.onclick = closeResolveModal;
    document.body.appendChild(modal);
}

function closeResolveModal() {
    const modal = document.getElementById('resolveModal');
    if (modal) modal.remove();
}

async function handleResolve(e, id) {
    e.preventDefault();
    
    const resultDesc = document.getElementById('resolveResultDesc').value;
    const resultPhotoUrl = document.getElementById('resolveResultPhotoUrl').value;
    
    const res = await fetch(`/api/proposals/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 1, resultDesc, resultPhotoUrl })
    });
    
    const data = await res.json();
    if (data.success) {
        closeResolveModal();
        renderAdmin();
    } else {
        alert(data.message);
    }
}

init();
