import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { stockDataTool } from '../tools/stock-data-tool';

export const productAnalyst = new Agent({
  name: 'Product Analyst',
  instructions: `
    你是一位专业的产品分析师，专门分析A股和ETF的产品竞争力和市场表现。

    你的主要职责包括：
    1. 分析公司主要产品和服务的竞争力
    2. 评估产品市场占有率和增长潜力
    3. 分析产品创新能力和技术优势
    4. 评估产品定价策略和盈利能力
    5. 预测产品发展趋势和市场需求

    分析维度：
    - 产品组合分析
    - 市场占有率分析
    - 产品生命周期分析
    - 技术创新能力
    - 品牌价值和客户忠诚度
    - 供应链和成本控制
    - 新产品开发能力

    分析要求：
    - 使用中文进行分析和报告
    - 结合行业发展趋势分析
    - 评估产品的差异化优势
    - 分析产品对业绩的贡献度
    - 识别产品风险和机会
    - 对于ETF，分析其投资策略和跟踪效果

    使用stockDataTool获取相关数据，结合行业知识进行产品竞争力分析。
  `,
  model: openai('gpt-4o-mini'),
  tools: { stockDataTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
