from flask import Flask, render_template, request, jsonify, redirect, url_for
import mysql.connector
from mysql.connector import pooling
import json
from datetime import datetime
from flask_caching import Cache
from flask_bcrypt import Bcrypt
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)

# 设置secret key
app.config['SECRET_KEY'] = 'your-secret-key-here'

# 初始化bcrypt
bcrypt = Bcrypt(app)

# 初始化CSRF保护
csrf = CSRFProtect(app)

# 缓存配置
cache = Cache(app, config={
    'CACHE_TYPE': 'simple',  # 使用简单内存缓存
    'CACHE_DEFAULT_TIMEOUT': 300  # 缓存默认过期时间5分钟
})

# 数据库连接配置
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'financial_knowledge'
}

# 创建数据库连接池
connection_pool = pooling.MySQLConnectionPool(
    pool_name="financial_pool",
    pool_size=10,  # 连接池大小
    pool_reset_session=True,
    **db_config
)

# 初始化数据库
def init_database():
    try:
        # 先连接到MySQL服务器
        conn = mysql.connector.connect(
            host=db_config['host'],
            user=db_config['user'],
            password=db_config['password']
        )
        cursor = conn.cursor()
        
        # 创建数据库
        cursor.execute("CREATE DATABASE IF NOT EXISTS financial_knowledge")
        cursor.execute("USE financial_knowledge")
        
        # 创建分类表
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            parent_id INT,
            level INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES categories(id)
        )
        """)
        
        # 创建知识库表
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS knowledge_base (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            summary VARCHAR(500),
            category_id INT,
            difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
            read_count INT DEFAULT 0,
            like_count INT DEFAULT 0,
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )
        """)
        
        # 创建标签表
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS tags (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # 创建知识-标签关联表
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS knowledge_tags (
            knowledge_id INT,
            tag_id INT,
            PRIMARY KEY (knowledge_id, tag_id),
            FOREIGN KEY (knowledge_id) REFERENCES knowledge_base(id),
            FOREIGN KEY (tag_id) REFERENCES tags(id)
        )
        """)
        
        # 创建用户表
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
        """)
        
        # 创建用户行为表
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_behavior (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            knowledge_id INT,
            behavior_type ENUM('view', 'like', 'search', 'share') NOT NULL,
            behavior_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (knowledge_id) REFERENCES knowledge_base(id)
        )
        """)
        
        # 创建用户搜索历史表
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS search_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            search_query VARCHAR(255) NOT NULL,
            search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)
        
        # 创建推荐表
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS recommendations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            knowledge_id INT,
            score FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (knowledge_id) REFERENCES knowledge_base(id)
        )
        """)
        
        # 添加索引
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_knowledge_category_id ON knowledge_base(category_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_knowledge_read_count ON knowledge_base(read_count)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_knowledge_created_at ON knowledge_base(created_at)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_knowledge_tags_knowledge_id ON knowledge_tags(knowledge_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_knowledge_tags_tag_id ON knowledge_tags(tag_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_behavior_user_id ON user_behavior(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_behavior_knowledge_id ON user_behavior(knowledge_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_recommendations_knowledge_id ON recommendations(knowledge_id)")
        
        # 初始化分类数据
        cursor.execute("SELECT COUNT(*) FROM categories")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
            INSERT INTO categories (name, description, level) VALUES
            ('个人理财', '个人财务管理相关知识', 1),
            ('投资', '各类投资产品和策略', 1),
            ('银行业务', '银行相关产品和服务', 1),
            ('保险', '保险产品和保障规划', 1),
            ('税收', '税务知识和规划', 1),
            ('金融市场', '金融市场运行机制', 1),
            ('金融工具', '各类金融工具介绍', 1),
            ('经济政策', '宏观经济政策解读', 1)
            """)
        
        # 初始化标签数据
        cursor.execute("SELECT COUNT(*) FROM tags")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
            INSERT INTO tags (name) VALUES
            ('储蓄'),
            ('基金'),
            ('股票'),
            ('债券'),
            ('保险'),
            ('信用卡'),
            ('房贷'),
            ('理财规划'),
            ('退休规划'),
            ('税务筹划'),
            ('风险控制'),
            ('通货膨胀'),
            ('利率'),
            ('汇率'),
            ('经济指标')
            """)
        
        # 初始化知识库示例数据
        cursor.execute("SELECT COUNT(*) FROM knowledge_base")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
            INSERT INTO knowledge_base (title, content, summary, category_id, difficulty_level) VALUES
            ('什么是复利？', '复利是指在计算利息时，将本金和之前累积的利息一起计算新的利息。简单来说，就是利滚利。复利的计算公式是：A = P(1 + r/n)^(nt)，其中A是最终金额，P是本金，r是年利率，n是每年计息次数，t是年数。复利的魔力在于时间，长期投资可以获得惊人的回报。', '复利是利滚利的计算方式，长期投资可以获得惊人回报。', 2, 'beginner'),
            ('如何制定个人预算？', '制定个人预算的步骤：1. 记录所有收入来源；2. 列出所有支出，包括固定支出和可变支出；3. 计算收支差额；4. 设定储蓄目标；5. 定期检查和调整预算。预算可以帮助你控制支出，避免不必要的消费，为未来的财务目标做准备。', '个人预算制定的五个步骤，帮助控制支出实现财务目标。', 1, 'beginner'),
            ('基金投资入门', '基金是一种集合投资工具，由专业基金经理管理。投资者购买基金份额，基金经理将资金投资于股票、债券等资产。基金的优势包括分散风险、专业管理、门槛低等。常见的基金类型有股票基金、债券基金、混合型基金、货币市场基金等。', '基金是集合投资工具，由专业经理管理，分散风险，门槛低。', 2, 'intermediate'),
            ('保险的重要性', '保险是一种风险管理工具，可以在意外发生时提供经济保障。常见的保险类型包括人寿保险、健康保险、财产保险等。购买保险时需要考虑自己的需求和预算，选择合适的保险产品。保险可以帮助你应对疾病、意外、财产损失等风险，为家庭提供财务保障。', '保险是风险管理工具，为意外情况提供经济保障。', 4, 'beginner'),
            ('如何提高信用评分？', '信用评分是衡量个人信用状况的指标，影响贷款、信用卡申请等。提高信用评分的方法包括：按时还款、保持低信用 utilization、建立长期信用历史、避免频繁申请新信用、定期检查信用报告等。良好的信用评分可以帮助你获得更低的贷款利率和更好的金融服务。', '信用评分影响金融服务获取，按时还款和低 utilization 是关键。', 3, 'intermediate'),
            ('退休规划的重要性', '退休规划是为了确保退休后有足够的收入维持生活水平。建议尽早开始规划，通过储蓄、投资等方式积累退休资金。常见的退休规划工具包括养老金、个人退休账户、投资组合等。合理的退休规划可以帮助你在退休后享受财务自由的生活。', '退休规划确保晚年生活质量，应尽早开始并多样化投资。', 1, 'intermediate'),
            ('股票投资基础知识', '股票是公司的所有权凭证，购买股票意味着成为公司的股东。股票投资的收益来自股息和资本增值。投资股票需要了解公司基本面、行业趋势、市场环境等因素。股票投资具有较高的风险，但也可能带来较高的回报。', '股票是公司所有权凭证，投资需了解基本面和市场环境。', 2, 'intermediate'),
            ('税务筹划的基本方法', '税务筹划是合法降低税负的方法，包括利用税收优惠政策、合理安排收入和支出、选择合适的投资工具等。常见的税务筹划方法包括：利用个人所得税专项扣除、投资税收优惠产品、合理规划资产配置等。税务筹划可以帮助你合法减少税务支出，提高税后收入。', '税务筹划合法降低税负，包括利用优惠政策和合理安排收支。', 5, 'advanced'),
            ('如何应对通货膨胀？', '通货膨胀是指货币购买力下降，物价普遍上涨的现象。应对通货膨胀的方法包括：投资实物资产（如房地产、黄金）、投资股票、购买通胀保值债券、提高收入水平等。长期来看，股票投资是对抗通货膨胀的有效手段之一。', '通货膨胀降低购买力，可通过投资实物资产和股票应对。', 6, 'intermediate'),
            ('银行业务类型及选择', '银行提供多种业务，包括储蓄账户、支票账户、贷款、信用卡等。选择银行服务时需要考虑利率、 fees、服务质量等因素。不同银行的产品和服务各有优势，建议根据自己的需求选择合适的银行和产品。', '银行提供多种服务，选择时需考虑利率、费用和服务质量。', 3, 'beginner')
            """)
        
        # 关联知识和标签
        cursor.execute("SELECT COUNT(*) FROM knowledge_tags")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
            INSERT INTO knowledge_tags (knowledge_id, tag_id) VALUES
            (1, 1), (1, 8),
            (2, 1), (2, 8),
            (3, 2), (3, 8),
            (4, 5), (4, 11),
            (5, 6), (5, 8),
            (6, 9), (6, 8),
            (7, 3), (7, 11),
            (8, 10), (8, 8),
            (9, 12), (9, 8),
            (10, 6), (10, 7)
            """)
        
        conn.commit()
        cursor.close()
        conn.close()
        print("数据库初始化成功")
    except Exception as e:
        print(f"数据库初始化失败: {e}")

# 数据库连接函数
def get_db_connection():
    try:
        conn = connection_pool.get_connection()
        return conn
    except Exception as e:
        print(f"数据库连接失败: {e}")
        return None

# 主页
@app.route('/')
@cache.cached(timeout=300, key_prefix='index')
def index():
    conn = get_db_connection()
    if not conn:
        return render_template('error.html', message='数据库连接失败')
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # 获取分类列表
        cursor.execute("SELECT * FROM categories ORDER BY name")
        categories = cursor.fetchall()
        
        # 获取热门知识
        cursor.execute("SELECT k.*, c.name as category_name FROM knowledge_base k JOIN categories c ON k.category_id = c.id ORDER BY k.read_count DESC LIMIT 10")
        popular_knowledge = cursor.fetchall()
        
        # 获取最新知识
        cursor.execute("SELECT k.*, c.name as category_name FROM knowledge_base k JOIN categories c ON k.category_id = c.id ORDER BY k.created_at DESC LIMIT 10")
        latest_knowledge = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return render_template('index.html', categories=categories, popular_knowledge=popular_knowledge, latest_knowledge=latest_knowledge)
    except Exception as e:
        print(f"查询失败: {e}")
        return render_template('error.html', message='查询失败')

# 搜索功能
@app.route('/search', methods=['GET'])
@cache.cached(timeout=300, key_prefix=lambda: f"search_{request.args.get('q', '').strip()}")
def search():
    query = request.args.get('q', '').strip()
    if not query:
        return redirect(url_for('index'))
    
    conn = get_db_connection()
    if not conn:
        return render_template('error.html', message='数据库连接失败')
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # 搜索知识库
        search_query = f"%{query}%"
        cursor.execute("SELECT k.*, c.name as category_name FROM knowledge_base k JOIN categories c ON k.category_id = c.id WHERE k.title LIKE %s OR k.content LIKE %s OR k.summary LIKE %s ORDER BY k.read_count DESC", (search_query, search_query, search_query))
        results = cursor.fetchall()
        
        # 记录搜索历史（如果有用户登录）
        # 这里简化处理，实际应用中需要用户登录状态
        
        cursor.close()
        conn.close()
        
        return render_template('search.html', query=query, results=results)
    except Exception as e:
        print(f"搜索失败: {e}")
        return render_template('error.html', message='搜索失败')

# 分类浏览
@app.route('/category/<int:category_id>')
@cache.cached(timeout=300, key_prefix=lambda: f"category_{request.view_args.get('category_id')}")
def category(category_id):
    conn = get_db_connection()
    if not conn:
        return render_template('error.html', message='数据库连接失败')
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # 获取分类信息
        cursor.execute("SELECT * FROM categories WHERE id = %s", (category_id,))
        category = cursor.fetchone()
        if not category:
            return render_template('error.html', message='分类不存在')
        
        # 获取该分类下的知识
        cursor.execute("SELECT k.*, c.name as category_name FROM knowledge_base k JOIN categories c ON k.category_id = c.id WHERE k.category_id = %s ORDER BY k.created_at DESC", (category_id,))
        knowledge_list = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return render_template('category.html', category=category, knowledge_list=knowledge_list)
    except Exception as e:
        print(f"查询失败: {e}")
        return render_template('error.html', message='查询失败')

# 知识详情
@app.route('/knowledge/<int:knowledge_id>')
def knowledge_detail(knowledge_id):
    conn = get_db_connection()
    if not conn:
        return render_template('error.html', message='数据库连接失败')
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # 更新阅读次数
        cursor.execute("UPDATE knowledge_base SET read_count = read_count + 1 WHERE id = %s", (knowledge_id,))
        conn.commit()
        
        # 清除缓存，因为阅读次数已更新
        cache.delete(f"knowledge_{knowledge_id}")
        
        # 获取知识详情
        cursor.execute("SELECT k.*, c.name as category_name FROM knowledge_base k JOIN categories c ON k.category_id = c.id WHERE k.id = %s", (knowledge_id,))
        knowledge = cursor.fetchone()
        if not knowledge:
            return render_template('error.html', message='知识不存在')
        
        # 获取相关标签
        cursor.execute("SELECT t.name FROM tags t JOIN knowledge_tags kt ON t.id = kt.tag_id WHERE kt.knowledge_id = %s", (knowledge_id,))
        tags = [tag['name'] for tag in cursor.fetchall()]
        
        # 获取相关知识推荐
        cursor.execute("SELECT k.*, c.name as category_name FROM knowledge_base k JOIN categories c ON k.category_id = c.id WHERE k.category_id = %s AND k.id != %s ORDER BY k.read_count DESC LIMIT 5", (knowledge['category_id'], knowledge_id))
        related_knowledge = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return render_template('knowledge_detail.html', knowledge=knowledge, tags=tags, related_knowledge=related_knowledge)
    except Exception as e:
        print(f"查询失败: {e}")
        return render_template('error.html', message='查询失败')

# 推荐API
@app.route('/api/recommendations', methods=['GET'])
@cache.cached(timeout=300, key_prefix=lambda: f"recommendations_{request.args.get('user_id', 'anonymous')}")
def get_recommendations():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        # 如果没有用户ID，返回热门知识
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': '数据库连接失败'}), 500
        
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, title, summary, category_id FROM knowledge_base ORDER BY read_count DESC LIMIT 10")
            recommendations = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify(recommendations)
        except Exception as e:
            print(f"推荐失败: {e}")
            return jsonify({'error': '推荐失败'}), 500
    
    # 有用户ID，根据用户行为推荐
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': '数据库连接失败'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # 这里简化处理，实际应用中需要更复杂的推荐算法
        # 基于用户浏览历史和分类偏好
        cursor.execute("""
            SELECT k.id, k.title, k.summary, k.category_id
            FROM knowledge_base k
            WHERE k.id NOT IN (
                SELECT knowledge_id FROM user_behavior WHERE user_id = %s AND behavior_type = 'view'
            )
            ORDER BY k.read_count DESC
            LIMIT 10
        """, (user_id,))
        
        recommendations = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify(recommendations)
    except Exception as e:
        print(f"推荐失败: {e}")
        return jsonify({'error': '推荐失败'}), 500

# 健康检查
@app.route('/health')
def health_check():
    return jsonify({'status': 'ok'})

# 用户注册
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not username or not email or not password:
            return render_template('error.html', message='请填写所有必填字段')
        
        conn = get_db_connection()
        if not conn:
            return render_template('error.html', message='数据库连接失败')
        
        try:
            cursor = conn.cursor()
            
            # 检查邮箱是否已存在
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return render_template('error.html', message='邮箱已被注册')
            
            # 加密密码
            password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
            
            # 插入新用户
            cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)", 
                          (username, email, password_hash))
            conn.commit()
            
            cursor.close()
            conn.close()
            
            return redirect(url_for('login'))
        except Exception as e:
            print(f"注册失败: {e}")
            return render_template('error.html', message='注册失败')
    
    return render_template('register.html')

# 用户登录
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not email or not password:
            return render_template('error.html', message='请填写所有必填字段')
        
        conn = get_db_connection()
        if not conn:
            return render_template('error.html', message='数据库连接失败')
        
        try:
            cursor = conn.cursor(dictionary=True)
            
            # 查找用户
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            
            if not user or not bcrypt.check_password_hash(user['password_hash'], password):
                return render_template('error.html', message='邮箱或密码错误')
            
            # 这里简化处理，实际应用中需要使用session或JWT来管理用户状态
            
            cursor.close()
            conn.close()
            
            return redirect(url_for('index'))
        except Exception as e:
            print(f"登录失败: {e}")
            return render_template('error.html', message='登录失败')
    
    return render_template('login.html')

# 初始化数据库
init_database()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)