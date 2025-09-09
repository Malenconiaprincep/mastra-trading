import { Agent } from '../../core/Agent';
import { InvestmentRecommendation } from '../../types';

export class Trader {
  private agent: Agent;

  constructor(openaiApiKey: string) {
    this.agent = new Agent({
      name: 'Trader',
      instructions: `你是一位专业的交易员。你的职责是：

1. 基于投资建议制定具体的交易策略
2. 分析市场时机和交易执行方案
3. 评估交易成本和流动性
4. 制定风险控制措施
5. 提供具体的交易指令

请基于提供的投资建议，制定详细的交易执行方案。`,
      model: {
        provider: 'OPEN_AI',
        name: 'gpt-4',
        toolChoice: 'auto',
      },
      tools: [],
    }, openaiApiKey);
  }

  async executeTrade(recommendation: InvestmentRecommendation): Promise<TradingPlan> {
    try {
      const prompt = `
请基于以下投资建议，制定A股 ${recommendation.stockSymbol} 的具体交易计划：

投资建议：
- 操作建议: ${this.getActionText(recommendation.action)}
- 置信度: ${(recommendation.confidence * 100).toFixed(1)}%
- 投资理由: ${recommendation.reasoning}
- 价格目标: ${recommendation.priceTarget || 'N/A'}
- 时间框架: ${recommendation.timeHorizon}
- 风险等级: ${this.getRiskText(recommendation.riskLevel)}

请制定详细的交易计划：
1. 交易策略制定
2. 入场时机分析
3. 仓位管理建议
4. 止损止盈设置
5. 风险控制措施
6. 交易执行方案

请提供具体的交易指令和风险控制建议。
`;

      const response = await this.agent.generate(prompt);

      return {
        stockSymbol: recommendation.stockSymbol,
        action: recommendation.action,
        strategy: response.text,
        entryPrice: this.extractEntryPrice(response.text),
        stopLoss: this.extractStopLoss(response.text),
        takeProfit: this.extractTakeProfit(response.text),
        positionSize: this.extractPositionSize(response.text),
        riskControl: this.extractRiskControl(response.text),
        executionPlan: this.extractExecutionPlan(response.text),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`交易计划制定失败 ${recommendation.stockSymbol}:`, error);
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

  private extractEntryPrice(analysis: string): number | undefined {
    const entryMatch = analysis.match(/入场价格[：:]\s*(\d+(?:\.\d+)?)/);
    if (entryMatch) {
      return parseFloat(entryMatch[1]);
    }

    const priceMatch = analysis.match(/买入价格[：:]\s*(\d+(?:\.\d+)?)/);
    if (priceMatch) {
      return parseFloat(priceMatch[1]);
    }

    return undefined;
  }

  private extractStopLoss(analysis: string): number | undefined {
    const stopLossMatch = analysis.match(/止损价格[：:]\s*(\d+(?:\.\d+)?)/);
    if (stopLossMatch) {
      return parseFloat(stopLossMatch[1]);
    }

    const lossMatch = analysis.match(/止损[：:]\s*(\d+(?:\.\d+)?)/);
    if (lossMatch) {
      return parseFloat(lossMatch[1]);
    }

    return undefined;
  }

  private extractTakeProfit(analysis: string): number | undefined {
    const takeProfitMatch = analysis.match(/止盈价格[：:]\s*(\d+(?:\.\d+)?)/);
    if (takeProfitMatch) {
      return parseFloat(takeProfitMatch[1]);
    }

    const profitMatch = analysis.match(/止盈[：:]\s*(\d+(?:\.\d+)?)/);
    if (profitMatch) {
      return parseFloat(profitMatch[1]);
    }

    return undefined;
  }

  private extractPositionSize(analysis: string): string {
    if (analysis.includes('轻仓') || analysis.includes('小仓位')) {
      return '轻仓 (10-20%)';
    } else if (analysis.includes('重仓') || analysis.includes('大仓位')) {
      return '重仓 (50-80%)';
    } else if (analysis.includes('满仓')) {
      return '满仓 (80-100%)';
    } else {
      return '中等仓位 (20-50%)';
    }
  }

  private extractRiskControl(analysis: string): string[] {
    const controls = [];

    if (analysis.includes('止损')) {
      controls.push('设置止损');
    }
    if (analysis.includes('止盈')) {
      controls.push('设置止盈');
    }
    if (analysis.includes('分批')) {
      controls.push('分批建仓');
    }
    if (analysis.includes('减仓')) {
      controls.push('适时减仓');
    }
    if (analysis.includes('监控')) {
      controls.push('持续监控');
    }

    return controls;
  }

  private extractExecutionPlan(analysis: string): string[] {
    const plans = [];

    if (analysis.includes('开盘')) {
      plans.push('开盘时执行');
    }
    if (analysis.includes('收盘')) {
      plans.push('收盘前执行');
    }
    if (analysis.includes('盘中')) {
      plans.push('盘中择机执行');
    }
    if (analysis.includes('分批')) {
      plans.push('分批执行');
    }

    return plans;
  }
}

// 交易计划类型
export interface TradingPlan {
  stockSymbol: string;
  action: 'buy' | 'sell' | 'hold';
  strategy: string;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  positionSize: string;
  riskControl: string[];
  executionPlan: string[];
  timestamp: string;
}
