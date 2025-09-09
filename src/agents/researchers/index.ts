// 研究员团队导出
export { BullResearcher } from './BullResearcher';
export { BearResearcher } from './BearResearcher';

// 导入类型
import { BullResearcher } from './BullResearcher';
import { BearResearcher } from './BearResearcher';

// 研究员团队类型
export interface ResearcherTeam {
  bullResearcher: BullResearcher;
  bearResearcher: BearResearcher;
}

// 研究员团队工厂类
export class ResearcherTeamFactory {
  static createResearcherTeam(openaiApiKey: string): ResearcherTeam {
    return {
      bullResearcher: new BullResearcher(openaiApiKey),
      bearResearcher: new BearResearcher(openaiApiKey),
    };
  }
}
