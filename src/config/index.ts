import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

export interface Config {
  ai: {
    provider: 'openai' | 'qwen';
    openai?: {
      apiKey: string;
    };
    qwen?: {
      apiKey: string;
      model: string;
    };
  };
  tushare: {
    token?: string;
  };
  news: {
    apiKey?: string;
  };
  app: {
    port: number;
    nodeEnv: string;
    useMockData: boolean;
  };
  database?: {
    url: string;
  };
}

export const config: Config = {
  ai: {
    provider: (process.env.AI_PROVIDER as 'openai' | 'qwen') || 'qwen',
    openai: process.env.OPENAI_API_KEY ? {
      apiKey: process.env.OPENAI_API_KEY,
    } : undefined,
    qwen: process.env.QWEN_API_KEY ? {
      apiKey: process.env.QWEN_API_KEY,
      model: process.env.QWEN_MODEL || 'qwen-plus',
    } : undefined,
  },
  tushare: {
    token: process.env.TUSHARE_TOKEN,
  },
  news: {
    apiKey: process.env.NEWS_API_KEY,
  },
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    useMockData: process.env.USE_MOCK_DATA === 'true',
  },
  database: process.env.DATABASE_URL ? {
    url: process.env.DATABASE_URL,
  } : undefined,
};

// 验证配置
export function validateConfig(): void {
  const { ai } = config;

  if (ai.provider === 'openai' && !ai.openai?.apiKey) {
    throw new Error('使用 OpenAI 时，OPENAI_API_KEY 环境变量是必需的');
  }

  if (ai.provider === 'qwen' && !ai.qwen?.apiKey) {
    throw new Error('使用 Qwen 时，QWEN_API_KEY 环境变量是必需的');
  }

  if (!config.app.useMockData && !config.tushare.token) {
    console.warn('警告: 未设置 TUSHARE_TOKEN，将使用模拟数据');
  }

  if (!config.app.useMockData && !config.news.apiKey) {
    console.warn('警告: 未设置 NEWS_API_KEY，将使用模拟数据');
  }
}

// 获取股票代码示例
export const STOCK_EXAMPLES = {
  // 银行股
  '000001.SZ': '平安银行',
  '600036.SH': '招商银行',
  '601318.SH': '中国平安',

  // 科技股
  '000002.SZ': '万科A',
  '600519.SH': '贵州茅台',
  '000858.SZ': '五粮液',

  // ETF
  '510300.SH': '沪深300ETF',
  '510500.SH': '中证500ETF',
  '159915.SZ': '创业板ETF',
} as const;

export type StockSymbol = keyof typeof STOCK_EXAMPLES;
