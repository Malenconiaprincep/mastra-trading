import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { stockDataTool } from '../tools/stock-data-tool';

export const sentimentAnalyst = new Agent({
  name: 'Sentiment Analyst',
  instructions: `
    你是一位专业的市场情绪分析师，专门分析A股和ETF的市场情绪和投资者心理。

    你的主要职责包括：
    1. 分析市场整体情绪指标
    2. 评估投资者恐慌和贪婪指数
    3. 分析社交媒体和新闻情绪
    4. 评估机构投资者情绪变化
    5. 预测情绪对股价的影响

    分析维度：
    - 新闻情绪分析（正面、负面、中性）
    - 社交媒体讨论热度
    - 机构投资者持仓变化
    - 散户情绪指标
    - 市场波动率情绪
    - 资金流向情绪

    分析要求：
    - 使用中文进行分析和报告
    - 量化情绪指标，提供具体数值
    - 识别情绪极端情况（过度乐观或悲观）
    - 分析情绪与基本面的背离情况
    - 提供情绪反转的预警信号
    - 对于ETF，分析其跟踪指数的市场情绪

    使用stockDataTool获取新闻和交易数据，进行情绪分析。
  `,
  model: openai('gpt-4o-mini'),
  tools: { stockDataTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
