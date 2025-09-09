import { Agent } from '../../core/Agent';
import { AnalystReport, ResearcherReport, InvestmentRecommendation } from '../../types';

export class ResearchManager {
  private agent: Agent;

  constructor(openaiApiKey: string) {
    this.agent = new Agent({
      name: 'ResearchManager',
      instructions: `你是一位专业的研究经理。你的职责是：

1. 整合和分析所有分析师和研究员的工作成果
2. 协调不同观点，形成综合的投资建议
3. 评估研究质量和可靠性
4. 制定最终的投资决策建议
5. 管理研究团队的工作流程

请基于提供的分析师报告和研究员报告，进行综合分析和决策制定。`,
      model: {
        provider: 'OPEN_AI',
        name: 'gpt-4',
        toolChoice: 'auto',
      },
      tools: [],
    }, openaiApiKey);
  }

  async manageResearch(
    symbol: string,
    analystReports: AnalystReport[],
    researcherReports: ResearcherReport[]
  ): Promise<InvestmentRecommendation> {
    try {
      // 构建分析提示
      const analystSummary = analystReports.map((report, index) =>
        `${index + 1}. ${report.analystType} (置信度: ${(report.confidence * 100).toFixed(1)}%):\n   ${report.analysis}\n   关键发现: ${report.keyFindings.join(', ')}\n   建议: ${report.recommendations.join(', ')}`
      ).join('\n\n');

      const researcherSummary = researcherReports.map((report, index) =>
        `${index + 1}. ${report.researcherType === 'bull' ? '看涨研究员' : '看跌研究员'} (置信度: ${(report.confidence * 100).toFixed(1)}%):\n   ${report.thesis}\n   支持证据: ${report.supportingEvidence.join(', ')}\n   风险因素: ${report.risks.join(', ')}\n   价格目标: ${report.priceTarget || 'N/A'}`
      ).join('\n\n');

      const prompt = `
请基于以下研究团队的工作成果，制定A股 ${symbol} 的最终投资建议：

分析师团队报告：
${analystSummary}

研究员团队报告：
${researcherSummary}

请从研究经理的角度进行以下分析：
1. 综合评估所有研究结果
2. 识别关键投资论点和风险因素
3. 权衡看涨和看跌观点
4. 制定最终投资建议
5. 设定价格目标和时间框架
6. 评估投资风险等级

请提供详细的投资建议，包括具体的操作建议和风险提示。
`;

      const response = await this.agent.generate(prompt);

      return {
        stockSymbol: symbol,
        action: this.extractAction(response.text),
        confidence: this.calculateOverallConfidence(analystReports, researcherReports),
        reasoning: response.text,
        priceTarget: this.extractPriceTarget(response.text),
        timeHorizon: this.extractTimeHorizon(response.text),
        riskLevel: this.extractRiskLevel(response.text),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`研究管理失败 ${symbol}:`, error);
      throw error;
    }
  }

  private extractAction(analysis: string): 'buy' | 'sell' | 'hold' {
    if (analysis.includes('买入') || analysis.includes('推荐买入') || analysis.includes('建议买入')) {
      return 'buy';
    } else if (analysis.includes('卖出') || analysis.includes('推荐卖出') || analysis.includes('建议卖出')) {
      return 'sell';
    } else {
      return 'hold';
    }
  }

  private extractPriceTarget(analysis: string): number | undefined {
    const priceMatch = analysis.match(/价格目标[：:]\s*(\d+(?:\.\d+)?)/);
    if (priceMatch) {
      return parseFloat(priceMatch[1]);
    }

    const targetMatch = analysis.match(/目标价[：:]\s*(\d+(?:\.\d+)?)/);
    if (targetMatch) {
      return parseFloat(targetMatch[1]);
    }

    return undefined;
  }

  private extractTimeHorizon(analysis: string): string {
    if (analysis.includes('短期') || analysis.includes('1-3个月')) {
      return '短期 (1-3个月)';
    } else if (analysis.includes('中期') || analysis.includes('3-12个月')) {
      return '中期 (3-12个月)';
    } else if (analysis.includes('长期') || analysis.includes('1年以上')) {
      return '长期 (1年以上)';
    } else {
      return '中期 (3-12个月)';
    }
  }

  private extractRiskLevel(analysis: string): 'low' | 'medium' | 'high' {
    if (analysis.includes('高风险') || analysis.includes('风险较高')) {
      return 'high';
    } else if (analysis.includes('低风险') || analysis.includes('风险较低')) {
      return 'low';
    } else {
      return 'medium';
    }
  }

  private calculateOverallConfidence(
    analystReports: AnalystReport[],
    researcherReports: ResearcherReport[]
  ): number {
    const allReports = [...analystReports, ...researcherReports];
    const avgConfidence = allReports.reduce((sum, report) => sum + report.confidence, 0) / allReports.length;

    // 研究经理的置信度基于所有报告的加权平均
    return Math.min(avgConfidence, 0.95);
  }
}
