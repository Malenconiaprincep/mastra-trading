// 风险管理团队导出
export { AggressiveRiskAnalyst } from './AggressiveRiskAnalyst';
export { SafeRiskAnalyst } from './SafeRiskAnalyst';
export { NeutralRiskAnalyst } from './NeutralRiskAnalyst';
export { RiskManager, FinalRiskAssessment } from './RiskManager';

// 导入类型
import { AggressiveRiskAnalyst } from './AggressiveRiskAnalyst';
import { SafeRiskAnalyst } from './SafeRiskAnalyst';
import { NeutralRiskAnalyst } from './NeutralRiskAnalyst';
import { RiskManager, FinalRiskAssessment } from './RiskManager';

// 风险管理团队类型
export interface RiskManagementTeam {
  aggressiveRiskAnalyst: AggressiveRiskAnalyst;
  safeRiskAnalyst: SafeRiskAnalyst;
  neutralRiskAnalyst: NeutralRiskAnalyst;
  riskManager: RiskManager;
}

// 风险管理团队工厂类
export class RiskManagementTeamFactory {
  static createRiskManagementTeam(openaiApiKey: string): RiskManagementTeam {
    return {
      aggressiveRiskAnalyst: new AggressiveRiskAnalyst(openaiApiKey),
      safeRiskAnalyst: new SafeRiskAnalyst(openaiApiKey),
      neutralRiskAnalyst: new NeutralRiskAnalyst(openaiApiKey),
      riskManager: new RiskManager(openaiApiKey),
    };
  }
}
