import axios from 'axios';
import { StockInfo, MarketData, NewsItem, Fundamentals, ShareholderInfo } from '../types';

// A股和ETF数据获取器
export class StockDataFetcher {
  private tushareToken: string;
  private newsApiKey: string;

  constructor(tushareToken: string, newsApiKey: string) {
    this.tushareToken = tushareToken;
    this.newsApiKey = newsApiKey;
  }

  // 获取股票基本信息
  async getStockInfo(symbol: string): Promise<StockInfo> {
    try {
      // 使用Tushare API获取A股基本信息
      const response = await axios.post('http://api.tushare.pro', {
        api_name: 'stock_basic',
        token: this.tushareToken,
        params: {
          ts_code: symbol,
          fields: 'ts_code,symbol,name,area,industry,market,list_date'
        }
      });

      const data = response.data.data?.data?.[0];
      if (!data) {
        throw new Error(`未找到股票信息: ${symbol}`);
      }

      return {
        symbol: data.ts_code,
        name: data.name,
        exchange: data.market === '主板' ? 'SH' : 'SZ',
        sector: data.area,
        industry: data.industry,
      };
    } catch (error) {
      console.error(`获取股票信息失败 ${symbol}:`, error);
      throw error;
    }
  }

  // 获取市场数据
  async getMarketData(symbol: string): Promise<MarketData> {
    try {
      // 使用Tushare API获取实时行情数据
      const response = await axios.post('http://api.tushare.pro', {
        api_name: 'daily',
        token: this.tushareToken,
        params: {
          ts_code: symbol,
          limit: 1,
          fields: 'ts_code,trade_date,close,pct_chg,vol,amount'
        }
      });

      const data = response.data.data?.data?.[0];
      if (!data) {
        throw new Error(`未找到市场数据: ${symbol}`);
      }

      return {
        price: parseFloat(data.close),
        change: parseFloat(data.pct_chg),
        changePercent: parseFloat(data.pct_chg),
        volume: parseInt(data.vol),
        marketCap: undefined, // 需要额外API获取
        pe: undefined, // 需要额外API获取
        eps: undefined, // 需要额外API获取
        dividend: undefined, // 需要额外API获取
      };
    } catch (error) {
      console.error(`获取市场数据失败 ${symbol}:`, error);
      throw error;
    }
  }

  // 获取新闻数据 (使用国内新闻源)
  async getNews(symbol: string, limit: number = 10): Promise<NewsItem[]> {
    try {
      // 使用新浪财经或其他国内新闻API
      const response = await axios.get(
        `https://finance.sina.com.cn/stock/stockzmt/${symbol}.html`
      );

      // 这里需要解析HTML或使用其他新闻API
      // 暂时返回模拟数据
      return this.getMockNews(symbol, limit);
    } catch (error) {
      console.error(`获取新闻数据失败 ${symbol}:`, error);
      return this.getMockNews(symbol, limit);
    }
  }

  // 获取基本面数据
  async getFundamentals(symbol: string): Promise<Fundamentals> {
    try {
      // 使用Tushare API获取财务数据
      const response = await axios.post('http://api.tushare.pro', {
        api_name: 'income',
        token: this.tushareToken,
        params: {
          ts_code: symbol,
          period: '20231231',
          fields: 'ts_code,ann_date,f_ann_date,end_date,report_type,comp_type,basic_eps,diluted_eps,total_revenue,revenue,int_income,prem_earned,comm_income,n_commis_income,n_oth_income,n_oth_b_income,prem_income,out_prem,une_prem_reser,reins_income,n_sec_tb_income,n_sec_uw_income,n_asset_mg_income,oth_b_income,fv_value_chg_gain,invest_income,ass_invest_income,forex_gain,total_cogs,oper_cost,int_exp,comm_exp,biz_tax_surchg,sell_exp,admin_exp,fin_exp,assets_impair_loss,prem_refund,compens_payout,reser_insur_liab,div_payt,reins_exp,oper_exp,compens_payout_refu,insur_reser_refu,reins_cost_refund,other_bus_cost,operate_profit,non_oper_income,non_oper_exp,nca_disploss,total_profit,income_tax,n_income,n_income_attr_p,minority_gain,oth_compr_income,t_compr_income,compr_inc_attr_p,compr_inc_attr_m_s,e_basic_eps,e_diluted_eps'
        }
      });

      const data = response.data.data?.data?.[0];
      if (!data) {
        throw new Error('未找到基本面数据');
      }

      return {
        revenue: parseFloat(data.total_revenue) || undefined,
        netIncome: parseFloat(data.n_income) || undefined,
        totalAssets: undefined, // 需要资产负债表数据
        totalDebt: undefined, // 需要资产负债表数据
        cashFlow: undefined, // 需要现金流量表数据
        roe: undefined, // 需要计算
        roa: undefined, // 需要计算
        debtToEquity: undefined, // 需要计算
      };
    } catch (error) {
      console.error(`获取基本面数据失败 ${symbol}:`, error);
      throw error;
    }
  }

  // 获取模拟新闻数据
  private getMockNews(symbol: string, limit: number): NewsItem[] {
    const news = [];
    for (let i = 0; i < limit; i++) {
      news.push({
        title: `${symbol} 相关A股新闻标题 ${i + 1}`,
        content: `这是关于 ${symbol} 的A股新闻内容，包含市场动态、公司公告等信息...`,
        publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        source: `财经新闻源 ${i + 1}`,
      });
    }
    return news;
  }

  // 获取股东信息 (使用Tushare API)
  async getShareholderInfo(symbol: string): Promise<ShareholderInfo> {
    try {
      // 使用Tushare API获取股东信息
      const response = await axios.post('http://api.tushare.pro', {
        api_name: 'top10_holders',
        token: this.tushareToken,
        params: {
          ts_code: symbol,
          period: '20231231',
          fields: 'ts_code,ann_date,end_date,holder_name,hold_amount,hold_ratio'
        }
      });

      const data = response.data.data?.data;
      if (!data || data.length === 0) {
        return this.getMockShareholderInfo(symbol);
      }

      const topHolders = data.slice(0, 10).map((holder: any) => ({
        name: holder.holder_name,
        shares: parseInt(holder.hold_amount) || 0,
        percentage: parseFloat(holder.hold_ratio) || 0,
      }));

      return {
        institutionalOwnership: Math.random() * 80 + 10, // 需要计算机构持股比例
        insiderOwnership: Math.random() * 20, // 需要计算内部持股比例
        topHolders,
      };
    } catch (error) {
      console.error(`获取股东信息失败 ${symbol}:`, error);
      return this.getMockShareholderInfo(symbol);
    }
  }

  // 获取模拟股东信息
  private getMockShareholderInfo(symbol: string): ShareholderInfo {
    return {
      institutionalOwnership: Math.random() * 80 + 10, // 10-90%
      insiderOwnership: Math.random() * 20, // 0-20%
      topHolders: [
        { name: '中国证券金融股份有限公司', shares: 1000000, percentage: 15.2 },
        { name: '中央汇金投资有限责任公司', shares: 800000, percentage: 12.1 },
        { name: '全国社保基金', shares: 600000, percentage: 9.3 },
        { name: '中国人寿保险', shares: 500000, percentage: 7.8 },
        { name: '中国平安保险', shares: 400000, percentage: 6.2 },
      ],
    };
  }
}

// 模拟数据获取器 (用于测试A股和ETF)
export class MockDataFetcher {
  async getStockInfo(symbol: string): Promise<StockInfo> {
    const exchanges = ['SH', 'SZ'];
    const sectors = ['科技', '金融', '消费', '医药', '新能源', '制造业'];
    const industries = ['软件', '银行', '白酒', '生物制药', '锂电池', '汽车制造'];

    return {
      symbol,
      name: `${symbol} 公司`,
      exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
      sector: sectors[Math.floor(Math.random() * sectors.length)],
      industry: industries[Math.floor(Math.random() * industries.length)],
    };
  }

  async getMarketData(symbol: string): Promise<MarketData> {
    return {
      price: 10 + Math.random() * 50, // A股价格范围
      change: (Math.random() - 0.5) * 2, // A股涨跌幅限制
      changePercent: (Math.random() - 0.5) * 10, // A股涨跌幅百分比
      volume: Math.floor(Math.random() * 10000000), // A股交易量
      marketCap: Math.floor(Math.random() * 100000000000), // 市值（人民币）
      pe: 10 + Math.random() * 30, // 市盈率
      eps: 0.5 + Math.random() * 3, // 每股收益
      dividend: Math.random() * 5, // 股息率
    };
  }

  async getNews(symbol: string, limit: number = 10): Promise<NewsItem[]> {
    const news = [];
    const newsSources = ['新浪财经', '东方财富', '同花顺', '雪球', '财联社'];

    for (let i = 0; i < limit; i++) {
      news.push({
        title: `${symbol} A股相关新闻标题 ${i + 1}`,
        content: `这是关于 ${symbol} 的A股新闻内容，包含市场动态、公司公告、行业分析等信息...`,
        publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        source: newsSources[Math.floor(Math.random() * newsSources.length)],
      });
    }
    return news;
  }

  async getFundamentals(symbol: string): Promise<Fundamentals> {
    return {
      revenue: Math.floor(Math.random() * 10000000000), // 营业收入（人民币）
      netIncome: Math.floor(Math.random() * 1000000000), // 净利润（人民币）
      totalAssets: Math.floor(Math.random() * 20000000000), // 总资产（人民币）
      totalDebt: Math.floor(Math.random() * 5000000000), // 总负债（人民币）
      cashFlow: Math.floor(Math.random() * 2000000000), // 现金流（人民币）
      roe: Math.random() * 25, // 净资产收益率
      roa: Math.random() * 15, // 总资产收益率
      debtToEquity: Math.random() * 2, // 资产负债率
    };
  }

  async getShareholderInfo(symbol: string): Promise<ShareholderInfo> {
    return {
      institutionalOwnership: Math.random() * 80 + 10,
      insiderOwnership: Math.random() * 20,
      topHolders: [
        { name: '中国证券金融股份有限公司', shares: 1000000, percentage: 15.2 },
        { name: '中央汇金投资有限责任公司', shares: 800000, percentage: 12.1 },
        { name: '全国社保基金', shares: 600000, percentage: 9.3 },
        { name: '中国人寿保险', shares: 500000, percentage: 7.8 },
        { name: '中国平安保险', shares: 400000, percentage: 6.2 },
      ],
    };
  }
}
