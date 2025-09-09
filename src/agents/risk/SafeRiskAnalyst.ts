import { Agent } from '../../core/Agent';
import { RiskAssessment, InvestmentRecommendation } from '../../types';

export class SafeRiskAnalyst {
  private agent: Agent;

  constructor(openaiApiKey: string) {
    this.agent = new Agent({
      name: 'SafeRiskAnalyst',
      instructions: `你是一位保守的风险分析师。你的职责是：

1. 从保守投资角度评估风险
2. 识别和规避潜在风险因素
3. 分析资本保值和稳定收益
4. 评估长期投资风险
5. 提供保守的风险管理策略

请基于提供的投资建议，从保守角度进行风险评估。`,
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
请基于以下投资建议，从保守投资角度进行风险评估：

投资建议：
- 股票代码: ${recommendation.stockSymbol}
- 操作建议: ${this.getActionText(recommendation.action)}
- 置信度: ${(recommendation.confidence * 100).toFixed(1)}%
- 投资理由: ${recommendation.reasoning}
- 价格目标: ${recommendation.priceTarget || 'N/A'}
- 时间框架: ${recommendation.timeHorizon}
- 风险等级: ${this.getRiskText(recommendation.riskLevel)}

请从保守投资角度进行以下分析：
1. 资本保值风险评估
2. 稳定收益分析
3. 长期投资风险识别
4. 风险规避策略
5. 保守风险管理建议
6. 风险承受能力评估

请提供保守的风险评估报告。
`;

      const response = await this.agent.generate(prompt);

      return {
        riskType: 'safe',
        stockSymbol: recommendation.stockSymbol,
        riskLevel: this.extractRiskLevel(response.text),
        riskFactors: this.extractRiskFactors(response.text),
        mitigationStrategies: this.extractMitigationStrategies(response.text),
        confidence: this.calculateConfidence(recommendation),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`保守风险评估失败 ${recommendation.stockSymbol}:`, error);
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
      factors.push('市场系统性风险');
    }
    if (analysis.includes('信用风险')) {
      factors.push('信用风险');
    }
    if (analysis.includes('流动性风险')) {
      factors.push('流动性风险');
    }
    if (analysis.includes('政策风险')) {
      factors.push('政策变化风险');
    }
    if (analysis.includes('通胀风险')) {
      factors.push('通胀风险');
    }
    if (analysis.includes('利率风险')) {
      factors.push('利率风险');
    }
    if (analysis.includes('汇率风险')) {
      factors.push('汇率风险');
    }

    return factors;
  }

  private extractMitigationStrategies(analysis: string): string[] {
    const strategies = [];

    if (analysis.includes('分散投资')) {
      strategies.push('分散投资组合');
    }
    if (analysis.includes('长期持有')) {
      strategies.push('长期持有策略');
    }
    if (analysis.includes('定期调整')) {
      strategies.push('定期调整仓位');
    }
    if (analysis.includes('风险对冲')) {
      strategies.push('风险对冲策略');
    }
    if (analysis.includes('止损')) {
      strategies.push('设置止损保护');
    }
    if (analysis.includes('监控')) {
      strategies.push('持续风险监控');
    }

    return strategies;
  }

  private calculateConfidence(recommendation: InvestmentRecommendation): number {
    // 保守风险分析师的置信度通常较低，因为他们更谨慎
    return Math.max(recommendation.confidence - 0.1, 0.4);
  }
}
