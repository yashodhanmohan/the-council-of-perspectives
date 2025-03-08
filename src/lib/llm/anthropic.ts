import { Personality } from '../constants';
import { LLMProvider, LLMRequest, LLMResponse, LLMRole } from '../types/llm';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  system?: string;
}

export class AnthropicClient implements LLMProvider {
  private apiKey: string;
  private model = 'claude-3-5-sonnet-20241022';
  private maxTokens = 1024;
  public name = 'Claude';
  public models = ['claude-3-5-sonnet-20241022'];

  constructor(public personality: Personality) {
    const savedKeys = localStorage.getItem('llm-api-keys');
    const keys = savedKeys ? JSON.parse(savedKeys) : {};
    this.apiKey = keys['anthropic'] || '';
    console.log('Anthropic API key found:', !!this.apiKey);
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key not found. Please add your API key in settings.');
    }

    const messages: AnthropicMessage[] = [];

    // Add conversation history if provided
    if (request.conversationHistory) {
      // Handle both string and array formats for backward compatibility
      const turns = Array.isArray(request.conversationHistory) ? request.conversationHistory : request.conversationHistory.split(/\n\n+/);

      for (const turn of turns) {
        if (!turn.trim()) continue;

        // Split only on first newline to separate role from content
        const firstNewlineIndex = turn.indexOf('\n');
        if (firstNewlineIndex === -1) continue;

        const rolePrefix = turn.slice(0, firstNewlineIndex);
        const content = turn.slice(firstNewlineIndex + 1).trim();

        if (!content) continue;

        // Convert role prefix to Anthropic role
        const role: 'user' | 'assistant' =
          rolePrefix.includes('PRIMARY_RESPONDER') || rolePrefix.includes('SYNTHESIZER') || rolePrefix.includes('Response') ? 'assistant' : 'user';

        messages.push({ role, content });
      }
    }

    // Add the current prompt as the final user message
    messages.push({ role: 'user', content: request.prompt });

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: request.maxTokens || this.maxTokens,
          messages: messages,
          system: request.systemPrompt,
        } as AnthropicRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Anthropic API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      if (!data.content || !data.content[0]?.text) {
        throw new Error('Invalid response format from Anthropic API');
      }

      const assistantResponse = data.content[0].text;

      return {
        content: assistantResponse,
        model: this.model,
        created: Date.now(),
        role: LLMRole.PRIMARY_RESPONDER,
      };
    } catch (error) {
      console.error('Error in Anthropic request:', error);
      throw error; // Re-throw to be handled by the orchestrator
    }
  }

  clearHistory(): void {
    // No need to maintain internal history as we get it from the orchestrator
  }
}
