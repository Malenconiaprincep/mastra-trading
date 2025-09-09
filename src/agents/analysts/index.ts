// 分析师团队导出
export { CompanyOverviewAnalyst } from './CompanyOverviewAnalyst';
export { MarketAnalyst } from './MarketAnalyst';
export { SentimentAnalyst } from './SentimentAnalyst';
export { NewsAnalyst } from './NewsAnalyst';
export { FundamentalsAnalyst } from './FundamentalsAnalyst';
export { ShareholderAnalyst } from './ShareholderAnalyst';
export { ProductAnalyst } from './ProductAnalyst';

// 导入类型
import { CompanyOverviewAnalyst } from './CompanyOverviewAnalyst';
import { MarketAnalyst } from './MarketAnalyst';
import { SentimentAnalyst } from './SentimentAnalyst';
import { NewsAnalyst } from './NewsAnalyst';
import { FundamentalsAnalyst } from './FundamentalsAnalyst';
import { ShareholderAnalyst } from './ShareholderAnalyst';
import { ProductAnalyst } from './ProductAnalyst';

// 分析师团队类型
export interface AnalystTeam {
  companyOverviewAnalyst: CompanyOverviewAnalyst;
  marketAnalyst: MarketAnalyst;
  sentimentAnalyst: SentimentAnalyst;
  newsAnalyst: NewsAnalyst;
  fundamentalsAnalyst: FundamentalsAnalyst;
  shareholderAnalyst: ShareholderAnalyst;
  productAnalyst: ProductAnalyst;
}

// 分析师团队工厂类
export class AnalystTeamFactory {
  static createAnalystTeam(
    openaiApiKey: string,
    dataFetcher: any
  ): AnalystTeam {
    return {
      companyOverviewAnalyst: new CompanyOverviewAnalyst(openaiApiKey, dataFetcher),
      marketAnalyst: new MarketAnalyst(openaiApiKey, dataFetcher),
      sentimentAnalyst: new SentimentAnalyst(openaiApiKey, dataFetcher),
      newsAnalyst: new NewsAnalyst(openaiApiKey, dataFetcher),
      fundamentalsAnalyst: new FundamentalsAnalyst(openaiApiKey, dataFetcher),
      shareholderAnalyst: new ShareholderAnalyst(openaiApiKey, dataFetcher),
      productAnalyst: new ProductAnalyst(openaiApiKey, dataFetcher),
    };
  }
}
