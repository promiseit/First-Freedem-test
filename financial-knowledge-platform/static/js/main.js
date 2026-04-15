// 金融知识平台前端交互脚本

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化推荐系统
    initRecommendations();
    
    // 平滑滚动效果
    smoothScroll();
    
    // 搜索框自动完成（可选功能）
    initSearchAutocomplete();
});

// 初始化推荐系统
function initRecommendations() {
    // 检查是否需要加载推荐内容
    const recommendationContainer = document.querySelector('.recommendations');
    if (recommendationContainer) {
        fetchRecommendations();
    }
}

// 获取推荐内容
function fetchRecommendations() {
    // 这里可以添加用户ID，实际应用中需要从登录状态获取
    const userId = null; // 暂时为null，使用默认推荐
    
    fetch(`/api/recommendations?user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                displayRecommendations(data);
            }
        })
        .catch(error => {
            console.error('获取推荐失败:', error);
        });
}

// 显示推荐内容
function displayRecommendations(recommendations) {
    const container = document.querySelector('.recommendations');
    if (!container) return;
    
    container.innerHTML = '';
    
    recommendations.forEach(item => {
        const card = document.createElement('div');
        card.className = 'knowledge-card';
        card.innerHTML = `
            <h4><a href="/knowledge/${item.id}">${item.title}</a></h4>
            <p class="summary">${item.summary}</p>
        `;
        container.appendChild(card);
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

// 搜索框自动完成（可选功能）
function initSearchAutocomplete() {
    const searchInput = document.querySelector('input[name="q"]');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length > 2) {
            // 这里可以添加搜索建议功能
            // 例如调用API获取搜索建议
        }
    });
}

// 知识详情页面的交互
function initKnowledgeDetail() {
    // 点赞功能
    const likeButton = document.querySelector('.like-button');
    if (likeButton) {
        likeButton.addEventListener('click', function() {
            // 这里可以添加点赞逻辑
            alert('点赞功能开发中');
        });
    }
    
    // 分享功能
    const shareButton = document.querySelector('.share-button');
    if (shareButton) {
        shareButton.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    url: window.location.href
                });
            } else {
                //  fallback for browsers that don't support Web Share API
                prompt('复制链接:', window.location.href);
            }
        });
    }
}

// 分类页面的筛选功能
function initCategoryFilters() {
    const difficultyFilters = document.querySelectorAll('.difficulty-filter');
    difficultyFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            const difficulty = this.getAttribute('data-difficulty');
            // 这里可以添加筛选逻辑
            alert(`筛选${difficulty}难度的内容`);
        });
    });
}

// 响应式导航菜单
function initResponsiveNav() {
    const menuButton = document.querySelector('.menu-button');
    const navMenu = document.querySelector('nav ul');
    
    if (menuButton && navMenu) {
        menuButton.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

// 页面访问统计
function trackPageView() {
    // 这里可以添加页面访问统计逻辑
    // 例如发送请求到后端记录访问
    console.log('Page viewed:', window.location.pathname);
}

// 初始化所有功能
function initAll() {
    initRecommendations();
    smoothScroll();
    initSearchAutocomplete();
    initKnowledgeDetail();
    initCategoryFilters();
    initResponsiveNav();
    trackPageView();
}

// 如果需要在其他页面使用
if (typeof window !== 'undefined') {
    window.initAll = initAll;
}