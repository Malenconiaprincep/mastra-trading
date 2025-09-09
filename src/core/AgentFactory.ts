import { Agent, AgentConfig } from './Agent';
import { QwenAgent, QwenAgentConfig } from './QwenAgent';

export type SupportedProvider = 'openai' | 'qwen';

export interface UnifiedAgentConfig {
  name: string;
  instructions: string;
  model: {
    provider: SupportedProvider;
    name: string;
    toolChoice?: string;
  };
  tools?: any[];
}

export type UnifiedAgent = Agent | QwenAgent;

export class AgentFactory {
  static createAgent(
    config: UnifiedAgentConfig,
    apiKey: string
  ): UnifiedAgent {
    switch (config.model.provider) {
      case 'openai':
        return new Agent(config as AgentConfig, apiKey);
      case 'qwen':
        return new QwenAgent(config as QwenAgentConfig, apiKey);
      default:
        throw new Error(`Unsupported provider: ${config.model.provider}`);
    }
  }

  static getDefaultConfig(provider: SupportedProvider): Partial<UnifiedAgentConfig> {
    switch (provider) {
      case 'openai':
        return {
          model: {
            provider: 'openai',
            name: 'gpt-4',
            toolChoice: 'auto',
          },
        };
      case 'qwen':
        return {
          model: {
            provider: 'qwen',
            name: 'qwen-plus',
            toolChoice: 'auto',
          },
        };
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
