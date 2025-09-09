import OpenAI from 'openai';

export interface AgentConfig {
  name: string;
  instructions: string;
  model: {
    provider: string;
    name: string;
    toolChoice?: string;
  };
  tools?: any[];
}

export interface AgentResponse {
  text: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class Agent {
  private openai: OpenAI;
  private config: AgentConfig;

  constructor(config: AgentConfig, apiKey: string) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async generate(prompt: string): Promise<AgentResponse> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model.name,
        messages: [
          {
            role: 'system',
            content: this.config.instructions,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const choice = response.choices[0];
      if (!choice || !choice.message) {
        throw new Error('No response from OpenAI');
      }

      return {
        text: choice.message.content || '',
        usage: response.usage,
      };
    } catch (error) {
      console.error(`Agent ${this.config.name} 生成失败:`, error);
      throw error;
    }
  }

  get name(): string {
    return this.config.name;
  }
}
