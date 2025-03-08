import { Personality } from '../constants';
import { LLMRequest, LLMResponse } from '../types/llm';
import { createLLMProvider } from './llm-factory';

export interface ChatRequest {
  question: string;
  personality: Personality;
  provider: string;
  model?: string;
}

export class ChatClient {
  static async generateResponse(request: ChatRequest): Promise<LLMResponse> {
    const provider = createLLMProvider(request.provider);

    // If no matching mock response, fall back to provider's mock responses
    const llmRequest: LLMRequest = {
      prompt: request.question,
      systemPrompt: `You are an AI assistant with a ${request.personality} personality. 
                     Respond to the user's question in that style.`,
      temperature: 0.7,
    };

    return provider.generateResponse(llmRequest);
  }
}
