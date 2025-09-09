import { z } from 'zod';

// 股票基本信息
export const StockInfoSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  exchange: z.string(),
  sector: z.string().optional(),
  industry: z.string().optional(),
});

// 公司概述
export const CompanyOverviewSchema = z.object({
  description: z.string(),
  ceo: z.string().optional(),
  employees: z.number().optional(),
  founded: z.string().optional(),
  headquarters: z.string().optional(),
  website: z.string().optional(),
});

// 市场数据
export const MarketDataSchema = z.object({
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
  volume: z.number(),
  marketCap: z.number().optional(),
  pe: z.number().optional(),
  eps: z.number().optional(),
  dividend: z.number().optional(),
});

// 新闻数据
export const NewsItemSchema = z.object({
  title: z.string(),
  content: z.string(),
  publishedAt: z.string(),
  source: z.string(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
  relevanceScore: z.number().min(0).max(1).optional(),
});

// 基本面数据
export const FundamentalsSchema = z.object({
  revenue: z.number().optional(),
  netIncome: z.number().optional(),
  totalAssets: z.number().optional(),
  totalDebt: z.number().optional(),
  cashFlow: z.number().optional(),
  roe: z.number().optional(),
  roa: z.number().optional(),
  debtToEquity: z.number().optional(),
});

// 股东信息
export const ShareholderInfoSchema = z.object({
  institutionalOwnership: z.number().optional(),
  insiderOwnership: z.number().optional(),
  topHolders: z.array(z.object({
    name: z.string(),
    shares: z.number(),
    percentage: z.number(),
  })).optional(),
});

// 产品信息
export const ProductInfoSchema = z.object({
  products: z.array(z.string()),
  services: z.array(z.string()),
  competitiveAdvantages: z.array(z.string()).optional(),
  marketPosition: z.string().optional(),
});

// 分析师报告
export const AnalystReportSchema = z.object({
  analystType: z.string(),
  stockSymbol: z.string(),
  analysis: z.string(),
  confidence: z.number().min(0).max(1),
  keyFindings: z.array(z.string()),
  recommendations: z.array(z.string()),
  timestamp: z.string(),
});

// 研究员报告
export const ResearcherReportSchema = z.object({
  researcherType: z.enum(['bull', 'bear']),
  stockSymbol: z.string(),
  thesis: z.string(),
  supportingEvidence: z.array(z.string()),
  risks: z.array(z.string()),
  priceTarget: z.number().optional(),
  confidence: z.number().min(0).max(1),
  timestamp: z.string(),
});

// 风险评估
export const RiskAssessmentSchema = z.object({
  riskType: z.enum(['aggressive', 'safe', 'neutral']),
  stockSymbol: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high', 'very_high']),
  riskFactors: z.array(z.string()),
  mitigationStrategies: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  timestamp: z.string(),
});

// 投资建议
export const InvestmentRecommendationSchema = z.object({
  stockSymbol: z.string(),
  action: z.enum(['buy', 'sell', 'hold']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  priceTarget: z.number().optional(),
  timeHorizon: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  timestamp: z.string(),
});

// 导出类型
export type StockInfo = z.infer<typeof StockInfoSchema>;
export type CompanyOverview = z.infer<typeof CompanyOverviewSchema>;
export type MarketData = z.infer<typeof MarketDataSchema>;
export type NewsItem = z.infer<typeof NewsItemSchema>;
export type Fundamentals = z.infer<typeof FundamentalsSchema>;
export type ShareholderInfo = z.infer<typeof ShareholderInfoSchema>;
export type ProductInfo = z.infer<typeof ProductInfoSchema>;
export type AnalystReport = z.infer<typeof AnalystReportSchema>;
export type ResearcherReport = z.infer<typeof ResearcherReportSchema>;
export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;
export type InvestmentRecommendation = z.infer<typeof InvestmentRecommendationSchema>;
