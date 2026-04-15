-- 金融知识数据库结构

-- 创建数据库
CREATE DATABASE IF NOT EXISTS financial_knowledge;

USE financial_knowledge;

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INT,
    level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- 知识库表
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
);

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 知识-标签关联表
CREATE TABLE IF NOT EXISTS knowledge_tags (
    knowledge_id INT,
    tag_id INT,
    PRIMARY KEY (knowledge_id, tag_id),
    FOREIGN KEY (knowledge_id) REFERENCES knowledge_base(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 用户行为表
CREATE TABLE IF NOT EXISTS user_behavior (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    knowledge_id INT,
    behavior_type ENUM('view', 'like', 'search', 'share') NOT NULL,
    behavior_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (knowledge_id) REFERENCES knowledge_base(id)
);

-- 用户搜索历史表
CREATE TABLE IF NOT EXISTS search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    search_query VARCHAR(255) NOT NULL,
    search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 推荐表
CREATE TABLE IF NOT EXISTS recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    knowledge_id INT,
    score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (knowledge_id) REFERENCES knowledge_base(id)
);

-- 初始化分类数据
INSERT INTO categories (name, description, level) VALUES
('个人理财', '个人财务管理相关知识', 1),
('投资', '各类投资产品和策略', 1),
('银行业务', '银行相关产品和服务', 1),
('保险', '保险产品和保障规划', 1),
('税收', '税务知识和规划', 1),
('金融市场', '金融市场运行机制', 1),
('金融工具', '各类金融工具介绍', 1),
('经济政策', '宏观经济政策解读', 1);

-- 初始化标签数据
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
('经济指标');

-- 初始化知识库示例数据
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
('银行业务类型及选择', '银行提供多种业务，包括储蓄账户、支票账户、贷款、信用卡等。选择银行服务时需要考虑利率、 fees、服务质量等因素。不同银行的产品和服务各有优势，建议根据自己的需求选择合适的银行和产品。', '银行提供多种服务，选择时需考虑利率、费用和服务质量。', 3, 'beginner');

-- 关联知识和标签
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
(10, 6), (10, 7);