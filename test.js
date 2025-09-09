// 简单的测试脚本
import { mastra } from './src/mastra/index.js';

async function testStockAnalysis() {
  try {
    console.log('🚀 开始测试股票分析系统...');

    // 测试股票分析工作流
    const result = await mastra.workflows.stockAnalysisWorkflow.execute({
      stockCode: '000001.SZ',
      analysisType: 'comprehensive',
    });

    console.log('✅ 测试成功！');
    console.log('📊 分析结果摘要:');
    console.log(`股票代码: ${result.stockCode}`);
    console.log(`分析类型: ${result.summary.analysisType}`);
    console.log(`分析时间: ${result.timestamp}`);

    // 显示部分分析结果
    if (result.analystTeam.companyOverview) {
      console.log('\n🏢 公司概述分析 (前100字符):');
      console.log(result.analystTeam.companyOverview.substring(0, 100) + '...');
    }

    if (result.researcherTeam.bullResearch) {
      console.log('\n🐂 看涨研究 (前100字符):');
      console.log(result.researcherTeam.bullResearch.substring(0, 100) + '...');
    }

    if (result.managementTeam.tradingStrategy) {
      console.log('\n💼 交易策略 (前100字符):');
      console.log(result.managementTeam.tradingStrategy.substring(0, 100) + '...');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  }
}

// 运行测试
testStockAnalysis();
