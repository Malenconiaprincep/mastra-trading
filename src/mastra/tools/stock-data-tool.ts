import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// 股票基础信息接口
interface StockInfo {
  code: string;
  name: string;
  currentPrice: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  pb: number;
  industry: string;
}

// 财务数据接口
interface FinancialData {
  revenue: number;
  netProfit: number;
  totalAssets: number;
  totalLiabilities: number;
  roe: number;
  roa: number;
  debtRatio: number;
}

// 新闻数据接口
interface NewsItem {
  title: string;
  content: string;
  publishTime: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

// 股东信息接口
interface ShareholderInfo {
  topHolders: Array<{
    name: string;
    shares: number;
    percentage: number;
  }>;
  institutionalHolders: number;
  retailHolders: number;
}

export const stockDataTool = createTool({
  id: 'get-stock-data',
  description: '获取A股和ETF的股票数据，包括基础信息、财务数据、新闻、股东信息等',
  inputSchema: z.object({
    stockCode: z.string().describe('股票代码，如000001.SZ（平安银行）或510300.SH（沪深300ETF）'),
    dataType: z.enum(['basic', 'financial', 'news', 'shareholder', 'all']).describe('需要获取的数据类型'),
  }),
  outputSchema: z.object({
    stockInfo: z.object({
      code: z.string(),
      name: z.string(),
      currentPrice: z.number(),
      changePercent: z.number(),
      volume: z.number(),
      marketCap: z.number(),
      pe: z.number(),
      pb: z.number(),
      industry: z.string(),
    }).optional(),
    financialData: z.object({
      revenue: z.number(),
      netProfit: z.number(),
      totalAssets: z.number(),
      totalLiabilities: z.number(),
      roe: z.number(),
      roa: z.number(),
      debtRatio: z.number(),
    }).optional(),
    news: z.array(z.object({
      title: z.string(),
      content: z.string(),
      publishTime: z.string(),
      source: z.string(),
      sentiment: z.enum(['positive', 'negative', 'neutral']),
    })).optional(),
    shareholderInfo: z.object({
      topHolders: z.array(z.object({
        name: z.string(),
        shares: z.number(),
        percentage: z.number(),
      })),
      institutionalHolders: z.number(),
      retailHolders: z.number(),
    }).optional(),
  }),
  execute: async ({ context }) => {
    return await getStockData(context.stockCode, context.dataType);
  },
});

// 模拟股票数据获取函数
const getStockData = async (stockCode: string, dataType: string) => {
  // 这里应该连接真实的股票数据API，如东方财富、同花顺等
  // 目前使用模拟数据来演示功能

  const result: any = {};

  if (dataType === 'basic' || dataType === 'all') {
    result.stockInfo = await getBasicStockInfo(stockCode);
  }

  if (dataType === 'financial' || dataType === 'all') {
    result.financialData = await getFinancialData(stockCode);
  }

  if (dataType === 'news' || dataType === 'all') {
    result.news = await getNewsData(stockCode);
  }

  if (dataType === 'shareholder' || dataType === 'all') {
    result.shareholderInfo = await getShareholderInfo(stockCode);
  }

  return result;
};

// 获取基础股票信息
const getBasicStockInfo = async (stockCode: string): Promise<StockInfo> => {
  // 模拟数据 - 实际应该调用真实API
  const mockData: Record<string, StockInfo> = {
    '000001.SZ': {
      code: '000001.SZ',
      name: '平安银行',
      currentPrice: 12.45,
      changePercent: 2.1,
      volume: 125000000,
      marketCap: 241000000000,
      pe: 4.2,
      pb: 0.6,
      industry: '银行',
    },
    '510300.SH': {
      code: '510300.SH',
      name: '沪深300ETF',
      currentPrice: 3.89,
      changePercent: -0.8,
      volume: 89000000,
      marketCap: 156000000000,
      pe: 12.5,
      pb: 1.2,
      industry: 'ETF',
    },
    '000002.SZ': {
      code: '000002.SZ',
      name: '万科A',
      currentPrice: 8.76,
      changePercent: 1.5,
      volume: 67000000,
      marketCap: 98000000000,
      pe: 6.8,
      pb: 0.8,
      industry: '房地产',
    },
  };

  return mockData[stockCode] || {
    code: stockCode,
    name: '未知股票',
    currentPrice: 0,
    changePercent: 0,
    volume: 0,
    marketCap: 0,
    pe: 0,
    pb: 0,
    industry: '未知',
  };
};

// 获取财务数据
const getFinancialData = async (stockCode: string): Promise<FinancialData> => {
  // 模拟财务数据
  return {
    revenue: 150000000000,
    netProfit: 25000000000,
    totalAssets: 4500000000000,
    totalLiabilities: 4200000000000,
    roe: 8.5,
    roa: 0.6,
    debtRatio: 0.93,
  };
};

// 获取新闻数据
const getNewsData = async (stockCode: string): Promise<NewsItem[]> => {
  // 模拟新闻数据
  return [
    {
      title: `${stockCode}发布2024年第三季度财报，净利润同比增长15%`,
      content: '公司第三季度实现营业收入...',
      publishTime: '2024-10-15 09:30:00',
      source: '证券时报',
      sentiment: 'positive',
    },
    {
      title: `市场分析师看好${stockCode}未来发展前景`,
      content: '多位分析师认为该公司...',
      publishTime: '2024-10-14 14:20:00',
      source: '中国证券报',
      sentiment: 'positive',
    },
    {
      title: `${stockCode}面临行业竞争加剧挑战`,
      content: '随着行业竞争日趋激烈...',
      publishTime: '2024-10-13 16:45:00',
      source: '财经网',
      sentiment: 'negative',
    },
  ];
};

// 获取股东信息
const getShareholderInfo = async (stockCode: string): Promise<ShareholderInfo> => {
  // 模拟股东数据
  return {
    topHolders: [
      { name: '中国平安保险集团', shares: 5000000000, percentage: 25.6 },
      { name: '香港中央结算有限公司', shares: 3200000000, percentage: 16.4 },
      { name: '全国社保基金', shares: 1800000000, percentage: 9.2 },
    ],
    institutionalHolders: 65.8,
    retailHolders: 34.2,
  };
};
