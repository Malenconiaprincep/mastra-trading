import dotenv from 'dotenv';
import { TradingOrchestrator } from './orchestrator/TradingOrchestrator';

// 加载环境变量
dotenv.config();

async function main() {
  try {
    console.log('🚀 启动 Mastra 股票分析系统...');

    // 检查必要的环境变量
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('请设置 OPENAI_API_KEY 环境变量');
    }

    const tushareToken = process.env.TUSHARE_TOKEN;
    const newsApiKey = process.env.NEWS_API_KEY;
    const useMockData = process.env.USE_MOCK_DATA === 'true';

    // 创建交易协调器
    const orchestrator = new TradingOrchestrator(
      openaiApiKey,
      tushareToken,
      newsApiKey,
      useMockData
    );

    // 示例：分析股票
    const symbol = '000001.SZ'; // 平安银行
    console.log(`\n📊 开始分析股票: ${symbol}`);

    const result = await orchestrator.analyzeStock(symbol);

    // 输出分析结果摘要
    console.log(orchestrator.getAnalysisSummary(result));

    // 输出详细分析结果
    console.log('\n📋 详细分析结果:');
    console.log('=====================================');

    // 分析师报告
    console.log('\n📊 分析师团队报告:');
    result.analystReports.forEach((report, index) => {
      console.log(`\n${index + 1}. ${report.analystType}:`);
      console.log(`   置信度: ${(report.confidence * 100).toFixed(1)}%`);
      console.log(`   关键发现: ${report.keyFindings.join(', ')}`);
      console.log(`   建议: ${report.recommendations.join(', ')}`);
    });

    // 研究员报告
    console.log('\n🔬 研究员团队报告:');
    result.researcherReports.forEach((report, index) => {
      console.log(`\n${index + 1}. ${report.researcherType === 'bull' ? '看涨研究员' : '看跌研究员'}:`);
      console.log(`   置信度: ${(report.confidence * 100).toFixed(1)}%`);
      console.log(`   支持证据: ${report.supportingEvidence.join(', ')}`);
      console.log(`   风险因素: ${report.risks.join(', ')}`);
      if (report.priceTarget) {
        console.log(`   价格目标: ${report.priceTarget}`);
      }
    });

    // 投资建议
    console.log('\n👔 投资建议:');
    console.log(`   操作建议: ${result.investmentRecommendation.action}`);
    console.log(`   置信度: ${(result.investmentRecommendation.confidence * 100).toFixed(1)}%`);
    console.log(`   价格目标: ${result.investmentRecommendation.priceTarget || 'N/A'}`);
    console.log(`   时间框架: ${result.investmentRecommendation.timeHorizon}`);
    console.log(`   风险等级: ${result.investmentRecommendation.riskLevel}`);

    // 风险评估
    console.log('\n⚠️ 风险评估:');
    console.log(`   整体风险等级: ${result.finalRiskAssessment.overallRiskLevel}`);
    console.log(`   关键风险因素: ${result.finalRiskAssessment.keyRiskFactors.join(', ')}`);
    console.log(`   风险控制措施: ${result.finalRiskAssessment.riskControlMeasures.join(', ')}`);

    // 交易计划
    console.log('\n💼 交易计划:');
    console.log(`   操作: ${result.tradingPlan.action}`);
    console.log(`   仓位建议: ${result.tradingPlan.positionSize}`);
    console.log(`   风险控制: ${result.tradingPlan.riskControl.join(', ')}`);
    console.log(`   执行计划: ${result.tradingPlan.executionPlan.join(', ')}`);

    console.log('\n✅ 分析完成！');

  } catch (error) {
    console.error('❌ 系统运行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
  main();
}

export { TradingOrchestrator };
