import { Agent } from '../../core/Agent';
import { RiskAssessment, InvestmentRecommendation } from '../../types';

export class RiskManager {
  private agent: Agent;

  constructor(openaiApiKey: string) {
    this.agent = new Agent({
      name: 'RiskManager',
      instructions: `你是一位专业的风险经理。你的职责是：

1. 整合所有风险评估结果
2. 制定综合风险管理策略
3. 协调不同风险观点
4. 制定最终风险控制措施
5. 管理整体投资组合风险

请基于提供的风险评估结果，制定综合的风险管理方案。`,
      model: {
        provider: 'OPEN_AI',
        name: 'gpt-4',
        toolChoice: 'auto',
      },
      tools: [],
    }, openaiApiKey);
  }

  async manageRisk(
    recommendation: InvestmentRecommendation,
    riskAssessments: RiskAssessment[]
  ): Promise<FinalRiskAssessment> {
    try {
      // 构建分析提示
      const riskSummary = riskAssessments.map((assessment, index) =>
        `${index + 1}. ${this.getRiskTypeText(assessment.riskType)} (风险等级: ${this.getRiskLevelText(assessment.riskLevel)}):\n   ${assessment.riskFactors.join(', ')}\n   缓解策略: ${assessment.mitigationStrategies.join(', ')}`
      ).join('\n\n');

      const prompt = `
请基于以下投资建议和风险评估结果，制定综合的风险管理方案：

投资建议：
- 股票代码: ${recommendation.stockSymbol}
- 操作建议: ${this.getActionText(recommendation.action)}
- 置信度: ${(recommendation.confidence * 100).toFixed(1)}%
- 投资理由: ${recommendation.reasoning}
- 价格目标: ${recommendation.priceTarget || 'N/A'}
- 时间框架: ${recommendation.timeHorizon}
- 风险等级: ${this.getRiskText(recommendation.riskLevel)}

风险评估结果：
${riskSummary}

请制定综合的风险管理方案：
1. 整体风险评估
2. 关键风险因素识别
3. 风险控制措施制定
4. 风险监控方案
5. 应急预案制定
6. 最终投资建议

请提供详细的风险管理方案。
`;

      const response = await this.agent.generate(prompt);

      return {
        stockSymbol: recommendation.stockSymbol,
        overallRiskLevel: this.extractOverallRiskLevel(response.text),
        keyRiskFactors: this.extractKeyRiskFactors(response.text),
        riskControlMeasures: this.extractRiskControlMeasures(response.text),
        monitoringPlan: this.extractMonitoringPlan(response.text),
        emergencyPlan: this.extractEmergencyPlan(response.text),
        finalRecommendation: this.extractFinalRecommendation(response.text),
        confidence: this.calculateOverallConfidence(riskAssessments),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`风险管理失败 ${recommendation.stockSymbol}:`, error);
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

  private getRiskTypeText(riskType: 'aggressive' | 'safe' | 'neutral'): string {
    switch (riskType) {
      case 'aggressive': return '激进风险评估';
      case 'safe': return '保守风险评估';
      case 'neutral': return '中性风险评估';
      default: return '风险评估';
    }
  }

  private getRiskLevelText(riskLevel: 'low' | 'medium' | 'high' | 'very_high'): string {
    switch (riskLevel) {
      case 'low': return '低';
      case 'medium': return '中等';
      case 'high': return '高';
      case 'very_high': return '极高';
      default: return '中等';
    }
  }

  private extractOverallRiskLevel(analysis: string): 'low' | 'medium' | 'high' | 'very_high' {
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

  private extractKeyRiskFactors(analysis: string): string[] {
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

    return factors;
  }

  private extractRiskControlMeasures(analysis: string): string[] {
    const measures = [];

    if (analysis.includes('止损')) {
      measures.push('设置止损');
    }
    if (analysis.includes('止盈')) {
      measures.push('设置止盈');
    }
    if (analysis.includes('分散投资')) {
      measures.push('分散投资');
    }
    if (analysis.includes('分批操作')) {
      measures.push('分批操作');
    }
    if (analysis.includes('风险对冲')) {
      measures.push('风险对冲');
    }
    if (analysis.includes('仓位控制')) {
      measures.push('仓位控制');
    }

    return measures;
  }

  private extractMonitoringPlan(analysis: string): string[] {
    const plans = [];

    if (analysis.includes('实时监控')) {
      plans.push('实时监控');
    }
    if (analysis.includes('定期评估')) {
      plans.push('定期评估');
    }
    if (analysis.includes('风险预警')) {
      plans.push('风险预警');
    }
    if (analysis.includes('动态调整')) {
      plans.push('动态调整');
    }

    return plans;
  }

  private extractEmergencyPlan(analysis: string): string[] {
    const plans = [];

    if (analysis.includes('紧急止损')) {
      plans.push('紧急止损');
    }
    if (analysis.includes('快速减仓')) {
      plans.push('快速减仓');
    }
    if (analysis.includes('风险隔离')) {
      plans.push('风险隔离');
    }
    if (analysis.includes('应急资金')) {
      plans.push('应急资金');
    }

    return plans;
  }

  private extractFinalRecommendation(analysis: string): string {
    if (analysis.includes('建议买入') || analysis.includes('推荐买入')) {
      return '建议买入';
    } else if (analysis.includes('建议卖出') || analysis.includes('推荐卖出')) {
      return '建议卖出';
    } else if (analysis.includes('建议持有') || analysis.includes('推荐持有')) {
      return '建议持有';
    } else {
      return '建议观望';
    }
  }

  private calculateOverallConfidence(riskAssessments: RiskAssessment[]): number {
    const avgConfidence = riskAssessments.reduce((sum, assessment) => sum + assessment.confidence, 0) / riskAssessments.length;
    return Math.min(avgConfidence, 0.95);
  }
}

// 最终风险评估类型
export interface FinalRiskAssessment {
  stockSymbol: string;
  overallRiskLevel: 'low' | 'medium' | 'high' | 'very_high';
  keyRiskFactors: string[];
  riskControlMeasures: string[];
  monitoringPlan: string[];
  emergencyPlan: string[];
  finalRecommendation: string;
  confidence: number;
  timestamp: string;
}
