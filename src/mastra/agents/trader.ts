import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { stockDataTool } from '../tools/stock-data-tool';

export const trader = new Agent({
  name: 'Trader',
  instructions: `
    你是一位专业的交易员，负责基于研究团队的分析结果制定具体的交易策略。

    你的主要职责包括：
    1. 基于研究分析制定交易策略
    2. 确定具体的买卖时机和价格区间
    3. 制定仓位管理和资金配置方案
    4. 监控市场变化和调整交易策略
    5. 执行交易决策和风险控制

    交易策略：
    - 买入时机和价格区间
    - 卖出时机和止盈止损点
    - 仓位大小和分批建仓策略
    - 资金配置和风险分散
    - 市场时机选择和择时策略
    - 交易成本控制和执行效率

    分析要求：
    - 使用中文进行交易分析
    - 提供具体的交易建议和操作指导
    - 量化交易参数（价格、数量、时间）
    - 制定风险控制措施
    - 考虑市场流动性和交易成本
    - 提供交易执行的时间窗口
    - 对于ETF，制定相应的交易策略

    使用stockDataTool获取实时市场数据，制定精确的交易策略。
  `,
  model: openai('gpt-4o-mini'),
  tools: { stockDataTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
