# A股和ETF股票分析工具

基于Mastra框架构建的专业股票分析工具，采用多团队协作的分析架构，为A股和ETF提供全面的投资分析。

## 🏗️ 系统架构

### 📊 分析师团队 (Analysts) - 并行执行

- **CompanyOverviewAnalyst** (公司概述分析师) - 分析公司基本情况和行业地位
- **MarketAnalyst** (市场分析师) - 分析市场表现和价格趋势
- **SentimentAnalyst** (情绪分析师) - 分析市场情绪和投资者心理
- **NewsAnalyst** (新闻分析师) - 分析相关新闻和公告
- **FundamentalsAnalyst** (基本面分析师) - 分析财务指标和估值
- **ShareholderAnalyst** (股东分析师) - 分析股东结构和变化
- **ProductAnalyst** (产品分析师) - 分析产品竞争力和市场表现

### 🔬 研究员团队 (Researchers)

- **BullResearcher** (看涨研究员) - 从积极角度寻找投资机会
- **BearResearcher** (看跌研究员) - 从谨慎角度识别投资风险

### 👔 管理层 (Managers)

- **ResearchManager** (研究经理) - 统筹分析团队，提供综合投资建议
- **Trader** (交易员) - 制定具体交易策略和操作指导

### ⚠️ 风险管理团队 (Risk Management)

- **AggressiveRiskAnalyst** (激进风险分析师) - 分析高风险高收益投资
- **SafeRiskAnalyst** (保守风险分析师) - 分析稳健投资策略
- **NeutralRiskAnalyst** (中性风险分析师) - 分析平衡投资方案
- **RiskManager** (风险经理) - 统筹风险管理，制定综合风控策略

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 运行分析示例

```bash
npm run build
node dist/example.js
```

## 📈 使用方法

### 1. 基本股票分析

```typescript
import { mastra } from "./src/mastra/index.js"

// 分析平安银行
const result = await mastra.workflows.stockAnalysisWorkflow.execute({
  stockCode: "000001.SZ",
  analysisType: "comprehensive",
})
```

### 2. ETF分析

```typescript
// 分析沪深300ETF
const result = await mastra.workflows.stockAnalysisWorkflow.execute({
  stockCode: "510300.SH",
  analysisType: "risk-focused",
})
```

### 3. 快速分析

```typescript
// 快速分析模式
const result = await mastra.workflows.stockAnalysisWorkflow.execute({
  stockCode: "000002.SZ",
  analysisType: "quick",
})
```

## 🔧 分析类型

- **comprehensive** (全面分析) - 执行所有团队的分析，提供最全面的投资建议
- **quick** (快速分析) - 执行核心团队分析，快速提供投资建议
- **risk-focused** (风险导向分析) - 重点关注风险管理团队的分析

## 📊 支持的股票类型

### A股股票

- 主板股票 (如: 000001.SZ - 平安银行)
- 创业板股票 (如: 300001.SZ - 特锐德)
- 科创板股票 (如: 688001.SH - 华兴源创)

### ETF基金

- 宽基ETF (如: 510300.SH - 沪深300ETF)
- 行业ETF (如: 512880.SH - 证券ETF)
- 主题ETF (如: 515050.SH - 5G ETF)

## 🛠️ 技术架构

### 工作流设计

1. **第一阶段**: 7个分析师并行执行基础分析
2. **第二阶段**: 2个研究员并行执行看涨/看跌分析
3. **第三阶段**: 3个风险分析师并行执行风险分析
4. **第四阶段**: 风险经理综合风险管理
5. **第五阶段**: 研究经理综合研究分析
6. **第六阶段**: 交易员制定交易策略
7. **最终阶段**: 生成综合投资报告

### 数据源

- 股票基础信息 (价格、成交量、市值等)
- 财务数据 (营收、利润、资产负债等)
- 新闻数据 (公司公告、行业新闻等)
- 股东信息 (持股结构、机构持仓等)

## 📋 输出报告

分析完成后，系统会生成包含以下内容的综合报告：

- **分析师团队分析结果** - 7个维度的专业分析
- **研究员团队分析结果** - 看涨/看跌观点对比
- **风险管理团队分析结果** - 多风险偏好的风险评估
- **管理层分析结果** - 综合投资建议和交易策略
- **最终投资建议** - 投资评级、目标价位、时间窗口

## 🔮 未来扩展

- [ ] 集成真实股票数据API (东方财富、同花顺等)
- [ ] 添加技术分析指标计算
- [ ] 支持更多投资品种 (港股、美股等)
- [ ] 添加回测功能
- [ ] 集成实时数据推送
- [ ] 添加投资组合管理功能

## 📝 注意事项

1. 当前版本使用模拟数据进行演示，实际使用需要集成真实的股票数据API
2. 所有分析结果仅供参考，不构成投资建议
3. 投资有风险，入市需谨慎
4. 建议结合多种分析方法进行投资决策

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

ISC License
