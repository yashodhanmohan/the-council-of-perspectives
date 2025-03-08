import { BASE_GAME_PROMPT, getPersonalityPrompt, Personality, Profession, ROLE_SPECIFIC_PROMPTS } from '../constants';
import { LLMResponse, LLMRole } from '../types/llm';

/**
 * Combines the base prompt, role prompt, personality, and user query into a complete prompt
 */
export function constructPrompt(
  role: LLMRole | undefined,
  personality: Personality,
  messageNumber: number,
  totalMessages: number,
  userQuery: string,
  conversationContext: string = '',
  profession: Profession
): string {
  // Determine position-specific instructions
  let positionContext = '';
  if (messageNumber === 1) {
    positionContext = '\nYou are the first responder. Set the initial direction for the conversation.';
  } else if (messageNumber === totalMessages) {
    positionContext = '\nYou are the final responder. Synthesize all previous responses into a comprehensive conclusion.';
  } else {
    positionContext = '\nAdd your unique perspective to the ongoing conversation.';
  }

  // Only include role-specific prompts for first and last LLMs
  const rolePrompt = role ? `\n\n${ROLE_SPECIFIC_PROMPTS[role]}` : '';

  return `${BASE_GAME_PROMPT}

---

You are message ${messageNumber} of ${totalMessages}.${rolePrompt}${positionContext}

---

${getPersonalityPrompt(profession, personality)}

---

User Query: ${userQuery}

${conversationContext ? `---\n\nConversation Context:\n${conversationContext}` : ''}`;
}

/**
 * Validates that an LLM response follows the required format
 */
export function validateResponse(response: LLMResponse): boolean {
  if (!response.content) {
    return false;
  }

  // Allow responses without roles
  if (response.role && !Object.values(LLMRole).includes(response.role)) {
    return false;
  }

  return true;
}
