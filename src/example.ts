import { mastra } from './mastra/index.js';

/**
 * 股票分析工具使用示例
 * 
 * 这个示例展示了如何使用完整的股票分析团队来分析A股和ETF
 */

async function analyzeStock() {
  try {
    console.log('🚀 启动股票分析工作流...');

    // 分析平安银行 (000001.SZ)
    const result = await mastra.workflows.stockAnalysisWorkflow.execute({
      stockCode: '000001.SZ',
      analysisType: 'comprehensive',
    });

    console.log('📊 分析完成！');
    console.log('='.repeat(50));
    console.log(`股票代码: ${result.stockCode}`);
    console.log(`分析类型: ${result.summary.analysisType}`);
    console.log(`分析时间: ${result.timestamp}`);
    console.log('='.repeat(50));

    // 显示分析师团队结果
    console.log('\n📈 分析师团队分析结果:');
    console.log('-'.repeat(30));
    if (result.analystTeam.companyOverview) {
      console.log('🏢 公司概述分析:', result.analystTeam.companyOverview);
    }
    if (result.analystTeam.marketAnalysis) {
      console.log('📊 市场分析:', result.analystTeam.marketAnalysis);
    }
    if (result.analystTeam.sentimentAnalysis) {
      console.log('😊 情绪分析:', result.analystTeam.sentimentAnalysis);
    }

    // 显示研究员团队结果
    console.log('\n🔬 研究员团队分析结果:');
    console.log('-'.repeat(30));
    if (result.researcherTeam.bullResearch) {
      console.log('🐂 看涨研究:', result.researcherTeam.bullResearch);
    }
    if (result.researcherTeam.bearResearch) {
      console.log('🐻 看跌研究:', result.researcherTeam.bearResearch);
    }

    // 显示风险管理团队结果
    console.log('\n⚠️ 风险管理团队分析结果:');
    console.log('-'.repeat(30));
    if (result.riskTeam.riskManagement) {
      console.log('🛡️ 风险管理:', result.riskTeam.riskManagement);
    }

    // 显示管理层结果
    console.log('\n👔 管理层分析结果:');
    console.log('-'.repeat(30));
    if (result.managementTeam.researchManagement) {
      console.log('📋 研究管理:', result.managementTeam.researchManagement);
    }
    if (result.managementTeam.tradingStrategy) {
      console.log('💼 交易策略:', result.managementTeam.tradingStrategy);
    }

    // 显示最终结论
    console.log('\n🎯 最终投资建议:');
    console.log('-'.repeat(30));
    console.log('投资建议:', result.conclusion.recommendation);
    console.log('风险等级:', result.conclusion.riskLevel);
    console.log('目标价位:', result.conclusion.targetPrice);
    console.log('投资时间窗口:', result.conclusion.timeHorizon);

  } catch (error) {
    console.error('❌ 分析过程中出现错误:', error);
  }
}

async function analyzeETF() {
  try {
    console.log('\n🚀 启动ETF分析工作流...');

    // 分析沪深300ETF (510300.SH)
    const result = await mastra.workflows.stockAnalysisWorkflow.execute({
      stockCode: '510300.SH',
      analysisType: 'risk-focused',
    });

    console.log('📊 ETF分析完成！');
    console.log('='.repeat(50));
    console.log(`ETF代码: ${result.stockCode}`);
    console.log(`分析类型: ${result.summary.analysisType}`);
    console.log(`分析时间: ${result.timestamp}`);
    console.log('='.repeat(50));

    // 显示关键分析结果
    console.log('\n🎯 ETF投资建议:');
    console.log('-'.repeat(30));
    console.log('投资建议:', result.conclusion.recommendation);
    console.log('风险等级:', result.conclusion.riskLevel);
    console.log('目标价位:', result.conclusion.targetPrice);
    console.log('投资时间窗口:', result.conclusion.timeHorizon);

  } catch (error) {
    console.error('❌ ETF分析过程中出现错误:', error);
  }
}

// 运行示例
async function main() {
  console.log('🎯 A股和ETF股票分析工具演示');
  console.log('='.repeat(60));

  // 分析股票
  await analyzeStock();

  // 分析ETF
  await analyzeETF();

  console.log('\n✅ 所有分析完成！');
}

// 如果直接运行此文件，则执行main函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { analyzeStock, analyzeETF };
