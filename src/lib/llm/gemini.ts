import { LLMProvider, LLMRequest, LLMResponse } from '../types/llm';
import { getApiKey } from './api-keys';

export class GeminiProvider implements LLMProvider {
  name = 'Gemini';
  models = ['gemini-pro', 'gemini-pro-vision'];

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const apiKey = getApiKey('gemini');

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.models[0]}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: request.prompt }],
            },
          ],
          generationConfig: {
            temperature: request.temperature,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        content: data.candidates[0].content.parts[0].text,
        model: this.models[0],
        created: Date.now(),
        tokens: {
          prompt: 0, // Gemini doesn't provide token counts
          completion: 0,
          total: 0,
        },
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }
}
