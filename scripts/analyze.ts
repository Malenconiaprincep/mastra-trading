#!/usr/bin/env tsx

import { TradingOrchestrator } from '../src/orchestrator/TradingOrchestrator';
import { config, validateConfig, STOCK_EXAMPLES } from '../src/config';

async function analyzeStock(symbol: string) {
  try {
    console.log(`🚀 开始分析股票: ${symbol} (${STOCK_EXAMPLES[symbol as keyof typeof STOCK_EXAMPLES] || '未知'})`);

    // 验证配置
    validateConfig();

    // 创建交易协调器
    const orchestrator = new TradingOrchestrator(
      config.openai.apiKey,
      config.tushare.token,
      config.news.apiKey,
      config.app.useMockData
    );

    // 分析股票
    const result = await orchestrator.analyzeStock(symbol);

    // 输出结果
    console.log(orchestrator.getAnalysisSummary(result));

  } catch (error) {
    console.error('❌ 分析失败:', error);
    process.exit(1);
  }
}

// 主函数
async function main() {
  const symbol = process.argv[2];

  if (!symbol) {
    console.log('使用方法: npm run analyze <股票代码>');
    console.log('\n示例股票代码:');
    Object.entries(STOCK_EXAMPLES).forEach(([code, name]) => {
      console.log(`  ${code} - ${name}`);
    });
    process.exit(1);
  }

  await analyzeStock(symbol);
}

// 运行主函数
if (require.main === module) {
  main();
}
