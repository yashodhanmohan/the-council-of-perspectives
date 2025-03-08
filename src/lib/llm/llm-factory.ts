import { Personality } from '../constants';
import { LLMProvider } from '../types/llm';
import { AnthropicClient } from './anthropic';
import { DeepseekProvider } from './deepseek';
import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';

export function createLLMProvider(type: string): LLMProvider {
  switch (type) {
    case 'anthropic':
      return new AnthropicClient(Personality.ARCHITECT);
    case 'openai':
      return new OpenAIProvider();
    case 'deepseek':
      return new DeepseekProvider();
    case 'gemini':
      return new GeminiProvider();
    default:
      throw new Error(`Unknown LLM provider type: ${type}`);
  }
}
