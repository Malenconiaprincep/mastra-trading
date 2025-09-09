
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';

// 导入工作流
import { stockAnalysisWorkflow } from './workflows/stock-analysis-workflow';

// 导入分析师团队
import { companyOverviewAnalyst } from './agents/company-overview-analyst';
import { marketAnalyst } from './agents/market-analyst';
import { sentimentAnalyst } from './agents/sentiment-analyst';
import { newsAnalyst } from './agents/news-analyst';
import { fundamentalsAnalyst } from './agents/fundamentals-analyst';
import { shareholderAnalyst } from './agents/shareholder-analyst';
import { productAnalyst } from './agents/product-analyst';

// 导入研究员团队
import { bullResearcher } from './agents/bull-researcher';
import { bearResearcher } from './agents/bear-researcher';

// 导入管理层
import { researchManager } from './agents/research-manager';
import { trader } from './agents/trader';

// 导入风险管理团队
import { aggressiveRiskAnalyst } from './agents/aggressive-risk-analyst';
import { safeRiskAnalyst } from './agents/safe-risk-analyst';
import { neutralRiskAnalyst } from './agents/neutral-risk-analyst';
import { riskManager } from './agents/risk-manager';

export const mastra = new Mastra({
  workflows: {
    stockAnalysisWorkflow,
  },
  agents: {
    // 分析师团队
    companyOverviewAnalyst,
    marketAnalyst,
    sentimentAnalyst,
    newsAnalyst,
    fundamentalsAnalyst,
    shareholderAnalyst,
    productAnalyst,

    // 研究员团队
    bullResearcher,
    bearResearcher,

    // 管理层
    researchManager,
    trader,

    // 风险管理团队
    aggressiveRiskAnalyst,
    safeRiskAnalyst,
    neutralRiskAnalyst,
    riskManager,
  },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra Stock Analysis',
    level: 'info',
  }),
});
