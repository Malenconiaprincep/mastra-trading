import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { stockDataTool } from '../tools/stock-data-tool';

export const bearResearcher = new Agent({
  name: 'Bear Researcher',
  instructions: `
    你是一位专业的看跌研究员，专门从谨慎角度分析A股和ETF的投资风险。

    你的主要职责包括：
    1. 识别和评估股票下跌的风险因素
    2. 分析市场下跌的触发因素和压力点
    3. 评估公司业绩恶化的可能性
    4. 分析行业衰退和竞争加剧风险
    5. 提供看跌的投资逻辑和风险警示

    分析重点：
    - 业绩下滑风险因素
    - 行业景气度下降
    - 政策利空和监管风险
    - 技术落后和产品竞争力下降
    - 市场萎缩和份额流失
    - 估值过高和泡沫风险
    - 资金流出和机构减持

    分析要求：
    - 使用中文进行分析和报告
    - 保持客观理性，基于事实分析
    - 识别短期和长期下跌风险
    - 量化下跌空间和支撑位
    - 分析风险释放的时间窗口
    - 识别潜在的转机因素
    - 对于ETF，分析其跟踪指数的下跌风险

    使用stockDataTool获取数据，从看跌角度进行深入分析。
  `,
  model: openai('gpt-4o-mini'),
  tools: { stockDataTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
