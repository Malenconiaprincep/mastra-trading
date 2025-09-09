import { Agent } from '../../core/Agent';
import { Fundamentals, AnalystReport } from '../../types';
import { StockDataFetcher } from '../../utils/dataFetchers';

export class FundamentalsAnalyst {
  private agent: Agent;
  private dataFetcher: StockDataFetcher;

  constructor(openaiApiKey: string, dataFetcher: StockDataFetcher) {
    this.dataFetcher = dataFetcher;
    this.agent = new Agent({
      name: 'FundamentalsAnalyst',
      instructions: `你是一位专业的基本面分析师。你的职责是：

1. 分析公司财务报表和经营数据
2. 评估公司的盈利能力、成长性和财务健康度
3. 计算和分析关键财务比率
4. 比较同行业公司的财务表现
5. 评估公司的内在价值和投资价值

请基于提供的财务数据，进行深入的基本面分析，评估公司的投资价值。`,
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
      // 获取基本面数据
      const fundamentals = await this.dataFetcher.getFundamentals(symbol);

      // 构建分析提示
      const prompt = `
请分析以下A股 ${symbol} 的基本面数据：

财务数据：
- 营业收入: ${fundamentals.revenue ? `${(fundamentals.revenue / 100000000).toFixed(2)}亿元` : 'N/A'}
- 净利润: ${fundamentals.netIncome ? `${(fundamentals.netIncome / 100000000).toFixed(2)}亿元` : 'N/A'}
- 总资产: ${fundamentals.totalAssets ? `${(fundamentals.totalAssets / 100000000).toFixed(2)}亿元` : 'N/A'}
- 总负债: ${fundamentals.totalDebt ? `${(fundamentals.totalDebt / 100000000).toFixed(2)}亿元` : 'N/A'}
- 现金流: ${fundamentals.cashFlow ? `${(fundamentals.cashFlow / 100000000).toFixed(2)}亿元` : 'N/A'}
- 净资产收益率(ROE): ${fundamentals.roe ? `${fundamentals.roe.toFixed(2)}%` : 'N/A'}
- 总资产收益率(ROA): ${fundamentals.roa ? `${fundamentals.roa.toFixed(2)}%` : 'N/A'}
- 资产负债率: ${fundamentals.debtToEquity ? `${fundamentals.debtToEquity.toFixed(2)}` : 'N/A'}

请从以下角度进行基本面分析：
1. 盈利能力分析
2. 成长性评估
3. 财务健康度评估
4. 运营效率分析
5. 估值水平评估
6. 投资价值判断

请提供详细的基本面分析报告，包括财务比率分析和投资建议。
`;

      const response = await this.agent.generate(prompt);

      return {
        analystType: 'FundamentalsAnalyst',
        stockSymbol: symbol,
        analysis: response.text,
        confidence: 0.85,
        keyFindings: this.extractKeyFindings(response.text, fundamentals),
        recommendations: this.extractRecommendations(response.text),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`基本面分析失败 ${symbol}:`, error);
      throw error;
    }
  }

  private extractKeyFindings(analysis: string, fundamentals: Fundamentals): string[] {
    const findings = [];

    // 基于财务数据提取关键发现
    if (fundamentals.revenue && fundamentals.revenue > 1000000000) {
      findings.push('营业收入规模较大');
    }
    if (fundamentals.netIncome && fundamentals.netIncome > 0) {
      findings.push('实现盈利');
    } else if (fundamentals.netIncome && fundamentals.netIncome < 0) {
      findings.push('出现亏损');
    }
    if (fundamentals.roe && fundamentals.roe > 15) {
      findings.push('ROE表现优秀');
    } else if (fundamentals.roe && fundamentals.roe < 5) {
      findings.push('ROE表现较差');
    }
    if (fundamentals.debtToEquity && fundamentals.debtToEquity > 1) {
      findings.push('负债率较高');
    } else if (fundamentals.debtToEquity && fundamentals.debtToEquity < 0.5) {
      findings.push('负债率较低');
    }

    // 基于分析内容提取关键发现
    if (analysis.includes('增长') || analysis.includes('提升')) {
      findings.push('业绩呈现增长趋势');
    }
    if (analysis.includes('稳定') || analysis.includes('稳健')) {
      findings.push('财务状况稳定');
    }
    if (analysis.includes('改善') || analysis.includes('优化')) {
      findings.push('财务指标改善');
    }

    return findings;
  }

  private extractRecommendations(analysis: string): string[] {
    const recommendations = [];
    if (analysis.includes('买入') || analysis.includes('推荐')) recommendations.push('考虑买入');
    if (analysis.includes('卖出')) recommendations.push('考虑卖出');
    if (analysis.includes('持有')) recommendations.push('建议持有');
    if (analysis.includes('观望')) recommendations.push('建议观望');
    if (analysis.includes('长期')) recommendations.push('适合长期投资');
    return recommendations;
  }
}
