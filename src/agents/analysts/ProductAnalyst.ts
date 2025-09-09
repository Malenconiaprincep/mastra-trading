import { Agent } from '../../core/Agent';
import { ProductInfo, AnalystReport } from '../../types';
import { StockDataFetcher } from '../../utils/dataFetchers';

export class ProductAnalyst {
  private agent: Agent;
  private dataFetcher: StockDataFetcher;

  constructor(openaiApiKey: string, dataFetcher: StockDataFetcher) {
    this.dataFetcher = dataFetcher;
    this.agent = new Agent({
      name: 'ProductAnalyst',
      instructions: `你是一位专业的产品分析师。你的职责是：

1. 分析公司的产品线和业务组合
2. 评估产品的市场竞争力和盈利能力
3. 分析产品的生命周期和发展趋势
4. 评估公司的研发投入和创新能力
5. 分析产品对公司业绩的贡献度

请基于提供的产品数据，进行深入的产品分析，评估公司的产品竞争力和发展前景。`,
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
      // 获取产品信息（这里使用模拟数据，实际应用中需要从其他数据源获取）
      const productInfo = await this.getProductInfo(symbol);

      // 构建分析提示
      const productsList = productInfo.products.join(', ');
      const servicesList = productInfo.services.join(', ');
      const advantagesList = productInfo.competitiveAdvantages?.join(', ') || '暂无数据';

      const prompt = `
请分析以下A股 ${symbol} 的产品情况：

产品信息：
- 主要产品: ${productsList}
- 主要服务: ${servicesList}
- 竞争优势: ${advantagesList}
- 市场地位: ${productInfo.marketPosition || 'N/A'}

请从以下角度进行产品分析：
1. 产品组合分析
2. 市场竞争地位评估
3. 产品生命周期分析
4. 创新能力评估
5. 产品盈利能力分析
6. 发展前景展望

请提供详细的产品分析报告，包括竞争分析和投资建议。
`;

      const response = await this.agent.generate(prompt);

      return {
        analystType: 'ProductAnalyst',
        stockSymbol: symbol,
        analysis: response.text,
        confidence: 0.70,
        keyFindings: this.extractKeyFindings(response.text, productInfo),
        recommendations: this.extractRecommendations(response.text),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`产品分析失败 ${symbol}:`, error);
      throw error;
    }
  }

  // 获取产品信息（模拟数据）
  private async getProductInfo(symbol: string): Promise<ProductInfo> {
    // 这里应该从实际的数据源获取产品信息
    // 暂时使用模拟数据
    const productCategories = {
      '科技': {
        products: ['软件产品', '硬件设备', '云服务', '人工智能产品'],
        services: ['技术咨询', '系统集成', '运维服务', '培训服务'],
        advantages: ['技术领先', '品牌优势', '客户粘性', '规模效应'],
        position: '行业领先'
      },
      '金融': {
        products: ['理财产品', '保险产品', '贷款产品', '投资产品'],
        services: ['财富管理', '投资咨询', '风险管理', '客户服务'],
        advantages: ['牌照优势', '客户基础', '风控能力', '资金实力'],
        position: '区域领先'
      },
      '消费': {
        products: ['消费品', '食品饮料', '服装配饰', '家居用品'],
        services: ['零售服务', '品牌营销', '供应链管理', '客户服务'],
        advantages: ['品牌价值', '渠道优势', '产品创新', '成本控制'],
        position: '市场知名'
      },
      '医药': {
        products: ['药品', '医疗器械', '保健品', '诊断试剂'],
        services: ['医疗服务', '健康咨询', '研发服务', '销售服务'],
        advantages: ['研发实力', '专利保护', '渠道优势', '品牌信任'],
        position: '细分领先'
      }
    };

    const categories = Object.keys(productCategories);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryData = productCategories[randomCategory as keyof typeof productCategories];

    return {
      products: categoryData.products,
      services: categoryData.services,
      competitiveAdvantages: categoryData.advantages,
      marketPosition: categoryData.position,
    };
  }

  private extractKeyFindings(analysis: string, productInfo: ProductInfo): string[] {
    const findings = [];

    // 基于产品数据提取关键发现
    if (productInfo.products.length > 3) {
      findings.push('产品线较为丰富');
    } else {
      findings.push('产品线相对集中');
    }

    if (productInfo.services.length > 2) {
      findings.push('服务业务多元化');
    }

    if (productInfo.competitiveAdvantages && productInfo.competitiveAdvantages.length > 2) {
      findings.push('具备多项竞争优势');
    }

    // 基于分析内容提取关键发现
    if (analysis.includes('领先') || analysis.includes('优势')) {
      findings.push('产品具有竞争优势');
    }
    if (analysis.includes('创新') || analysis.includes('研发')) {
      findings.push('具备创新能力');
    }
    if (analysis.includes('增长') || analysis.includes('发展')) {
      findings.push('产品发展前景良好');
    }
    if (analysis.includes('竞争') || analysis.includes('挑战')) {
      findings.push('面临市场竞争');
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
    if (analysis.includes('长期')) recommendations.push('适合长期投资');
    return recommendations;
  }
}
