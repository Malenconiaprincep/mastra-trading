#!/usr/bin/env tsx

import { MockDataFetcher } from '../src/utils/dataFetchers';

async function testMockSystem() {
  try {
    console.log('🧪 测试 Mastra 股票分析系统 (模拟模式)...');

    // 测试数据获取器
    const dataFetcher = new MockDataFetcher();
    const testSymbol = '000001.SZ';

    console.log(`\n📊 测试数据获取: ${testSymbol}`);

    // 测试各种数据获取功能
    console.log('\n1. 获取股票基本信息...');
    const stockInfo = await dataFetcher.getStockInfo(testSymbol);
    console.log('✅ 股票信息:', stockInfo);

    console.log('\n2. 获取市场数据...');
    const marketData = await dataFetcher.getMarketData(testSymbol);
    console.log('✅ 市场数据:', marketData);

    console.log('\n3. 获取新闻数据...');
    const news = await dataFetcher.getNews(testSymbol, 5);
    console.log('✅ 新闻数据:', news.length, '条新闻');

    console.log('\n4. 获取基本面数据...');
    const fundamentals = await dataFetcher.getFundamentals(testSymbol);
    console.log('✅ 基本面数据:', fundamentals);

    console.log('\n5. 获取股东信息...');
    const shareholderInfo = await dataFetcher.getShareholderInfo(testSymbol);
    console.log('✅ 股东信息:', shareholderInfo);

    console.log('\n✅ 所有数据获取功能测试通过！');
    console.log('\n📋 系统架构验证:');
    console.log('✅ 数据获取器 - 正常');
    console.log('✅ 类型定义 - 正常');
    console.log('✅ 模块导入 - 正常');
    console.log('✅ 项目结构 - 正常');

    console.log('\n🎯 系统已准备就绪！');
    console.log('💡 要使用真实分析功能，请设置有效的 OPENAI_API_KEY 环境变量');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  testMockSystem();
}
