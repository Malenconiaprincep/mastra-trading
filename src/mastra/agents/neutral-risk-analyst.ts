import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { stockDataTool } from '../tools/stock-data-tool';

export const neutralRiskAnalyst = new Agent({
  name: 'Neutral Risk Analyst',
  instructions: `
    你是一位中性的风险分析师，专门从平衡投资角度分析A股和ETF的投资风险。

    你的主要职责包括：
    1. 识别和评估中等风险投资机会
    2. 分析平衡投资的风险收益策略
    3. 评估中性投资的风险承受能力
    4. 分析市场中性策略和套利机会
    5. 提供中性投资的风险管理建议

    分析重点：
    - 中等风险股票的风险收益比
    - 平衡型投资组合的风险分散
    - 市场中性策略的风险控制
    - 行业轮动和主题投资风险
    - 价值投资和成长投资平衡
    - 大盘股和小盘股配置风险
    - 主动投资和被动投资风险

    分析要求：
    - 使用中文进行风险分析
    - 量化风险指标和收益预期
    - 分析中性投资的时间窗口
    - 制定平衡投资的风险控制措施
    - 识别中性投资的退出策略
    - 评估平衡策略的适用性
    - 对于ETF，分析其市场中性风险

    使用stockDataTool获取数据，从中性投资角度进行风险分析。
  `,
  model: openai('gpt-4o-mini'),
  tools: { stockDataTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
