import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// 定义输入和输出模式
const stockAnalysisInputSchema = z.object({
  stockCode: z.string().describe('股票代码，如000001.SZ（平安银行）或510300.SH（沪深300ETF）'),
  analysisType: z.enum(['comprehensive', 'quick', 'risk-focused']).default('comprehensive').describe('分析类型：comprehensive(全面分析)、quick(快速分析)、risk-focused(风险导向分析)'),
});

const stockAnalysisOutputSchema = z.object({
  stockCode: z.string(),
  analysisType: z.string(),
  timestamp: z.string(),
  summary: z.object({
    title: z.string(),
    analysisType: z.string(),
  }),
  analystTeam: z.object({
    companyOverview: z.string().optional(),
    marketAnalysis: z.string().optional(),
    sentimentAnalysis: z.string().optional(),
    newsAnalysis: z.string().optional(),
    fundamentalsAnalysis: z.string().optional(),
    shareholderAnalysis: z.string().optional(),
    productAnalysis: z.string().optional(),
  }),
  researcherTeam: z.object({
    bullResearch: z.string().optional(),
    bearResearch: z.string().optional(),
  }),
  riskTeam: z.object({
    aggressiveRisk: z.string().optional(),
    safeRisk: z.string().optional(),
    neutralRisk: z.string().optional(),
    riskManagement: z.string().optional(),
  }),
  managementTeam: z.object({
    researchManagement: z.string().optional(),
    tradingStrategy: z.string().optional(),
  }),
  conclusion: z.object({
    recommendation: z.string(),
    riskLevel: z.string(),
    targetPrice: z.string(),
    timeHorizon: z.string(),
  }),
});

// 创建分析师团队分析步骤
const analystTeamStep = createStep({
  id: 'analyst-team',
  description: '分析师团队并行分析',
  inputSchema: stockAnalysisInputSchema,
  outputSchema: z.object({
    companyOverview: z.string(),
    marketAnalysis: z.string(),
    sentimentAnalysis: z.string(),
    newsAnalysis: z.string(),
    fundamentalsAnalysis: z.string(),
    shareholderAnalysis: z.string(),
    productAnalysis: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const stockCode = inputData.stockCode;

    // 获取各个分析师
    const companyAnalyst = mastra?.getAgent('companyOverviewAnalyst');
    const marketAnalyst = mastra?.getAgent('marketAnalyst');
    const sentimentAnalyst = mastra?.getAgent('sentimentAnalyst');
    const newsAnalyst = mastra?.getAgent('newsAnalyst');
    const fundamentalsAnalyst = mastra?.getAgent('fundamentalsAnalyst');
    const shareholderAnalyst = mastra?.getAgent('shareholderAnalyst');
    const productAnalyst = mastra?.getAgent('productAnalyst');

    if (!companyAnalyst || !marketAnalyst || !sentimentAnalyst || !newsAnalyst ||
      !fundamentalsAnalyst || !shareholderAnalyst || !productAnalyst) {
      throw new Error('Required analysts not found');
    }

    // 并行执行分析
    const [
      companyResult,
      marketResult,
      sentimentResult,
      newsResult,
      fundamentalsResult,
      shareholderResult,
      productResult
    ] = await Promise.all([
      companyAnalyst.stream([{ role: 'user', content: `请分析股票 ${stockCode} 的公司概述情况` }]),
      marketAnalyst.stream([{ role: 'user', content: `请分析股票 ${stockCode} 的市场表现和趋势` }]),
      sentimentAnalyst.stream([{ role: 'user', content: `请分析股票 ${stockCode} 的市场情绪` }]),
      newsAnalyst.stream([{ role: 'user', content: `请分析股票 ${stockCode} 的相关新闻` }]),
      fundamentalsAnalyst.stream([{ role: 'user', content: `请分析股票 ${stockCode} 的基本面情况` }]),
      shareholderAnalyst.stream([{ role: 'user', content: `请分析股票 ${stockCode} 的股东结构` }]),
      productAnalyst.stream([{ role: 'user', content: `请分析股票 ${stockCode} 的产品竞争力` }]),
    ]);

    // 收集所有响应文本
    let companyText = '';
    let marketText = '';
    let sentimentText = '';
    let newsText = '';
    let fundamentalsText = '';
    let shareholderText = '';
    let productText = '';

    for await (const chunk of companyResult.textStream) {
      companyText += chunk;
    }
    for await (const chunk of marketResult.textStream) {
      marketText += chunk;
    }
    for await (const chunk of sentimentResult.textStream) {
      sentimentText += chunk;
    }
    for await (const chunk of newsResult.textStream) {
      newsText += chunk;
    }
    for await (const chunk of fundamentalsResult.textStream) {
      fundamentalsText += chunk;
    }
    for await (const chunk of shareholderResult.textStream) {
      shareholderText += chunk;
    }
    for await (const chunk of productResult.textStream) {
      productText += chunk;
    }

    return {
      companyOverview: companyText,
      marketAnalysis: marketText,
      sentimentAnalysis: sentimentText,
      newsAnalysis: newsText,
      fundamentalsAnalysis: fundamentalsText,
      shareholderAnalysis: shareholderText,
      productAnalysis: productText,
    };
  },
});

// 创建研究员团队分析步骤
const researcherTeamStep = createStep({
  id: 'researcher-team',
  description: '研究员团队并行分析',
  inputSchema: z.object({
    stockCode: z.string(),
    analysisType: z.string(),
    analystResults: z.object({
      companyOverview: z.string(),
      marketAnalysis: z.string(),
      sentimentAnalysis: z.string(),
      newsAnalysis: z.string(),
      fundamentalsAnalysis: z.string(),
      shareholderAnalysis: z.string(),
      productAnalysis: z.string(),
    }),
  }),
  outputSchema: z.object({
    bullResearch: z.string(),
    bearResearch: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const stockCode = inputData.stockCode;
    const analystResults = inputData.analystResults;

    // 获取研究员
    const bullResearcher = mastra?.getAgent('bullResearcher');
    const bearResearcher = mastra?.getAgent('bearResearcher');

    if (!bullResearcher || !bearResearcher) {
      throw new Error('Required researchers not found');
    }

    // 并行执行研究
    const [bullResult, bearResult] = await Promise.all([
      bullResearcher.stream([{ role: 'user', content: `基于以下分析师团队的分析结果，请从看涨角度分析股票 ${stockCode} 的投资机会：\n${JSON.stringify(analystResults, null, 2)}` }]),
      bearResearcher.stream([{ role: 'user', content: `基于以下分析师团队的分析结果，请从看跌角度分析股票 ${stockCode} 的投资风险：\n${JSON.stringify(analystResults, null, 2)}` }]),
    ]);

    // 收集响应文本
    let bullText = '';
    let bearText = '';

    for await (const chunk of bullResult.textStream) {
      bullText += chunk;
    }
    for await (const chunk of bearResult.textStream) {
      bearText += chunk;
    }

    return {
      bullResearch: bullText,
      bearResearch: bearText,
    };
  },
});

// 创建风险管理团队分析步骤
const riskTeamStep = createStep({
  id: 'risk-team',
  description: '风险管理团队并行分析',
  inputSchema: z.object({
    stockCode: z.string(),
    analysisType: z.string(),
    analystResults: z.object({
      companyOverview: z.string(),
      marketAnalysis: z.string(),
      sentimentAnalysis: z.string(),
      newsAnalysis: z.string(),
      fundamentalsAnalysis: z.string(),
      shareholderAnalysis: z.string(),
      productAnalysis: z.string(),
    }),
    researcherResults: z.object({
      bullResearch: z.string(),
      bearResearch: z.string(),
    }),
  }),
  outputSchema: z.object({
    aggressiveRisk: z.string(),
    safeRisk: z.string(),
    neutralRisk: z.string(),
    riskManagement: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const stockCode = inputData.stockCode;
    const analystResults = inputData.analystResults;
    const researcherResults = inputData.researcherResults;

    // 获取风险分析师
    const aggressiveRiskAnalyst = mastra?.getAgent('aggressiveRiskAnalyst');
    const safeRiskAnalyst = mastra?.getAgent('safeRiskAnalyst');
    const neutralRiskAnalyst = mastra?.getAgent('neutralRiskAnalyst');
    const riskManager = mastra?.getAgent('riskManager');

    if (!aggressiveRiskAnalyst || !safeRiskAnalyst || !neutralRiskAnalyst || !riskManager) {
      throw new Error('Required risk analysts not found');
    }

    // 并行执行风险分析
    const [aggressiveResult, safeResult, neutralResult] = await Promise.all([
      aggressiveRiskAnalyst.stream([{ role: 'user', content: `基于前期分析结果，请从激进投资角度分析股票 ${stockCode} 的风险` }]),
      safeRiskAnalyst.stream([{ role: 'user', content: `基于前期分析结果，请从保守投资角度分析股票 ${stockCode} 的风险` }]),
      neutralRiskAnalyst.stream([{ role: 'user', content: `基于前期分析结果，请从中性投资角度分析股票 ${stockCode} 的风险` }]),
    ]);

    // 风险经理综合管理
    const riskManagementResult = await riskManager.stream([{ role: 'user', content: `请统筹风险管理团队的分析结果，为股票 ${stockCode} 制定综合风险管理策略` }]);

    // 收集响应文本
    let aggressiveText = '';
    let safeText = '';
    let neutralText = '';
    let riskManagementText = '';

    for await (const chunk of aggressiveResult.textStream) {
      aggressiveText += chunk;
    }
    for await (const chunk of safeResult.textStream) {
      safeText += chunk;
    }
    for await (const chunk of neutralResult.textStream) {
      neutralText += chunk;
    }
    for await (const chunk of riskManagementResult.textStream) {
      riskManagementText += chunk;
    }

    return {
      aggressiveRisk: aggressiveText,
      safeRisk: safeText,
      neutralRisk: neutralText,
      riskManagement: riskManagementText,
    };
  },
});

// 创建研究经理综合研究步骤
const researchManagementStep = createStep({
  id: 'research-management',
  description: '研究经理综合研究',
  inputSchema: z.object({
    stockCode: z.string(),
    analysisType: z.string(),
    analystResults: z.object({
      companyOverview: z.string(),
      marketAnalysis: z.string(),
      sentimentAnalysis: z.string(),
      newsAnalysis: z.string(),
      fundamentalsAnalysis: z.string(),
      shareholderAnalysis: z.string(),
      productAnalysis: z.string(),
    }),
    researcherResults: z.object({
      bullResearch: z.string(),
      bearResearch: z.string(),
    }),
    riskResults: z.object({
      aggressiveRisk: z.string(),
      safeRisk: z.string(),
      neutralRisk: z.string(),
      riskManagement: z.string(),
    }),
  }),
  outputSchema: z.object({
    researchManagement: z.string(),
    tradingStrategy: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const stockCode = inputData.stockCode;
    const allResults = {
      analystResults: inputData.analystResults,
      researcherResults: inputData.researcherResults,
      riskResults: inputData.riskResults,
    };

    // 获取研究经理和交易员
    const researchManager = mastra?.getAgent('researchManager');
    const trader = mastra?.getAgent('trader');

    if (!researchManager || !trader) {
      throw new Error('Required managers not found');
    }

    // 研究经理综合研究
    const researchResult = await researchManager.stream([{ role: 'user', content: `请整合所有团队的分析结果，为股票 ${stockCode} 提供综合投资建议：\n${JSON.stringify(allResults, null, 2)}` }]);

    // 交易员制定交易策略
    const tradingResult = await trader.stream([{ role: 'user', content: `基于综合研究结果，请为股票 ${stockCode} 制定具体的交易策略` }]);

    // 收集响应文本
    let researchText = '';
    let tradingText = '';

    for await (const chunk of researchResult.textStream) {
      researchText += chunk;
    }
    for await (const chunk of tradingResult.textStream) {
      tradingText += chunk;
    }

    return {
      researchManagement: researchText,
      tradingStrategy: tradingText,
    };
  },
});

// 创建最终报告生成步骤
const finalReportStep = createStep({
  id: 'final-report',
  description: '生成最终综合报告',
  inputSchema: z.object({
    stockCode: z.string(),
    analysisType: z.string(),
    analystResults: z.object({
      companyOverview: z.string(),
      marketAnalysis: z.string(),
      sentimentAnalysis: z.string(),
      newsAnalysis: z.string(),
      fundamentalsAnalysis: z.string(),
      shareholderAnalysis: z.string(),
      productAnalysis: z.string(),
    }),
    researcherResults: z.object({
      bullResearch: z.string(),
      bearResearch: z.string(),
    }),
    riskResults: z.object({
      aggressiveRisk: z.string(),
      safeRisk: z.string(),
      neutralRisk: z.string(),
      riskManagement: z.string(),
    }),
    managementResults: z.object({
      researchManagement: z.string(),
      tradingStrategy: z.string(),
    }),
  }),
  outputSchema: stockAnalysisOutputSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const stockCode = inputData.stockCode;
    const analysisType = inputData.analysisType;

    return {
      stockCode,
      analysisType,
      timestamp: new Date().toISOString(),
      summary: {
        title: `股票 ${stockCode} 综合分析报告`,
        analysisType: analysisType === 'comprehensive' ? '全面分析' :
          analysisType === 'quick' ? '快速分析' : '风险导向分析',
      },
      analystTeam: inputData.analystResults,
      researcherTeam: inputData.researcherResults,
      riskTeam: inputData.riskResults,
      managementTeam: inputData.managementResults,
      conclusion: {
        recommendation: '基于多维度分析的综合投资建议',
        riskLevel: '综合风险评估',
        targetPrice: '目标价位建议',
        timeHorizon: '投资时间窗口',
      },
    };
  },
});

// 创建简化的综合分析步骤
const comprehensiveAnalysisStep = createStep({
  id: 'comprehensive-analysis',
  description: '执行完整的股票分析流程',
  inputSchema: stockAnalysisInputSchema,
  outputSchema: stockAnalysisOutputSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const stockCode = inputData.stockCode;
    const analysisType = inputData.analysisType;

    // 获取所有需要的Agent
    const companyAnalyst = mastra?.getAgent('companyOverviewAnalyst');
    const marketAnalyst = mastra?.getAgent('marketAnalyst');
    const sentimentAnalyst = mastra?.getAgent('sentimentAnalyst');
    const newsAnalyst = mastra?.getAgent('newsAnalyst');
    const fundamentalsAnalyst = mastra?.getAgent('fundamentalsAnalyst');
    const shareholderAnalyst = mastra?.getAgent('shareholderAnalyst');
    const productAnalyst = mastra?.getAgent('productAnalyst');
    const bullResearcher = mastra?.getAgent('bullResearcher');
    const bearResearcher = mastra?.getAgent('bearResearcher');
    const researchManager = mastra?.getAgent('researchManager');
    const trader = mastra?.getAgent('trader');
    const aggressiveRiskAnalyst = mastra?.getAgent('aggressiveRiskAnalyst');
    const safeRiskAnalyst = mastra?.getAgent('safeRiskAnalyst');
    const neutralRiskAnalyst = mastra?.getAgent('neutralRiskAnalyst');
    const riskManager = mastra?.getAgent('riskManager');

    if (!companyAnalyst || !marketAnalyst || !sentimentAnalyst || !newsAnalyst ||
      !fundamentalsAnalyst || !shareholderAnalyst || !productAnalyst ||
      !bullResearcher || !bearResearcher || !researchManager || !trader ||
      !aggressiveRiskAnalyst || !safeRiskAnalyst || !neutralRiskAnalyst || !riskManager) {
      throw new Error('Required agents not found');
    }

    // 第一阶段：分析师团队并行分析
    console.log('📊 开始分析师团队分析...');
    const [
      companyResult,
      marketResult,
      sentimentResult,
      newsResult,
      fundamentalsResult,
      shareholderResult,
      productResult
    ] = await Promise.all([
      companyAnalyst.stream([{ role: 'user', content: `请分析股票 ${stockCode} 的公司概述情况` }]),
      marketAnalyst.stream([{ role: 'user', content: `请分析股票 ${stockCode} 的市场表现和趋势` }]),
      sentimentAnalyst.stream([{ role: 'user', content: `请分析股票 ${stockCode} 的市场情绪` }]),
      newsAnalyst.stream([{ role: 'user', content: `请分析股票 ${stockCode} 的相关新闻` }]),
      fundamentalsAnalyst.stream([{ role: 'user', content: `请分析股票 ${stockCode} 的基本面情况` }]),
      shareholderAnalyst.stream([{ role: 'user', content: `请分析股票 ${stockCode} 的股东结构` }]),
      productAnalyst.stream([{ role: 'user', content: `请分析股票 ${stockCode} 的产品竞争力` }]),
    ]);

    // 收集分析师结果
    let companyText = '';
    let marketText = '';
    let sentimentText = '';
    let newsText = '';
    let fundamentalsText = '';
    let shareholderText = '';
    let productText = '';

    for await (const chunk of companyResult.textStream) {
      companyText += chunk;
    }
    for await (const chunk of marketResult.textStream) {
      marketText += chunk;
    }
    for await (const chunk of sentimentResult.textStream) {
      sentimentText += chunk;
    }
    for await (const chunk of newsResult.textStream) {
      newsText += chunk;
    }
    for await (const chunk of fundamentalsResult.textStream) {
      fundamentalsText += chunk;
    }
    for await (const chunk of shareholderResult.textStream) {
      shareholderText += chunk;
    }
    for await (const chunk of productResult.textStream) {
      productText += chunk;
    }

    const analystResults = {
      companyOverview: companyText,
      marketAnalysis: marketText,
      sentimentAnalysis: sentimentText,
      newsAnalysis: newsText,
      fundamentalsAnalysis: fundamentalsText,
      shareholderAnalysis: shareholderText,
      productAnalysis: productText,
    };

    // 第二阶段：研究员团队分析
    console.log('🔬 开始研究员团队分析...');
    const [bullResult, bearResult] = await Promise.all([
      bullResearcher.stream([{ role: 'user', content: `基于分析师团队的分析结果，请从看涨角度分析股票 ${stockCode} 的投资机会` }]),
      bearResearcher.stream([{ role: 'user', content: `基于分析师团队的分析结果，请从看跌角度分析股票 ${stockCode} 的投资风险` }]),
    ]);

    let bullText = '';
    let bearText = '';

    for await (const chunk of bullResult.textStream) {
      bullText += chunk;
    }
    for await (const chunk of bearResult.textStream) {
      bearText += chunk;
    }

    const researcherResults = {
      bullResearch: bullText,
      bearResearch: bearText,
    };

    // 第三阶段：风险管理团队分析
    console.log('⚠️ 开始风险管理团队分析...');
    const [aggressiveResult, safeResult, neutralResult] = await Promise.all([
      aggressiveRiskAnalyst.stream([{ role: 'user', content: `基于前期分析结果，请从激进投资角度分析股票 ${stockCode} 的风险` }]),
      safeRiskAnalyst.stream([{ role: 'user', content: `基于前期分析结果，请从保守投资角度分析股票 ${stockCode} 的风险` }]),
      neutralRiskAnalyst.stream([{ role: 'user', content: `基于前期分析结果，请从中性投资角度分析股票 ${stockCode} 的风险` }]),
    ]);

    let aggressiveText = '';
    let safeText = '';
    let neutralText = '';

    for await (const chunk of aggressiveResult.textStream) {
      aggressiveText += chunk;
    }
    for await (const chunk of safeResult.textStream) {
      safeText += chunk;
    }
    for await (const chunk of neutralResult.textStream) {
      neutralText += chunk;
    }

    // 风险经理综合管理
    const riskManagementResult = await riskManager.stream([{ role: 'user', content: `请统筹风险管理团队的分析结果，为股票 ${stockCode} 制定综合风险管理策略` }]);
    let riskManagementText = '';
    for await (const chunk of riskManagementResult.textStream) {
      riskManagementText += chunk;
    }

    const riskResults = {
      aggressiveRisk: aggressiveText,
      safeRisk: safeText,
      neutralRisk: neutralText,
      riskManagement: riskManagementText,
    };

    // 第四阶段：研究经理综合研究
    console.log('👔 开始管理层分析...');
    const allResults = {
      analystResults,
      researcherResults,
      riskResults,
    };

    const researchResult = await researchManager.stream([{ role: 'user', content: `请整合所有团队的分析结果，为股票 ${stockCode} 提供综合投资建议` }]);
    let researchText = '';
    for await (const chunk of researchResult.textStream) {
      researchText += chunk;
    }

    // 第五阶段：交易员制定交易策略
    const tradingResult = await trader.stream([{ role: 'user', content: `基于综合研究结果，请为股票 ${stockCode} 制定具体的交易策略` }]);
    let tradingText = '';
    for await (const chunk of tradingResult.textStream) {
      tradingText += chunk;
    }

    const managementResults = {
      researchManagement: researchText,
      tradingStrategy: tradingText,
    };

    // 生成最终报告
    console.log('📋 生成最终分析报告...');
    return {
      stockCode,
      analysisType,
      timestamp: new Date().toISOString(),
      summary: {
        title: `股票 ${stockCode} 综合分析报告`,
        analysisType: analysisType === 'comprehensive' ? '全面分析' :
          analysisType === 'quick' ? '快速分析' : '风险导向分析',
      },
      analystTeam: analystResults,
      researcherTeam: researcherResults,
      riskTeam: riskResults,
      managementTeam: managementResults,
      conclusion: {
        recommendation: '基于多维度分析的综合投资建议',
        riskLevel: '综合风险评估',
        targetPrice: '目标价位建议',
        timeHorizon: '投资时间窗口',
      },
    };
  },
});

// 创建工作流
export const stockAnalysisWorkflow = createWorkflow({
  id: 'stock-analysis-workflow',
  inputSchema: stockAnalysisInputSchema,
  outputSchema: stockAnalysisOutputSchema,
})
  .then(comprehensiveAnalysisStep);

stockAnalysisWorkflow.commit();
