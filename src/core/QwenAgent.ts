import axios from 'axios';

export interface QwenAgentConfig {
  name: string;
  instructions: string;
  model: {
    provider: string;
    name: string;
    toolChoice?: string;
  };
  tools?: any[];
}

export interface QwenAgentResponse {
  text: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class QwenAgent {
  private apiKey: string;
  private config: QwenAgentConfig;
  private baseUrl = 'https://dashscope.aliyuncs.com/api/v1';

  constructor(config: QwenAgentConfig, apiKey: string) {
    this.config = config;
    this.apiKey = apiKey;
  }

  async generate(prompt: string): Promise<QwenAgentResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/services/aigc/text-generation/generation`,
        {
          model: this.config.model.name,
          input: {
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
          },
          parameters: {
            temperature: 0.7,
            max_tokens: 2000,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const output = response.data.output;
      if (!output || !output.text) {
        throw new Error('No response from Qwen API');
      }

      return {
        text: output.text,
        usage: output.usage ? {
          prompt_tokens: output.usage.input_tokens || 0,
          completion_tokens: output.usage.output_tokens || 0,
          total_tokens: output.usage.total_tokens || 0,
        } : undefined,
      };
    } catch (error) {
      console.error(`QwenAgent ${this.config.name} 生成失败:`, error);
      throw error;
    }
  }

  get name(): string {
    return this.config.name;
  }
}
