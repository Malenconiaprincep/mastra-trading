import { Agent } from '../../core/Agent';
import { MarketData, AnalystReport } from '../../types';
import { StockDataFetcher } from '../../utils/dataFetchers';

export class MarketAnalyst {
  private agent: Agent;
  private dataFetcher: StockDataFetcher;

  constructor(openaiApiKey: string, dataFetcher: StockDataFetcher) {
    this.dataFetcher = dataFetcher;
    this.agent = new Agent({
      name: 'MarketAnalyst',
      instructions: `你是一位专业的市场分析师。你的职责是：

1. 分析股票的技术指标和价格走势
2. 评估市场情绪和交易量变化
3. 识别支撑位和阻力位
4. 分析市场趋势和动量
5. 提供短期和中期价格预测

请基于技术分析和市场数据提供专业的市场分析报告。`,
      model: {
        provider: 'OPEN_AI',
        name: 'gpt-4',
        toolChoice: 'auto',
      },
      tools: [],
    }, openaiApiKey);
  }

  async analyze(symbol: string): Promise<AnalystReport> {
    try {
      // 获取市场数据
      const marketData = await this.dataFetcher.getMarketData(symbol);

      // 构建分析提示
      const prompt = `
请分析以下股票的市场数据：

股票代码: ${symbol}
当前价格: $${marketData.price}
价格变化: $${marketData.change} (${marketData.changePercent}%)
交易量: ${marketData.volume.toLocaleString()}
市值: ${marketData.marketCap ? `$${marketData.marketCap.toLocaleString()}` : 'N/A'}
市盈率: ${marketData.pe || 'N/A'}
每股收益: ${marketData.eps || 'N/A'}
股息收益率: ${marketData.dividend ? `${marketData.dividend}%` : 'N/A'}

请从以下角度进行分析：
1. 技术指标分析
2. 价格趋势评估
3. 交易量分析
4. 市场情绪判断
5. 短期价格预测
6. 投资时机建议

请提供详细的市场分析报告。
`;

      const response = await this.agent.generate(prompt);

      return {
        analystType: 'MarketAnalyst',
        stockSymbol: symbol,
        analysis: response.text,
        confidence: 0.80,
        keyFindings: this.extractKeyFindings(response.text, marketData),
        recommendations: this.extractRecommendations(response.text),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`市场分析失败 ${symbol}:`, error);
      throw error;
    }
  }

  private extractKeyFindings(analysis: string, marketData: MarketData): string[] {
    const findings = [];

    // 基于价格变化分析
    if (marketData.changePercent > 2) {
      findings.push('股价大幅上涨');
    } else if (marketData.changePercent < -2) {
      findings.push('股价大幅下跌');
    } else {
      findings.push('股价相对稳定');
    }

    // 基于交易量分析
    if (marketData.volume > 1000000) {
      findings.push('交易量活跃');
    } else {
      findings.push('交易量一般');
    }

    // 基于市盈率分析
    if (marketData.pe && marketData.pe < 15) {
      findings.push('估值相对较低');
    } else if (marketData.pe && marketData.pe > 25) {
      findings.push('估值相对较高');
    }

    return findings;
  }

  private extractRecommendations(analysis: string): string[] {
    const recommendations = [];
    if (analysis.includes('买入') || analysis.includes('推荐')) recommendations.push('考虑买入');
    if (analysis.includes('卖出')) recommendations.push('考虑卖出');
    if (analysis.includes('持有')) recommendations.push('建议持有');
    if (analysis.includes('观望')) recommendations.push('建议观望');
    return recommendations;
  }
}
