import { Agent } from '../../core/Agent';
import { RiskAssessment, InvestmentRecommendation } from '../../types';

export class AggressiveRiskAnalyst {
  private agent: Agent;

  constructor(openaiApiKey: string) {
    this.agent = new Agent({
      name: 'AggressiveRiskAnalyst',
      instructions: `你是一位激进的 risk 分析师。你的职责是：

1. 从激进投资角度评估风险收益比
2. 识别高风险高收益的投资机会
3. 分析市场波动和投机机会
4. 评估短期交易风险
5. 提供激进的风险管理策略

请基于提供的投资建议，从激进角度进行风险评估。`,
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
请基于以下投资建议，从激进投资角度进行风险评估：

投资建议：
- 股票代码: ${recommendation.stockSymbol}
- 操作建议: ${this.getActionText(recommendation.action)}
- 置信度: ${(recommendation.confidence * 100).toFixed(1)}%
- 投资理由: ${recommendation.reasoning}
- 价格目标: ${recommendation.priceTarget || 'N/A'}
- 时间框架: ${recommendation.timeHorizon}
- 风险等级: ${this.getRiskText(recommendation.riskLevel)}

请从激进投资角度进行以下分析：
1. 高风险高收益机会识别
2. 市场波动风险评估
3. 短期交易风险分析
4. 投机机会评估
5. 激进风险管理策略
6. 风险承受能力建议

请提供激进的风险评估报告。
`;

      const response = await this.agent.generate(prompt);

      return {
        riskType: 'aggressive',
        stockSymbol: recommendation.stockSymbol,
        riskLevel: this.extractRiskLevel(response.text),
        riskFactors: this.extractRiskFactors(response.text),
        mitigationStrategies: this.extractMitigationStrategies(response.text),
        confidence: this.calculateConfidence(recommendation),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`激进风险评估失败 ${recommendation.stockSymbol}:`, error);
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

    if (analysis.includes('市场波动')) {
      factors.push('市场波动风险');
    }
    if (analysis.includes('流动性')) {
      factors.push('流动性风险');
    }
    if (analysis.includes('政策')) {
      factors.push('政策风险');
    }
    if (analysis.includes('竞争')) {
      factors.push('竞争风险');
    }
    if (analysis.includes('财务')) {
      factors.push('财务风险');
    }
    if (analysis.includes('技术')) {
      factors.push('技术风险');
    }
    if (analysis.includes('操作')) {
      factors.push('操作风险');
    }

    return factors;
  }

  private extractMitigationStrategies(analysis: string): string[] {
    const strategies = [];

    if (analysis.includes('止损')) {
      strategies.push('设置严格止损');
    }
    if (analysis.includes('分批')) {
      strategies.push('分批建仓');
    }
    if (analysis.includes('监控')) {
      strategies.push('实时监控');
    }
    if (analysis.includes('对冲')) {
      strategies.push('风险对冲');
    }
    if (analysis.includes('减仓')) {
      strategies.push('及时减仓');
    }
    if (analysis.includes('止盈')) {
      strategies.push('快速止盈');
    }

    return strategies;
  }

  private calculateConfidence(recommendation: InvestmentRecommendation): number {
    // 激进风险分析师的置信度通常较高，因为他们更愿意承担风险
    return Math.min(recommendation.confidence + 0.1, 0.95);
  }
}
