import { Agent } from '../../core/Agent';
import { NewsItem, AnalystReport } from '../../types';
import { StockDataFetcher } from '../../utils/dataFetchers';

export class NewsAnalyst {
  private agent: Agent;
  private dataFetcher: StockDataFetcher;

  constructor(openaiApiKey: string, dataFetcher: StockDataFetcher) {
    this.dataFetcher = dataFetcher;
    this.agent = new Agent({
      name: 'NewsAnalyst',
      instructions: `你是一位专业的新闻分析师。你的职责是：

1. 分析公司公告、行业新闻和市场动态
2. 识别重要新闻事件和影响因子
3. 评估新闻对股价的潜在影响
4. 分析新闻的时间敏感性和重要性
5. 提供基于新闻分析的投资建议

请基于提供的新闻数据，进行深入的新闻分析，识别关键事件和投资机会。`,
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
      // 获取新闻数据
      const news = await this.dataFetcher.getNews(symbol, 15);

      // 构建分析提示
      const newsSummary = news.map((item, index) =>
        `${index + 1}. 标题: ${item.title}\n   内容: ${item.content}\n   来源: ${item.source}\n   时间: ${item.publishedAt}`
      ).join('\n\n');

      const prompt = `
请分析以下A股 ${symbol} 相关的新闻事件：

${newsSummary}

请从以下角度进行新闻分析：
1. 重要新闻事件识别
2. 新闻影响程度评估
3. 时间敏感性分析
4. 行业和市场影响
5. 投资机会识别
6. 风险提示

请提供详细的新闻分析报告，包括关键事件分析和投资建议。
`;

      const response = await this.agent.generate(prompt);

      return {
        analystType: 'NewsAnalyst',
        stockSymbol: symbol,
        analysis: response.text,
        confidence: 0.80,
        keyFindings: this.extractKeyFindings(response.text, news),
        recommendations: this.extractRecommendations(response.text),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`新闻分析失败 ${symbol}:`, error);
      throw error;
    }
  }

  private extractKeyFindings(analysis: string, news: NewsItem[]): string[] {
    const findings = [];

    // 基于新闻数量分析
    if (news.length > 10) {
      findings.push('新闻事件较多');
    } else if (news.length < 3) {
      findings.push('新闻事件较少');
    }

    // 基于分析内容提取关键发现
    if (analysis.includes('重大') || analysis.includes('重要')) {
      findings.push('存在重要新闻事件');
    }
    if (analysis.includes('利好') || analysis.includes('积极')) {
      findings.push('新闻偏向利好');
    }
    if (analysis.includes('利空') || analysis.includes('负面')) {
      findings.push('新闻偏向利空');
    }
    if (analysis.includes('政策') || analysis.includes('监管')) {
      findings.push('涉及政策监管');
    }
    if (analysis.includes('业绩') || analysis.includes('财报')) {
      findings.push('涉及业绩相关');
    }

    return findings;
  }

  private extractRecommendations(analysis: string): string[] {
    const recommendations = [];
    if (analysis.includes('买入') || analysis.includes('推荐')) recommendations.push('考虑买入');
    if (analysis.includes('卖出')) recommendations.push('考虑卖出');
    if (analysis.includes('持有')) recommendations.push('建议持有');
    if (analysis.includes('观望')) recommendations.push('建议观望');
    if (analysis.includes('关注')) recommendations.push('持续关注');
    return recommendations;
  }
}
