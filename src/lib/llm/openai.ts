import { LLMProvider, LLMRequest, LLMResponse } from '../types/llm';
import { getApiKey } from './api-keys';

export class OpenAIProvider implements LLMProvider {
  name = 'OpenAI';
  models = ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'];

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const apiKey = getApiKey('openai');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        throw new Error(`OpenAI API error: ${response.statusText}`);
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
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
}
