import { Agent } from '../../core/Agent';
import { ResearcherReport, AnalystReport } from '../../types';

export class BullResearcher {
  private agent: Agent;

  constructor(openaiApiKey: string) {
    this.agent = new Agent({
      name: 'BullResearcher',
      instructions: `你是一位专业的看涨研究员。你的职责是：

1. 从积极角度分析股票的投资价值
2. 识别和挖掘公司的增长潜力和投资机会
3. 分析支持股价上涨的驱动因素
4. 评估公司的竞争优势和发展前景
5. 提供看涨的投资论点和价格目标

请基于提供的分析师报告，从看涨角度进行深入研究，构建强有力的投资论点。`,
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
请基于以下分析师报告，从看涨角度深入研究A股 ${symbol}：

分析师报告汇总：
${reportsSummary}

请从看涨角度进行以下分析：
1. 核心投资论点构建
2. 增长驱动因素识别
3. 竞争优势分析
4. 市场机会评估
5. 风险因素分析
6. 价格目标设定
7. 投资时机建议

请提供详细的看涨研究报告，包括强有力的投资论点和具体的价格目标。
`;

      const response = await this.agent.generate(prompt);

      return {
        researcherType: 'bull',
        stockSymbol: symbol,
        thesis: response.text,
        supportingEvidence: this.extractSupportingEvidence(response.text, analystReports),
        risks: this.extractRisks(response.text),
        priceTarget: this.extractPriceTarget(response.text),
        confidence: this.calculateConfidence(analystReports),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`看涨研究失败 ${symbol}:`, error);
      throw error;
    }
  }

  private extractSupportingEvidence(analysis: string, analystReports: AnalystReport[]): string[] {
    const evidence = [];

    // 从分析师报告中提取积极证据
    analystReports.forEach(report => {
      if (report.recommendations.includes('考虑买入') || report.recommendations.includes('建议买入')) {
        evidence.push(`${report.analystType}支持买入`);
      }
      if (report.keyFindings.some(finding =>
        finding.includes('增长') || finding.includes('优势') || finding.includes('积极')
      )) {
        evidence.push(`${report.analystType}发现积极因素`);
      }
    });

    // 从分析内容中提取证据
    if (analysis.includes('增长') || analysis.includes('提升')) {
      evidence.push('业绩增长趋势明确');
    }
    if (analysis.includes('优势') || analysis.includes('领先')) {
      evidence.push('具备竞争优势');
    }
    if (analysis.includes('机会') || analysis.includes('潜力')) {
      evidence.push('存在投资机会');
    }
    if (analysis.includes('创新') || analysis.includes('技术')) {
      evidence.push('创新能力突出');
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
      risks.push('市场竞争风险');
    }
    if (analysis.includes('财务风险')) {
      risks.push('财务风险');
    }
    if (analysis.includes('流动性风险')) {
      risks.push('流动性风险');
    }

    return risks;
  }

  private extractPriceTarget(analysis: string): number | undefined {
    // 简单的价格目标提取，实际应用中可以使用更复杂的NLP技术
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

    // 看涨研究员的置信度通常比平均置信度稍高
    return Math.min(avgConfidence + 0.1, 1.0);
  }
}
