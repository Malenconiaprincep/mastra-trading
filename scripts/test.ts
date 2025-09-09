#!/usr/bin/env tsx

import { TradingOrchestrator } from '../src/orchestrator/TradingOrchestrator';

async function testSystem() {
  try {
    console.log('🧪 测试 Mastra 股票分析系统...');

    // 使用模拟数据进行测试
    const orchestrator = new TradingOrchestrator(
      'test-api-key', // 测试用的API密钥
      undefined, // 不使用Tushare
      undefined, // 不使用新闻API
      true // 使用模拟数据
    );

    // 测试股票代码
    const testSymbol = '000001.SZ';
    console.log(`\n📊 测试分析股票: ${testSymbol}`);

    const result = await orchestrator.analyzeStock(testSymbol);

    // 输出测试结果
    console.log('\n✅ 测试成功完成！');
    console.log('📋 分析结果摘要:');
    console.log(orchestrator.getAnalysisSummary(result));

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  testSystem();
}
