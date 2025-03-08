import { Personality } from '../constants';

export enum LLMRole {
  PRIMARY_RESPONDER = 'PRIMARY_RESPONDER',
  SYNTHESIZER = 'SYNTHESIZER',
}

export interface LLMClient {
  personality: Personality;
  generateResponse(request: LLMRequest): Promise<LLMResponse>;
  name: string;
  metadata?: {
    model: string;
    provider: string;
    capabilities?: string[];
  };
}

export interface LLMResponse {
  role?: LLMRole;
  content: string;
  model: string;
  created: number;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface LLMRequest {
  prompt: string;
  conversationHistory?: string[] | string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProvider {
  generateResponse(request: LLMRequest): Promise<LLMResponse>;
  name: string;
  models: string[];
}
