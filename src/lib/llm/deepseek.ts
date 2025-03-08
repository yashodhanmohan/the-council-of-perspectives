import { LLMProvider, LLMRequest, LLMResponse } from '../types/llm';
import { getApiKey } from './api-keys';

export class DeepseekProvider implements LLMProvider {
  name = 'Deepseek';
  models = [
    'deepseek-chat-67b',
    'deepseek-coder-33b',
    'deepseek-coder-6.7b',
  ];

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const apiKey = getApiKey('deepseek');

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.models[0],
          messages: [
            {
              role: 'system',
              content: request.systemPrompt,
            },
            {
              role: 'user',
              content: request.prompt,
            },
          ],
          temperature: request.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`Deepseek API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        content: data.choices[0].message.content,
        model: this.models[0],
        created: Date.now(),
        tokens: {
          prompt: data.usage.prompt_tokens,
          completion: data.usage.completion_tokens,
          total: data.usage.total_tokens,
        },
      };
    } catch (error) {
      console.error('Deepseek API error:', error);
      throw error;
    }
  }
} 