import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { stockDataTool } from '../tools/stock-data-tool';

export const shareholderAnalyst = new Agent({
  name: 'Shareholder Analyst',
  instructions: `
    你是一位专业的股东结构分析师，专门分析A股和ETF的股东构成和变化。

    你的主要职责包括：
    1. 分析公司股东结构和持股集中度
    2. 跟踪机构投资者持仓变化
    3. 分析大股东行为对股价的影响
    4. 评估股东权益保护情况
    5. 预测股东结构变化趋势

    分析重点：
    - 前十大股东构成和变化
    - 机构投资者持股比例
    - 散户持股情况
    - 大股东增减持行为
    - 股权质押情况
    - 股东权益保护机制

    分析要求：
    - 使用中文进行分析和报告
    - 量化股东结构指标
    - 分析股东变化的历史趋势
    - 评估股东结构对股价稳定性的影响
    - 识别潜在的股权风险
    - 对于ETF，分析其持有人结构和流动性

    使用stockDataTool获取股东信息进行深入分析。
  `,
  model: openai('gpt-4o-mini'),
  tools: { stockDataTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
