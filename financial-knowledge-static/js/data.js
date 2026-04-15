// 金融知识平台静态数据

// 分类数据
const categories = [
    { id: 1, name: '个人理财', description: '个人财务管理相关知识', level: 1 },
    { id: 2, name: '投资', description: '各类投资产品和策略', level: 1 },
    { id: 3, name: '银行业务', description: '银行相关产品和服务', level: 1 },
    { id: 4, name: '保险', description: '保险产品和保障规划', level: 1 },
    { id: 5, name: '税收', description: '税务知识和规划', level: 1 },
    { id: 6, name: '金融市场', description: '金融市场运行机制', level: 1 },
    { id: 7, name: '金融工具', description: '各类金融工具介绍', level: 1 },
    { id: 8, name: '经济政策', description: '宏观经济政策解读', level: 1 }
];

// 标签数据
const tags = [
    { id: 1, name: '储蓄' },
    { id: 2, name: '基金' },
    { id: 3, name: '股票' },
    { id: 4, name: '债券' },
    { id: 5, name: '保险' },
    { id: 6, name: '信用卡' },
    { id: 7, name: '房贷' },
    { id: 8, name: '理财规划' },
    { id: 9, name: '退休规划' },
    { id: 10, name: '税务筹划' },
    { id: 11, name: '风险控制' },
    { id: 12, name: '通货膨胀' },
    { id: 13, name: '利率' },
    { id: 14, name: '汇率' },
    { id: 15, name: '经济指标' }
];

// 知识库数据
const knowledgeBase = [
    {
        id: 1,
        title: '什么是复利？',
        content: '复利是指在计算利息时，将本金和之前累积的利息一起计算新的利息。简单来说，就是利滚利。复利的计算公式是：A = P(1 + r/n)^(nt)，其中A是最终金额，P是本金，r是年利率，n是每年计息次数，t是年数。复利的魔力在于时间，长期投资可以获得惊人的回报。',
        summary: '复利是利滚利的计算方式，长期投资可以获得惊人回报。',
        category_id: 2,
        category_name: '投资',
        difficulty_level: 'beginner',
        read_count: 1200,
        like_count: 89,
        tags: [1, 8]
    },
    {
        id: 2,
        title: '如何制定个人预算？',
        content: '制定个人预算的步骤：1. 记录所有收入来源；2. 列出所有支出，包括固定支出和可变支出；3. 计算收支差额；4. 设定储蓄目标；5. 定期检查和调整预算。预算可以帮助你控制支出，避免不必要的消费，为未来的财务目标做准备。',
        summary: '个人预算制定的五个步骤，帮助控制支出实现财务目标。',
        category_id: 1,
        category_name: '个人理财',
        difficulty_level: 'beginner',
        read_count: 980,
        like_count: 76,
        tags: [1, 8]
    },
    {
        id: 3,
        title: '基金投资入门',
        content: '基金是一种集合投资工具，由专业基金经理管理。投资者购买基金份额，基金经理将资金投资于股票、债券等资产。基金的优势包括分散风险、专业管理、门槛低等。常见的基金类型有股票基金、债券基金、混合型基金、货币市场基金等。',
        summary: '基金是集合投资工具，由专业经理管理，分散风险，门槛低。',
        category_id: 2,
        category_name: '投资',
        difficulty_level: 'intermediate',
        read_count: 850,
        like_count: 67,
        tags: [2, 8]
    },
    {
        id: 4,
        title: '保险的重要性',
        content: '保险是一种风险管理工具，可以在意外发生时提供经济保障。常见的保险类型包括人寿保险、健康保险、财产保险等。购买保险时需要考虑自己的需求和预算，选择合适的保险产品。保险可以帮助你应对疾病、意外、财产损失等风险，为家庭提供财务保障。',
        summary: '保险是风险管理工具，为意外情况提供经济保障。',
        category_id: 4,
        category_name: '保险',
        difficulty_level: 'beginner',
        read_count: 1100,
        like_count: 92,
        tags: [5, 11]
    },
    {
        id: 5,
        title: '如何提高信用评分？',
        content: '信用评分是衡量个人信用状况的指标，影响贷款、信用卡申请等。提高信用评分的方法包括：按时还款、保持低信用 utilization、建立长期信用历史、避免频繁申请新信用、定期检查信用报告等。良好的信用评分可以帮助你获得更低的贷款利率和更好的金融服务。',
        summary: '信用评分影响金融服务获取，按时还款和低 utilization 是关键。',
        category_id: 3,
        category_name: '银行业务',
        difficulty_level: 'intermediate',
        read_count: 780,
        like_count: 54,
        tags: [6, 8]
    },
    {
        id: 6,
        title: '退休规划的重要性',
        content: '退休规划是为了确保退休后有足够的收入维持生活水平。建议尽早开始规划，通过储蓄、投资等方式积累退休资金。常见的退休规划工具包括养老金、个人退休账户、投资组合等。合理的退休规划可以帮助你在退休后享受财务自由的生活。',
        summary: '退休规划确保晚年生活质量，应尽早开始并多样化投资。',
        category_id: 1,
        category_name: '个人理财',
        difficulty_level: 'intermediate',
        read_count: 890,
        like_count: 68,
        tags: [9, 8]
    },
    {
        id: 7,
        title: '股票投资基础知识',
        content: '股票是公司的所有权凭证，购买股票意味着成为公司的股东。股票投资的收益来自股息和资本增值。投资股票需要了解公司基本面、行业趋势、市场环境等因素。股票投资具有较高的风险，但也可能带来较高的回报。',
        summary: '股票是公司所有权凭证，投资需了解基本面和市场环境。',
        category_id: 2,
        category_name: '投资',
        difficulty_level: 'intermediate',
        read_count: 950,
        like_count: 72,
        tags: [3, 11]
    },
    {
        id: 8,
        title: '税务筹划的基本方法',
        content: '税务筹划是合法降低税负的方法，包括利用税收优惠政策、合理安排收入和支出、选择合适的投资工具等。常见的税务筹划方法包括：利用个人所得税专项扣除、投资税收优惠产品、合理规划资产配置等。税务筹划可以帮助你合法减少税务支出，提高税后收入。',
        summary: '税务筹划合法降低税负，包括利用优惠政策和合理安排收支。',
        category_id: 5,
        category_name: '税收',
        difficulty_level: 'advanced',
        read_count: 650,
        like_count: 43,
        tags: [10, 8]
    },
    {
        id: 9,
        title: '如何应对通货膨胀？',
        content: '通货膨胀是指货币购买力下降，物价普遍上涨的现象。应对通货膨胀的方法包括：投资实物资产（如房地产、黄金）、投资股票、购买通胀保值债券、提高收入水平等。长期来看，股票投资是对抗通货膨胀的有效手段之一。',
        summary: '通货膨胀降低购买力，可通过投资实物资产和股票应对。',
        category_id: 6,
        category_name: '金融市场',
        difficulty_level: 'intermediate',
        read_count: 820,
        like_count: 59,
        tags: [12, 8]
    },
    {
        id: 10,
        title: '银行业务类型及选择',
        content: '银行提供多种业务，包括储蓄账户、支票账户、贷款、信用卡等。选择银行服务时需要考虑利率、 fees、服务质量等因素。不同银行的产品和服务各有优势，建议根据自己的需求选择合适的银行和产品。',
        summary: '银行提供多种服务，选择时需考虑利率、费用和服务质量。',
        category_id: 3,
        category_name: '银行业务',
        difficulty_level: 'beginner',
        read_count: 750,
        like_count: 48,
        tags: [6, 7]
    }
];

// 推荐数据（基于热门程度）
const recommendations = knowledgeBase
    .sort((a, b) => b.read_count - a.read_count)
    .slice(0, 5);