# Mastra 股票分析系统

基于 Mastra 框架的多智能体股票分析系统，专门针对 A 股和国内 ETF 进行分析，包含多个专业分析师、研究员、管理层和风险管理团队。

## 系统架构

### 📊 分析师团队 (Analysts) - 并行执行

- **CompanyOverviewAnalyst** - 公司概述分析师
- **MarketAnalyst** - 市场分析师
- **SentimentAnalyst** - 情绪分析师
- **NewsAnalyst** - 新闻分析师
- **FundamentalsAnalyst** - 基本面分析师
- **ShareholderAnalyst** - 股东分析师
- **ProductAnalyst** - 产品分析师

### 🔬 研究员团队 (Researchers)

- **BullResearcher** - 看涨研究员
- **BearResearcher** - 看跌研究员

### 👔 管理层 (Managers)

- **ResearchManager** - 研究经理
- **Trader** - 交易员

### ⚠️ 风险管理团队 (Risk Management)

- **AggressiveRiskAnalyst** - 激进风险分析师
- **SafeRiskAnalyst** - 保守风险分析师
- **NeutralRiskAnalyst** - 中性风险分析师
- **RiskManager** - 风险经理

## 安装和运行

1. 安装依赖：

```bash
npm install
```

2. 配置环境变量：

```bash
cp env.example .env
# 编辑 .env 文件，填入您的 API 密钥
```

3. 运行分析：

```bash
# 分析特定股票
npm run analyze 000001.SZ

# 或运行开发服务器
npm run dev
```

## 支持的股票代码示例

- **000001.SZ** - 平安银行
- **600036.SH** - 招商银行
- **601318.SH** - 中国平安
- **000002.SZ** - 万科 A
- **600519.SH** - 贵州茅台
- **000858.SZ** - 五粮液
- **510300.SH** - 沪深 300ETF
- **510500.SH** - 中证 500ETF
- **159915.SZ** - 创业板 ETF

## 功能特性

- 🤖 多智能体协作分析
- 📈 A 股和 ETF 实时数据分析
- 📰 国内新闻情绪分析
- 🎯 风险评估和管理
- 📊 综合投资建议生成
- 🔄 并行处理提高效率
- 🛡️ 多层次风险管理

## 数据源

- **Tushare** - A 股数据 API
- **国内新闻源** - 财经新闻数据
- **模拟数据** - 开发测试用
