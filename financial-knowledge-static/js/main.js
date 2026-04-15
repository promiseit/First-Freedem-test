// 金融知识平台静态网站交互脚本

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化分类列表
    initCategories();
    
    // 初始化知识展示（默认显示热门知识）
    showPopularKnowledge();
    
    // 初始化搜索功能
    initSearch();
    
    // 初始化分类筛选
    initCategoryFilter();
});

// 初始化分类列表
function initCategories() {
    const categoryList = document.getElementById('category-list');
    if (!categoryList) return;
    
    // 清空现有分类（保留首页）
    const homeItem = categoryList.firstElementChild;
    categoryList.innerHTML = '';
    categoryList.appendChild(homeItem);
    
    // 添加分类
    categories.forEach(category => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = category.name;
        a.setAttribute('data-category', category.id);
        li.appendChild(a);
        categoryList.appendChild(li);
    });
}

// 显示热门知识
function showPopularKnowledge() {
    const sortedKnowledge = [...knowledgeBase].sort((a, b) => b.read_count - a.read_count);
    displayKnowledge(sortedKnowledge);
    document.getElementById('section-title').textContent = '热门知识';
}

// 显示最新知识
function showLatestKnowledge() {
    // 假设按照ID排序（实际项目中应该有created_at字段）
    const sortedKnowledge = [...knowledgeBase].sort((a, b) => b.id - a.id);
    displayKnowledge(sortedKnowledge);
    document.getElementById('section-title').textContent = '最新知识';
}

// 按分类显示知识
function showKnowledgeByCategory(categoryId) {
    const filteredKnowledge = knowledgeBase.filter(item => item.category_id == categoryId);
    displayKnowledge(filteredKnowledge);
    
    const category = categories.find(cat => cat.id == categoryId);
    document.getElementById('section-title').textContent = category ? category.name : '知识列表';
}

// 显示搜索结果
function showSearchResults(query) {
    const lowercaseQuery = query.toLowerCase();
    const filteredKnowledge = knowledgeBase.filter(item => 
        item.title.toLowerCase().includes(lowercaseQuery) ||
        item.content.toLowerCase().includes(lowercaseQuery) ||
        item.summary.toLowerCase().includes(lowercaseQuery)
    );
    displayKnowledge(filteredKnowledge);
    document.getElementById('section-title').textContent = `搜索结果: ${query}`;
}

// 显示知识卡片
function displayKnowledge(knowledgeList) {
    const grid = document.getElementById('knowledge-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (knowledgeList.length === 0) {
        grid.innerHTML = '<p class="no-results">未找到相关知识</p>';
        return;
    }
    
    knowledgeList.forEach(item => {
        const card = createKnowledgeCard(item);
        grid.appendChild(card);
    });
}

// 创建知识卡片
function createKnowledgeCard(knowledge) {
    const card = document.createElement('div');
    card.className = 'knowledge-card';
    
    // 获取标签名称
    const tagNames = knowledge.tags.map(tagId => {
        const tag = tags.find(t => t.id == tagId);
        return tag ? tag.name : '';
    }).filter(Boolean);
    
    card.innerHTML = `
        <div class="difficulty ${knowledge.difficulty_level}">${knowledge.difficulty_level.charAt(0).toUpperCase() + knowledge.difficulty_level.slice(1)}</div>
        <h4><a href="#" data-id="${knowledge.id}">${knowledge.title}</a></h4>
        <p class="summary">${knowledge.summary}</p>
        <div class="meta">
            <span class="category">${knowledge.category_name}</span>
            <span class="read-count">阅读 ${knowledge.read_count}</span>
        </div>
        ${tagNames.length > 0 ? `<div class="tags">${tagNames.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
    `;
    
    // 添加点击事件
    const link = card.querySelector('a');
    link.addEventListener('click', function(e) {
        e.preventDefault();
        showKnowledgeDetail(knowledge.id);
    });
    
    return card;
}

// 显示知识详情
function showKnowledgeDetail(knowledgeId) {
    const knowledge = knowledgeBase.find(item => item.id == knowledgeId);
    if (!knowledge) return;
    
    const detailSection = document.getElementById('knowledge-detail');
    if (!detailSection) return;
    
    // 显示详情区域
    detailSection.style.display = 'block';
    
    // 获取标签名称
    const tagNames = knowledge.tags.map(tagId => {
        const tag = tags.find(t => t.id == tagId);
        return tag ? tag.name : '';
    }).filter(Boolean);
    
    // 生成相关知识
    const relatedKnowledge = knowledgeBase
        .filter(item => item.category_id == knowledge.category_id && item.id != knowledgeId)
        .sort((a, b) => b.read_count - a.read_count)
        .slice(0, 3);
    
    detailSection.innerHTML = `
        <div class="detail-header">
            <button id="back-button" class="btn">返回列表</button>
            <h2>${knowledge.title}</h2>
        </div>
        <div class="difficulty ${knowledge.difficulty_level}">${knowledge.difficulty_level.charAt(0).toUpperCase() + knowledge.difficulty_level.slice(1)}</div>
        <div class="meta">
            <span class="category">${knowledge.category_name}</span>
            <span class="read-count">阅读 ${knowledge.read_count}</span>
            <span class="like-count">点赞 ${knowledge.like_count}</span>
        </div>
        ${tagNames.length > 0 ? `<div class="tags">${tagNames.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
        <div class="content">
            <p>${knowledge.content}</p>
        </div>
        ${relatedKnowledge.length > 0 ? `
        <div class="related-knowledge">
            <h3>相关知识</h3>
            <div class="knowledge-grid">
                ${relatedKnowledge.map(item => `
                <div class="knowledge-card">
                    <h4><a href="#" data-id="${item.id}">${item.title}</a></h4>
                    <p class="summary">${item.summary}</p>
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    `;
    
    // 添加返回按钮事件
    const backButton = detailSection.querySelector('#back-button');
    backButton.addEventListener('click', function() {
        detailSection.style.display = 'none';
    });
    
    // 添加相关知识点击事件
    const relatedLinks = detailSection.querySelectorAll('.related-knowledge a');
    relatedLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-id');
            showKnowledgeDetail(id);
        });
    });
    
    // 滚动到详情区域
    detailSection.scrollIntoView({ behavior: 'smooth' });
}

// 初始化搜索功能
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    if (!searchInput || !searchButton) return;
    
    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            showSearchResults(query);
            // 隐藏详情区域
            document.getElementById('knowledge-detail').style.display = 'none';
        }
    }
    
    searchButton.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// 初始化分类筛选
function initCategoryFilter() {
    const categoryLinks = document.querySelectorAll('#category-list a');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            
            // 隐藏详情区域
            document.getElementById('knowledge-detail').style.display = 'none';
            
            if (category === 'all') {
                showPopularKnowledge();
            } else {
                showKnowledgeByCategory(category);
            }
        });
    });
}

// 平滑滚动效果
function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 初始化所有功能
function initAll() {
    initCategories();
    showPopularKnowledge();
    initSearch();
    initCategoryFilter();
    smoothScroll();
}

// 如果需要在其他地方调用
if (typeof window !== 'undefined') {
    window.initAll = initAll;
}