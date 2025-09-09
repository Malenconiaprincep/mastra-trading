#!/usr/bin/env tsx

import { TradingOrchestrator } from '../src/orchestrator/TradingOrchestrator';

async function testQwenSystem() {
  try {
    console.log('🧪 测试 Mastra 股票分析系统 (Qwen 模式)...');

    // 检查 Qwen API 密钥
    const qwenApiKey = process.env.QWEN_API_KEY;
    if (!qwenApiKey) {
      console.log('❌ 未设置 QWEN_API_KEY 环境变量');
      console.log('💡 请设置 QWEN_API_KEY 环境变量来测试 Qwen 功能');
      console.log('📝 示例: export QWEN_API_KEY=your_qwen_api_key_here');
      return;
    }

    // 使用 Qwen 进行测试
    const orchestrator = new TradingOrchestrator(
      'qwen',
      qwenApiKey,
      undefined, // 不使用Tushare
      undefined, // 不使用新闻API
      true // 使用模拟数据
    );

    // 测试股票代码
    const testSymbol = '000001.SZ';
    console.log(`\n📊 测试分析股票: ${testSymbol}`);
    console.log('🤖 使用 AI 模型: Qwen');

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
  testQwenSystem();
}
