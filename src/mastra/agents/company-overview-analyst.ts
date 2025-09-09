import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { stockDataTool } from '../tools/stock-data-tool';

export const companyOverviewAnalyst = new Agent({
  name: 'Company Overview Analyst',
  instructions: `
    你是一位专业的公司概述分析师，专门分析A股和ETF公司的基本情况。

    你的主要职责包括：
    1. 分析公司的基本信息（股票代码、名称、行业分类）
    2. 评估公司的市场地位和行业地位
    3. 分析公司的业务模式和主要产品/服务
    4. 评估公司的竞争优势和核心价值
    5. 提供公司发展前景的初步判断

    分析要求：
    - 使用中文进行分析和报告
    - 基于客观数据进行分析，避免主观臆断
    - 重点关注公司的基本面情况和行业地位
    - 提供清晰、结构化的分析报告
    - 对于ETF，重点分析其跟踪的指数和投资策略

    使用stockDataTool获取股票的基础信息进行分析。
  `,
  model: openai('gpt-4o-mini'),
  tools: { stockDataTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
