# 系统架构说明

## 整体架构

```
📊 Mastra 股票分析系统
├── 🎯 主协调器 (TradingOrchestrator)
│   ├── 📊 分析师团队 (Analysts) - 并行执行
│   │   ├── CompanyOverviewAnalyst (公司概述分析师)
│   │   ├── MarketAnalyst (市场分析师)
│   │   ├── SentimentAnalyst (情绪分析师)
│   │   ├── NewsAnalyst (新闻分析师)
│   │   ├── FundamentalsAnalyst (基本面分析师)
│   │   ├── ShareholderAnalyst (股东分析师)
│   │   └── ProductAnalyst (产品分析师)
│   │
│   ├── 🔬 研究员团队 (Researchers)
│   │   ├── BullResearcher (看涨研究员)
│   │   └── BearResearcher (看跌研究员)
│   │
│   ├── 👔 管理层 (Managers)
│   │   ├── ResearchManager (研究经理)
│   │   └── Trader (交易员)
│   │
│   └── ⚠️ 风险管理团队 (Risk Management)
│       ├── AggressiveRiskAnalyst (激进风险分析师)
│       ├── SafeRiskAnalyst (保守风险分析师)
│       ├── NeutralRiskAnalyst (中性风险分析师)
│       └── RiskManager (风险经理)
│
├── 🔧 数据层 (Data Layer)
│   ├── StockDataFetcher (Tushare API)
│   ├── MockDataFetcher (模拟数据)
│   └── 数据获取工具
│
└── ⚙️ 配置层 (Configuration)
    ├── 环境变量配置
    ├── API 密钥管理
    └── 系统参数设置
```

## 工作流程

### 1. 数据获取阶段

- 获取股票基本信息
- 获取市场数据
- 获取新闻数据
- 获取基本面数据
- 获取股东信息

### 2. 分析师团队并行分析

- 7 个分析师同时工作
- 每个分析师专注于特定领域
- 生成专业分析报告

### 3. 研究员团队分析

- 看涨研究员：寻找投资机会
- 看跌研究员：识别风险因素
- 基于分析师报告进行深入研究

### 4. 管理层决策

- 研究经理：整合所有分析结果
- 制定最终投资建议
- 交易员：制定具体交易计划

### 5. 风险管理

- 3 个风险分析师从不同角度评估
- 风险经理：制定综合风险管理方案
- 最终风险控制措施

## 技术特点

### 并行处理

- 分析师团队并行执行，提高效率
- 研究员团队并行分析，多角度评估
- 风险分析师并行评估，全面覆盖

### 模块化设计

- 每个 Agent 职责单一，易于维护
- 工厂模式创建团队，便于扩展
- 配置与业务逻辑分离

### 数据适配

- 支持 Tushare API 获取真实数据
- 提供模拟数据用于开发测试
- 支持 A 股和 ETF 分析

### 错误处理

- 完善的异常处理机制
- 优雅降级到模拟数据
- 详细的错误日志记录

## 扩展性

### 新增分析师

1. 创建新的分析师类
2. 在 AnalystTeamFactory 中注册
3. 在 TradingOrchestrator 中调用

### 新增数据源

1. 实现新的数据获取器
2. 在配置中指定使用条件
3. 更新数据获取逻辑

### 新增风险类型

1. 创建新的风险分析师
2. 在 RiskManagementTeamFactory 中注册
3. 更新风险管理流程
