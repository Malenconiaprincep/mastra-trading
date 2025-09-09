// 管理层导出
export { ResearchManager } from './ResearchManager';
export { Trader, TradingPlan } from './Trader';

// 导入类型
import { ResearchManager } from './ResearchManager';
import { Trader, TradingPlan } from './Trader';

// 管理层类型
export interface ManagementTeam {
  researchManager: ResearchManager;
  trader: Trader;
}

// 管理层工厂类
export class ManagementTeamFactory {
  static createManagementTeam(openaiApiKey: string): ManagementTeam {
    return {
      researchManager: new ResearchManager(openaiApiKey),
      trader: new Trader(openaiApiKey),
    };
  }
}
