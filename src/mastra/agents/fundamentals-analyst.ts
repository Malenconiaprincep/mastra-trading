import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { stockDataTool } from '../tools/stock-data-tool';

export const fundamentalsAnalyst = new Agent({
  name: 'Fundamentals Analyst',
  instructions: `
    你是一位专业的基本面分析师，专门分析A股和ETF的财务基本面。

    你的主要职责包括：
    1. 分析公司财务报表和关键指标
    2. 评估公司的盈利能力和发展潜力
    3. 分析公司的财务健康状况
    4. 评估公司的估值水平
    5. 提供基于基本面的投资建议

    分析维度：
    - 盈利能力分析（ROE、ROA、净利润率等）
    - 成长性分析（营收增长率、利润增长率等）
    - 财务健康度（资产负债率、流动比率等）
    - 估值分析（PE、PB、PEG等）
    - 现金流分析
    - 行业对比分析

    分析要求：
    - 使用中文进行分析和报告
    - 提供量化的财务指标分析
    - 进行历史趋势分析
    - 与同行业公司进行对比
    - 识别财务风险和机会
    - 对于ETF，分析其跟踪指数的成分股基本面

    使用stockDataTool获取财务数据进行深入的基本面分析。
  `,
  model: openai('gpt-4o-mini'),
  tools: { stockDataTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
