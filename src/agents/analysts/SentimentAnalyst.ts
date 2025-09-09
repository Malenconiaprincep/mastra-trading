import { Agent } from '../../core/Agent';
import { NewsItem, AnalystReport } from '../../types';
import { StockDataFetcher } from '../../utils/dataFetchers';

export class SentimentAnalyst {
  private agent: Agent;
  private dataFetcher: StockDataFetcher;

  constructor(openaiApiKey: string, dataFetcher: StockDataFetcher) {
    this.dataFetcher = dataFetcher;
    this.agent = new Agent({
      name: 'SentimentAnalyst',
      instructions: `你是一位专业的市场情绪分析师。你的职责是：

1. 分析新闻、社交媒体和公告的情绪倾向
2. 评估市场对特定股票的整体情绪
3. 识别情绪变化趋势和转折点
4. 分析情绪对股价的潜在影响
5. 提供基于情绪分析的投资建议

请基于提供的新闻和公告数据，进行深入的情绪分析，识别市场情绪的关键驱动因素。`,
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
      const news = await this.dataFetcher.getNews(symbol, 20);

      // 构建分析提示
      const newsSummary = news.map((item, index) =>
        `${index + 1}. 标题: ${item.title}\n   内容: ${item.content}\n   来源: ${item.source}\n   时间: ${item.publishedAt}`
      ).join('\n\n');

      const prompt = `
请分析以下A股 ${symbol} 相关的新闻情绪：

${newsSummary}

请从以下角度进行情绪分析：
1. 整体情绪倾向（积极/消极/中性）
2. 关键情绪驱动因素
3. 情绪强度评估
4. 情绪变化趋势
5. 对股价的潜在影响
6. 情绪风险提示

请提供详细的市场情绪分析报告，包括具体的情绪指标和投资建议。
`;

      const response = await this.agent.generate(prompt);

      return {
        analystType: 'SentimentAnalyst',
        stockSymbol: symbol,
        analysis: response.text,
        confidence: 0.75,
        keyFindings: this.extractKeyFindings(response.text, news),
        recommendations: this.extractRecommendations(response.text),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`情绪分析失败 ${symbol}:`, error);
      throw error;
    }
  }

  private extractKeyFindings(analysis: string, news: NewsItem[]): string[] {
    const findings = [];

    // 基于新闻数量分析
    if (news.length > 15) {
      findings.push('新闻关注度较高');
    } else if (news.length < 5) {
      findings.push('新闻关注度较低');
    }

    // 基于分析内容提取关键发现
    if (analysis.includes('积极') || analysis.includes('乐观')) {
      findings.push('市场情绪偏向积极');
    }
    if (analysis.includes('消极') || analysis.includes('悲观')) {
      findings.push('市场情绪偏向消极');
    }
    if (analysis.includes('中性') || analysis.includes('平稳')) {
      findings.push('市场情绪相对中性');
    }
    if (analysis.includes('波动') || analysis.includes('变化')) {
      findings.push('情绪存在波动');
    }

    return findings;
  }

  private extractRecommendations(analysis: string): string[] {
    const recommendations = [];
    if (analysis.includes('买入') || analysis.includes('推荐')) recommendations.push('考虑买入');
    if (analysis.includes('卖出')) recommendations.push('考虑卖出');
    if (analysis.includes('持有')) recommendations.push('建议持有');
    if (analysis.includes('观望')) recommendations.push('建议观望');
    if (analysis.includes('谨慎')) recommendations.push('保持谨慎');
    return recommendations;
  }
}
