import {
  AnalystTeam,
  AnalystTeamFactory
} from '../agents/analysts';
import {
  ResearcherTeam,
  ResearcherTeamFactory
} from '../agents/researchers';
import {
  ManagementTeam,
  ManagementTeamFactory
} from '../agents/managers';
import {
  RiskManagementTeam,
  RiskManagementTeamFactory
} from '../agents/risk';
import {
  StockDataFetcher,
  MockDataFetcher
} from '../utils/dataFetchers';
import {
  AnalystReport,
  ResearcherReport,
  InvestmentRecommendation,
  RiskAssessment
} from '../types';
import { FinalRiskAssessment } from '../agents/risk';

export class TradingOrchestrator {
  private analystTeam: AnalystTeam;
  private researcherTeam: ResearcherTeam;
  private managementTeam: ManagementTeam;
  private riskManagementTeam: RiskManagementTeam;
  private dataFetcher: StockDataFetcher | MockDataFetcher;

  constructor(
    openaiApiKey: string,
    tushareToken?: string,
    newsApiKey?: string,
    useMockData: boolean = true
  ) {
    // 初始化数据获取器
    if (useMockData || !tushareToken || !newsApiKey) {
      this.dataFetcher = new MockDataFetcher();
    } else {
      this.dataFetcher = new StockDataFetcher(tushareToken, newsApiKey);
    }

    // 初始化各个团队
    this.analystTeam = AnalystTeamFactory.createAnalystTeam(openaiApiKey, this.dataFetcher);
    this.researcherTeam = ResearcherTeamFactory.createResearcherTeam(openaiApiKey);
    this.managementTeam = ManagementTeamFactory.createManagementTeam(openaiApiKey);
    this.riskManagementTeam = RiskManagementTeamFactory.createRiskManagementTeam(openaiApiKey);
  }

  async analyzeStock(symbol: string): Promise<TradingAnalysisResult> {
    try {
      console.log(`开始分析股票: ${symbol}`);

      // 第一阶段：分析师团队并行分析
      console.log('📊 分析师团队开始并行分析...');
      const analystReports = await this.runAnalystTeam(symbol);
      console.log(`分析师团队完成分析，共生成 ${analystReports.length} 份报告`);

      // 第二阶段：研究员团队分析
      console.log('🔬 研究员团队开始分析...');
      const researcherReports = await this.runResearcherTeam(symbol, analystReports);
      console.log(`研究员团队完成分析，共生成 ${researcherReports.length} 份报告`);

      // 第三阶段：管理层制定投资建议
      console.log('👔 管理层制定投资建议...');
      const investmentRecommendation = await this.managementTeam.researchManager.manageResearch(
        symbol,
        analystReports,
        researcherReports
      );
      console.log('投资建议制定完成');

      // 第四阶段：风险管理团队评估
      console.log('⚠️ 风险管理团队开始评估...');
      const riskAssessments = await this.runRiskManagementTeam(investmentRecommendation);
      const finalRiskAssessment = await this.riskManagementTeam.riskManager.manageRisk(
        investmentRecommendation,
        riskAssessments
      );
      console.log('风险评估完成');

      // 第五阶段：交易员制定交易计划
      console.log('💼 交易员制定交易计划...');
      const tradingPlan = await this.managementTeam.trader.executeTrade(investmentRecommendation);
      console.log('交易计划制定完成');

      return {
        symbol,
        analystReports,
        researcherReports,
        investmentRecommendation,
        riskAssessments,
        finalRiskAssessment,
        tradingPlan,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`股票分析失败 ${symbol}:`, error);
      throw error;
    }
  }

  private async runAnalystTeam(symbol: string): Promise<AnalystReport[]> {
    // 并行执行所有分析师
    const analystPromises = [
      this.analystTeam.companyOverviewAnalyst.analyze(symbol),
      this.analystTeam.marketAnalyst.analyze(symbol),
      this.analystTeam.sentimentAnalyst.analyze(symbol),
      this.analystTeam.newsAnalyst.analyze(symbol),
      this.analystTeam.fundamentalsAnalyst.analyze(symbol),
      this.analystTeam.shareholderAnalyst.analyze(symbol),
      this.analystTeam.productAnalyst.analyze(symbol),
    ];

    const reports = await Promise.all(analystPromises);
    return reports;
  }

  private async runResearcherTeam(
    symbol: string,
    analystReports: AnalystReport[]
  ): Promise<ResearcherReport[]> {
    // 并行执行研究员
    const researcherPromises = [
      this.researcherTeam.bullResearcher.research(symbol, analystReports),
      this.researcherTeam.bearResearcher.research(symbol, analystReports),
    ];

    const reports = await Promise.all(researcherPromises);
    return reports;
  }

  private async runRiskManagementTeam(
    investmentRecommendation: InvestmentRecommendation
  ): Promise<RiskAssessment[]> {
    // 并行执行风险分析师
    const riskPromises = [
      this.riskManagementTeam.aggressiveRiskAnalyst.assessRisk(investmentRecommendation),
      this.riskManagementTeam.safeRiskAnalyst.assessRisk(investmentRecommendation),
      this.riskManagementTeam.neutralRiskAnalyst.assessRisk(investmentRecommendation),
    ];

    const assessments = await Promise.all(riskPromises);
    return assessments;
  }

  // 获取分析结果摘要
  getAnalysisSummary(result: TradingAnalysisResult): string {
    const { symbol, investmentRecommendation, finalRiskAssessment, tradingPlan } = result;

    return `
📈 股票分析结果摘要 - ${symbol}
=====================================

🎯 投资建议: ${this.getActionText(investmentRecommendation.action)}
📊 置信度: ${(investmentRecommendation.confidence * 100).toFixed(1)}%
💰 价格目标: ${investmentRecommendation.priceTarget || 'N/A'}
⏰ 时间框架: ${investmentRecommendation.timeHorizon}
⚠️ 风险等级: ${this.getRiskLevelText(finalRiskAssessment.overallRiskLevel)}

🔍 关键风险因素:
${finalRiskAssessment.keyRiskFactors.map((factor: string) => `• ${factor}`).join('\n')}

🛡️ 风险控制措施:
${finalRiskAssessment.riskControlMeasures.map((measure: string) => `• ${measure}`).join('\n')}

💼 交易策略:
${tradingPlan.strategy}

📋 执行计划:
${tradingPlan.executionPlan.map((plan: string) => `• ${plan}`).join('\n')}

⏰ 分析时间: ${new Date(result.timestamp).toLocaleString()}
`;
  }

  private getActionText(action: 'buy' | 'sell' | 'hold'): string {
    switch (action) {
      case 'buy': return '买入';
      case 'sell': return '卖出';
      case 'hold': return '持有';
      default: return '持有';
    }
  }

  private getRiskLevelText(riskLevel: 'low' | 'medium' | 'high' | 'very_high'): string {
    switch (riskLevel) {
      case 'low': return '低风险';
      case 'medium': return '中等风险';
      case 'high': return '高风险';
      case 'very_high': return '极高风险';
      default: return '中等风险';
    }
  }
}

// 交易分析结果类型
export interface TradingAnalysisResult {
  symbol: string;
  analystReports: AnalystReport[];
  researcherReports: ResearcherReport[];
  investmentRecommendation: InvestmentRecommendation;
  riskAssessments: RiskAssessment[];
  finalRiskAssessment: FinalRiskAssessment;
  tradingPlan: any; // TradingPlan 类型
  timestamp: string;
}
