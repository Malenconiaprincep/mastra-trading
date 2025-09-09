import { AgentFactory, UnifiedAgent, UnifiedAgentConfig } from '../../core/AgentFactory';
import { CompanyOverview, AnalystReport } from '../../types';
import { StockDataFetcher } from '../../utils/dataFetchers';

export class CompanyOverviewAnalyst {
  private agent: UnifiedAgent;
  private dataFetcher: StockDataFetcher;

  constructor(provider: 'openai' | 'qwen', apiKey: string, dataFetcher: StockDataFetcher) {
    this.dataFetcher = dataFetcher;

    const config: UnifiedAgentConfig = {
      name: 'CompanyOverviewAnalyst',
      instructions: `你是一位专业的公司概述分析师。你的职责是：

1. 分析公司的基本信息、业务模式和发展历程
2. 评估公司的市场地位和竞争优势
3. 识别公司的核心业务和主要产品线
4. 分析公司的管理团队和企业文化
5. 评估公司的长期发展前景

请基于提供的数据进行深入分析，并提供专业的见解和建议。`,
      model: {
        provider,
        name: provider === 'openai' ? 'gpt-4' : 'qwen-plus',
        toolChoice: 'auto',
      },
      tools: [],
    };

    this.agent = AgentFactory.createAgent(config, apiKey);
  }

  async analyze(symbol: string): Promise<AnalystReport> {
    try {
      // 获取公司基本信息
      const stockInfo = await this.dataFetcher.getStockInfo(symbol);

      // 构建分析提示
      const prompt = `
请分析以下公司的概述信息：

股票代码: ${stockInfo.symbol}
公司名称: ${stockInfo.name}
交易所: ${stockInfo.exchange}
行业: ${stockInfo.sector}
细分行业: ${stockInfo.industry}

请从以下角度进行分析：
1. 公司业务模式分析
2. 市场地位评估
3. 竞争优势识别
4. 发展前景展望
5. 投资价值评估

请提供详细的分析报告，包括关键发现和投资建议。
`;

      const response = await this.agent.generate(prompt);

      return {
        analystType: 'CompanyOverviewAnalyst',
        stockSymbol: symbol,
        analysis: response.text,
        confidence: 0.85,
        keyFindings: this.extractKeyFindings(response.text),
        recommendations: this.extractRecommendations(response.text),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`公司概述分析失败 ${symbol}:`, error);
      throw error;
    }
  }

  private extractKeyFindings(analysis: string): string[] {
    // 简单的关键词提取，实际应用中可以使用更复杂的 NLP 技术
    const findings = [];
    if (analysis.includes('竞争优势')) findings.push('识别出公司竞争优势');
    if (analysis.includes('市场地位')) findings.push('评估了市场地位');
    if (analysis.includes('业务模式')) findings.push('分析了业务模式');
    if (analysis.includes('发展前景')) findings.push('评估了发展前景');
    return findings;
  }

  private extractRecommendations(analysis: string): string[] {
    const recommendations = [];
    if (analysis.includes('买入') || analysis.includes('推荐')) recommendations.push('考虑买入');
    if (analysis.includes('持有')) recommendations.push('建议持有');
    if (analysis.includes('观望')) recommendations.push('建议观望');
    return recommendations;
  }
}
