import { Profession } from '../constants';
import { constructPrompt, validateResponse } from '../prompts/orchestration';
import { LLMClient, LLMResponse, LLMRole } from '../types/llm';

export class LLMOrchestrator {
  private clients: Map<string, LLMClient>;
  private turnOrder: string[];
  private currentTurn: number;
  private conversationHistory: LLMResponse[];
  private profession: Profession;
  private messageIndex: number = 0;

  constructor(
    clients: Map<string, LLMClient>,
    turnOrder: string[],
    private onResponse?: (response: LLMResponse | null, index: number, thinking: boolean, messageIndex: number) => void,
    profession: Profession = Profession.ENGINEERING
  ) {
    this.clients = clients;
    this.turnOrder = turnOrder;
    this.currentTurn = 0;
    this.conversationHistory = [];
    this.profession = profession;
  }

  /**
   * Initiates a new conversation round
   */
  async startConversation(userQuery: string): Promise<LLMResponse[]> {
    this.conversationHistory = [];
    this.currentTurn = 0;
    this.messageIndex = 0;

    const responses: LLMResponse[] = [];
    const totalMessages = this.turnOrder.length;

    console.log('Starting conversation with turn order:', this.turnOrder);

    for (let i = 0; i < this.turnOrder.length; i++) {
      const clientId = this.turnOrder[i];
      console.log(`Processing turn ${i + 1}/${totalMessages} for client: ${clientId}`);

      const client = this.clients.get(clientId);
      if (!client) {
        console.warn(`No client found for ID: ${clientId}`);
        continue;
      }

      let role: LLMRole | undefined;
      const uniqueClients = new Set(this.turnOrder).size;
      if (i % uniqueClients === 0) {
        role = LLMRole.PRIMARY_RESPONDER;
      } else if ((i + 1) % uniqueClients === 0) {
        role = LLMRole.SYNTHESIZER;
      }

      this.onResponse?.(null, i, true, this.messageIndex);

      const context = this.buildConversationContext();
      const prompt = constructPrompt(role, client.personality, i + 1, totalMessages, userQuery, context.join('\n'), this.profession);

      try {
        console.log(`Generating response for ${clientId} with role: ${role}`);
        const response = await client.generateResponse({
          prompt: prompt,
          conversationHistory: context.join('\n'),
        });
        console.log(`Got response from ${clientId}:`, response.content.substring(0, 100) + '...');

        if (validateResponse(response)) {
          this.conversationHistory.push(response);
          responses.push(response);
          this.onResponse?.(response, i, false, this.messageIndex);
          this.messageIndex++;
        } else {
          console.warn(`Invalid response from ${clientId}`);
        }
      } catch (error) {
        console.error(`Error getting response from ${clientId}:`, error);
        this.onResponse?.(null, i, false, this.messageIndex);
        continue;
      }
    }

    console.log(`Conversation complete. Got ${responses.length} responses`);
    return responses;
  }

  private buildConversationContext(): string[] {
    // Return array of messages instead of concatenated string
    return this.conversationHistory.map((response) => {
      const rolePrefix = response.role ? `${response.role}:` : 'Response:';
      return `${rolePrefix}\n${response.content.trim()}`;
    });
  }
}
