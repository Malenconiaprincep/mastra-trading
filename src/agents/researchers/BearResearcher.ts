import { Agent } from '../../core/Agent';
import { ResearcherReport, AnalystReport } from '../../types';

export class BearResearcher {
  private agent: Agent;

  constructor(openaiApiKey: string) {
    this.agent = new Agent({
      name: 'BearResearcher',
      instructions: `你是一位专业的看跌研究员。你的职责是：

1. 从谨慎角度分析股票的投资风险
2. 识别和评估公司的潜在问题和挑战
3. 分析可能导致股价下跌的风险因素
4. 评估公司的竞争劣势和经营风险
5. 提供看跌的投资论点和风险提示

请基于提供的分析师报告，从看跌角度进行深入研究，构建谨慎的投资观点。`,
      model: {
        provider: 'OPEN_AI',
        name: 'gpt-4',
        toolChoice: 'auto',
      },
      tools: [],
    }, openaiApiKey);
  }

  async research(symbol: string, analystReports: AnalystReport[]): Promise<ResearcherReport> {
    try {
      // 构建分析提示
      const reportsSummary = analystReports.map((report, index) =>
        `${index + 1}. ${report.analystType}:\n   ${report.analysis}\n   关键发现: ${report.keyFindings.join(', ')}\n   建议: ${report.recommendations.join(', ')}`
      ).join('\n\n');

      const prompt = `
请基于以下分析师报告，从看跌角度深入研究A股 ${symbol}：

分析师报告汇总：
${reportsSummary}

请从看跌角度进行以下分析：
1. 核心风险论点构建
2. 风险因素识别和评估
3. 竞争劣势分析
4. 市场挑战评估
5. 经营风险分析
6. 估值风险提示
7. 投资建议

请提供详细的看跌研究报告，包括风险分析和谨慎的投资建议。
`;

      const response = await this.agent.generate(prompt);

      return {
        researcherType: 'bear',
        stockSymbol: symbol,
        thesis: response.text,
        supportingEvidence: this.extractSupportingEvidence(response.text, analystReports),
        risks: this.extractRisks(response.text),
        priceTarget: this.extractPriceTarget(response.text),
        confidence: this.calculateConfidence(analystReports),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`看跌研究失败 ${symbol}:`, error);
      throw error;
    }
  }

  private extractSupportingEvidence(analysis: string, analystReports: AnalystReport[]): string[] {
    const evidence = [];

    // 从分析师报告中提取风险证据
    analystReports.forEach(report => {
      if (report.recommendations.includes('考虑卖出') || report.recommendations.includes('建议卖出')) {
        evidence.push(`${report.analystType}建议卖出`);
      }
      if (report.keyFindings.some(finding =>
        finding.includes('风险') || finding.includes('挑战') || finding.includes('问题')
      )) {
        evidence.push(`${report.analystType}发现风险因素`);
      }
    });

    // 从分析内容中提取证据
    if (analysis.includes('风险') || analysis.includes('挑战')) {
      evidence.push('存在多重风险因素');
    }
    if (analysis.includes('竞争') || analysis.includes('劣势')) {
      evidence.push('面临竞争压力');
    }
    if (analysis.includes('估值') || analysis.includes('高估')) {
      evidence.push('估值存在风险');
    }
    if (analysis.includes('政策') || analysis.includes('监管')) {
      evidence.push('政策风险较大');
    }

    return evidence;
  }

  private extractRisks(analysis: string): string[] {
    const risks = [];

    if (analysis.includes('市场风险')) {
      risks.push('市场波动风险');
    }
    if (analysis.includes('政策风险')) {
      risks.push('政策变化风险');
    }
    if (analysis.includes('竞争风险')) {
      risks.push('市场竞争加剧');
    }
    if (analysis.includes('财务风险')) {
      risks.push('财务状况恶化');
    }
    if (analysis.includes('流动性风险')) {
      risks.push('流动性不足');
    }
    if (analysis.includes('经营风险')) {
      risks.push('经营风险上升');
    }
    if (analysis.includes('估值风险')) {
      risks.push('估值过高风险');
    }

    return risks;
  }

  private extractPriceTarget(analysis: string): number | undefined {
    // 简单的价格目标提取
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

  private calculateConfidence(analystReports: AnalystReport[]): number {
    // 基于分析师报告的置信度计算整体置信度
    const avgConfidence = analystReports.reduce((sum, report) => sum + report.confidence, 0) / analystReports.length;

    // 看跌研究员的置信度通常比平均置信度稍低，因为风险分析需要更谨慎
    return Math.max(avgConfidence - 0.05, 0.3);
  }
}
