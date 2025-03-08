import { LLM } from '../constants';

export function getApiKey(provider: string): string {
  const savedKeys = localStorage.getItem('llm-api-keys');
  if (!savedKeys) {
    throw new Error('API keys not found. Please set them in settings.');
  }

  const keys = JSON.parse(savedKeys) as Record<LLM, string>;
  const key = keys[provider as LLM];
  
  if (!key) {
    throw new Error(`API key for ${provider} not found. Please set it in settings.`);
  }

  return key;
} 