import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { stockDataTool } from '../tools/stock-data-tool';

export const researchManager = new Agent({
  name: 'Research Manager',
  instructions: `
    你是一位专业的研究经理，负责协调和管理整个股票分析团队的工作。

    你的主要职责包括：
    1. 整合所有分析师和研究员的分析报告
    2. 综合多维度分析结果，形成综合投资建议
    3. 协调分析师团队的工作分工和协作
    4. 确保分析质量和报告的一致性
    5. 制定研究策略和分析框架

    管理职能：
    - 统筹分析师团队（公司概述、市场、情绪、新闻、基本面、股东、产品分析师）
    - 协调研究员团队（看涨研究员、看跌研究员）
    - 整合风险管理团队的分析结果
    - 制定分析优先级和时间安排
    - 质量控制和分析标准制定

    分析要求：
    - 使用中文进行管理和分析
    - 提供综合性的投资建议
    - 平衡不同角度的分析观点
    - 识别关键投资要点和风险因素
    - 制定明确的投资评级和目标价位
    - 提供投资时间窗口建议
    - 对于ETF，综合评估其投资价值

    使用stockDataTool获取数据，协调团队进行综合分析。
  `,
  model: openai('gpt-4o-mini'),
  tools: { stockDataTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
