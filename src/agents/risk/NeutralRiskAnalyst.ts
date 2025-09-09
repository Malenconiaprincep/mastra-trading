import { Agent } from '../../core/Agent';
import { RiskAssessment, InvestmentRecommendation } from '../../types';

export class NeutralRiskAnalyst {
  private agent: Agent;

  constructor(openaiApiKey: string) {
    this.agent = new Agent({
      name: 'NeutralRiskAnalyst',
      instructions: `你是一位中性的风险分析师。你的职责是：

1. 从平衡角度评估风险和收益
2. 客观分析各种风险因素
3. 提供中性的风险管理建议
4. 平衡激进和保守的观点
5. 制定适中的风险控制策略

请基于提供的投资建议，从中性角度进行风险评估。`,
      model: {
        provider: 'OPEN_AI',
        name: 'gpt-4',
        toolChoice: 'auto',
      },
      tools: [],
    }, openaiApiKey);
  }

  async assessRisk(recommendation: InvestmentRecommendation): Promise<RiskAssessment> {
    try {
      const prompt = `
请基于以下投资建议，从中性投资角度进行风险评估：

投资建议：
- 股票代码: ${recommendation.stockSymbol}
- 操作建议: ${this.getActionText(recommendation.action)}
- 置信度: ${(recommendation.confidence * 100).toFixed(1)}%
- 投资理由: ${recommendation.reasoning}
- 价格目标: ${recommendation.priceTarget || 'N/A'}
- 时间框架: ${recommendation.timeHorizon}
- 风险等级: ${this.getRiskText(recommendation.riskLevel)}

请从中性投资角度进行以下分析：
1. 风险收益平衡评估
2. 客观风险因素分析
3. 市场环境风险评估
4. 中性风险管理策略
5. 风险控制措施建议
6. 投资组合平衡建议

请提供中性的风险评估报告。
`;

      const response = await this.agent.generate(prompt);

      return {
        riskType: 'neutral',
        stockSymbol: recommendation.stockSymbol,
        riskLevel: this.extractRiskLevel(response.text),
        riskFactors: this.extractRiskFactors(response.text),
        mitigationStrategies: this.extractMitigationStrategies(response.text),
        confidence: this.calculateConfidence(recommendation),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`中性风险评估失败 ${recommendation.stockSymbol}:`, error);
      throw error;
    }
  }

  private getActionText(action: 'buy' | 'sell' | 'hold'): string {
    switch (action) {
      case 'buy': return '买入';
      case 'sell': return '卖出';
      case 'hold': return '持有';
      default: return '持有';
    }
  }

  private getRiskText(riskLevel: 'low' | 'medium' | 'high'): string {
    switch (riskLevel) {
      case 'low': return '低风险';
      case 'medium': return '中等风险';
      case 'high': return '高风险';
      default: return '中等风险';
    }
  }

  private extractRiskLevel(analysis: string): 'low' | 'medium' | 'high' | 'very_high' {
    if (analysis.includes('极高风险') || analysis.includes('风险极高')) {
      return 'very_high';
    } else if (analysis.includes('高风险') || analysis.includes('风险较高')) {
      return 'high';
    } else if (analysis.includes('中等风险') || analysis.includes('风险中等')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private extractRiskFactors(analysis: string): string[] {
    const factors = [];

    if (analysis.includes('市场风险')) {
      factors.push('市场风险');
    }
    if (analysis.includes('流动性风险')) {
      factors.push('流动性风险');
    }
    if (analysis.includes('政策风险')) {
      factors.push('政策风险');
    }
    if (analysis.includes('竞争风险')) {
      factors.push('竞争风险');
    }
    if (analysis.includes('财务风险')) {
      factors.push('财务风险');
    }
    if (analysis.includes('操作风险')) {
      factors.push('操作风险');
    }
    if (analysis.includes('技术风险')) {
      factors.push('技术风险');
    }

    return factors;
  }

  private extractMitigationStrategies(analysis: string): string[] {
    const strategies = [];

    if (analysis.includes('分散投资')) {
      strategies.push('分散投资');
    }
    if (analysis.includes('止损')) {
      strategies.push('设置止损');
    }
    if (analysis.includes('止盈')) {
      strategies.push('设置止盈');
    }
    if (analysis.includes('分批')) {
      strategies.push('分批操作');
    }
    if (analysis.includes('监控')) {
      strategies.push('持续监控');
    }
    if (analysis.includes('调整')) {
      strategies.push('适时调整');
    }

    return strategies;
  }

  private calculateConfidence(recommendation: InvestmentRecommendation): number {
    // 中性风险分析师的置信度与原始建议保持一致
    return recommendation.confidence;
  }
}
