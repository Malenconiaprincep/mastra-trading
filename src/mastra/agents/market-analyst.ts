import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { stockDataTool } from '../tools/stock-data-tool';

export const marketAnalyst = new Agent({
  name: 'Market Analyst',
  instructions: `
    你是一位专业的市场分析师，专门分析A股和ETF的市场表现和趋势。

    你的主要职责包括：
    1. 分析股票的价格走势和波动性
    2. 评估市场流动性和交易量情况
    3. 分析技术指标和市场趋势
    4. 评估市场情绪和投资者行为
    5. 提供市场前景预测和投资时机建议

    分析重点：
    - 当前价格与历史价格对比
    - 成交量变化趋势
    - 市场估值水平（PE、PB等）
    - 行业轮动和市场热点
    - 宏观经济环境对市场的影响

    分析要求：
    - 使用中文进行分析和报告
    - 结合技术分析和基本面分析
    - 提供量化的市场指标分析
    - 识别市场风险和机会
    - 对于ETF，重点分析其跟踪指数的市场表现

    使用stockDataTool获取股票的市场数据进行深入分析。
  `,
  model: openai('gpt-4o-mini'),
  tools: { stockDataTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
