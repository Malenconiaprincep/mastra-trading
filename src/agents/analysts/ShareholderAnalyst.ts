import { Agent } from '../../core/Agent';
import { ShareholderInfo, AnalystReport } from '../../types';
import { StockDataFetcher } from '../../utils/dataFetchers';

export class ShareholderAnalyst {
  private agent: Agent;
  private dataFetcher: StockDataFetcher;

  constructor(openaiApiKey: string, dataFetcher: StockDataFetcher) {
    this.dataFetcher = dataFetcher;
    this.agent = new Agent({
      name: 'ShareholderAnalyst',
      instructions: `你是一位专业的股东结构分析师。你的职责是：

1. 分析公司的股东结构和持股分布
2. 评估机构投资者和散户投资者的持股比例
3. 分析大股东和内部人员的持股变化
4. 评估股东结构的稳定性和治理质量
5. 分析股东结构对股价和公司治理的影响

请基于提供的股东数据，进行深入的股东结构分析，评估公司治理和投资价值。`,
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
      // 获取股东信息
      const shareholderInfo = await this.dataFetcher.getShareholderInfo(symbol);

      // 构建分析提示
      const topHoldersInfo = shareholderInfo.topHolders?.map((holder, index) =>
        `${index + 1}. ${holder.name}: ${holder.shares.toLocaleString()}股 (${holder.percentage}%)`
      ).join('\n') || '暂无数据';

      const prompt = `
请分析以下A股 ${symbol} 的股东结构：

股东结构数据：
- 机构持股比例: ${shareholderInfo.institutionalOwnership?.toFixed(2)}%
- 内部持股比例: ${shareholderInfo.insiderOwnership?.toFixed(2)}%

前十大股东：
${topHoldersInfo}

请从以下角度进行股东结构分析：
1. 股东集中度分析
2. 机构投资者参与度评估
3. 内部持股稳定性分析
4. 股东结构治理质量评估
5. 股权结构对股价的影响
6. 投资风险提示

请提供详细的股东结构分析报告，包括治理质量评估和投资建议。
`;

      const response = await this.agent.generate(prompt);

      return {
        analystType: 'ShareholderAnalyst',
        stockSymbol: symbol,
        analysis: response.text,
        confidence: 0.75,
        keyFindings: this.extractKeyFindings(response.text, shareholderInfo),
        recommendations: this.extractRecommendations(response.text),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`股东分析失败 ${symbol}:`, error);
      throw error;
    }
  }

  private extractKeyFindings(analysis: string, shareholderInfo: ShareholderInfo): string[] {
    const findings = [];

    // 基于股东数据提取关键发现
    if (shareholderInfo.institutionalOwnership && shareholderInfo.institutionalOwnership > 60) {
      findings.push('机构持股比例较高');
    } else if (shareholderInfo.institutionalOwnership && shareholderInfo.institutionalOwnership < 30) {
      findings.push('机构持股比例较低');
    }

    if (shareholderInfo.insiderOwnership && shareholderInfo.insiderOwnership > 10) {
      findings.push('内部持股比例较高');
    } else if (shareholderInfo.insiderOwnership && shareholderInfo.insiderOwnership < 3) {
      findings.push('内部持股比例较低');
    }

    if (shareholderInfo.topHolders && shareholderInfo.topHolders.length > 0) {
      const topHolder = shareholderInfo.topHolders[0];
      if (topHolder.percentage > 20) {
        findings.push('第一大股东持股比例较高');
      }
    }

    // 基于分析内容提取关键发现
    if (analysis.includes('集中') || analysis.includes('集中度')) {
      findings.push('股权相对集中');
    }
    if (analysis.includes('分散') || analysis.includes('分散化')) {
      findings.push('股权相对分散');
    }
    if (analysis.includes('稳定') || analysis.includes('稳定')) {
      findings.push('股东结构稳定');
    }
    if (analysis.includes('变化') || analysis.includes('调整')) {
      findings.push('股东结构存在变化');
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
    if (analysis.includes('风险')) recommendations.push('注意风险');
    return recommendations;
  }
}
