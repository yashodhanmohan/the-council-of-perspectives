# Rules of the Game

This document defines the rules and guidelines for orchestrating conversations between multiple Large Language Models (LLMs) in our system.

## 1. Conversation Structure

### 1.1 Turn Taking

- Each LLM gets one turn to respond in a sequential order
- No LLM can interrupt another LLM's turn
- The order of turns will be predetermined at the start of each conversation

### 1.2 Message Format

- All messages must be in plain text
- Limited markdown formatting is allowed:
  - **Bold** for emphasis
  - _Italics_ for highlighting key terms
  - Basic bullet points for lists
- Each message should include:
  - Role identifier at the start (e.g., "Primary Responder:")
  - The actual response content
  - Any necessary references or citations in parentheses

## 2. Conversation Rules

### 2.1 Basic Interaction Rules

- LLMs must stay within their assigned roles
- LLMs must acknowledge and build upon previous responses
- No contradicting or invalidating other LLMs' valid statements
- Each response should add value to the conversation

### 2.2 Context Preservation

- LLMs must maintain conversation context
- Previous messages in the thread must be considered
- Context window limitations must be respected

## 3. Role Definitions

### 3.1 Primary Responder

- Provides the initial response to user queries
- Sets the main direction of the conversation
- Has the authority to make definitive statements

### 3.2 Fact Checker

- Verifies factual claims made by other LLMs
- Provides corrections when necessary
- Cites sources when possible

### 3.3 Synthesizer

- Combines and summarizes multiple LLM responses
- Resolves conflicts between different viewpoints
- Presents unified conclusions

## 4. Error Handling

### 4.1 Contradiction Resolution

- When LLMs provide conflicting information, the Fact Checker role takes precedence
- Contradictions must be explicitly addressed and resolved
- The resolution process must be transparent to the user

## 5. Discussion Summary

### 5.1 Meeting Minutes

- The last responding LLM must provide comprehensive meeting minutes
- The summary must include:
  - Key points discussed
  - Decisions made
  - Areas of agreement and disagreement
  - Action items or conclusions reached
  - References to important sources or citations used
  - Timeline of the discussion flow

### 5.2 Summary Format

- The summary should be structured in chronological order
- Must highlight the contribution of each participating LLM
- Should include metadata:
  - Duration of discussion
  - Number of turns taken
  - List of participating LLMs
  - Roles played by each LLM
- Any unresolved points or areas requiring further discussion

## 6. Prompt Structure

### 6.1 Base Game Prompt

- Every LLM receives a base prompt that explains:
  - The collaborative nature of the discussion
  - The existence of other LLM participants
  - The basic rules of interaction
  - The turn-taking mechanism
  - The expected format for responses

### 6.2 Role-Specific Prompts

- Each LLM receives a role definition prompt that includes:
  - Their specific role (Primary Responder, Fact Checker, or Synthesizer)
  - Their responsibilities and limitations
  - Examples of appropriate responses for their role
  - Guidelines for interacting with other roles

### 6.3 Problem Statement Integration

- The complete prompt for each LLM will be constructed by combining:
  1. Base game prompt
  2. Role-specific prompt
  3. The user's problem statement or question
- The order of these components is fixed and must not be altered
- Each component must be clearly separated with markdown dividers
- Previous conversation context will be appended after these components

### 6.4 Prompt Updates

- Base game prompt and role-specific prompts remain constant during a conversation
- Only the problem statement and conversation context are dynamic
- LLMs must maintain awareness of their role and game rules throughout the entire discussion

### 6.5 Professional Personalities

Each LLM can be assigned one of the following professional personalities to provide specialized expertise:

#### Available Personalities

- **Innovator**: Focuses on creative and novel solutions
- **Optimizer**: Specializes in performance and efficiency improvements
- **Architect**: Designs scalable system solutions
- **Developer**: Provides practical implementation guidance
- **Analyst**: Performs detailed technical analysis
- **Consultant**: Offers strategic technical advice
- **Researcher**: Conducts deep technical investigation
- **Mentor**: Explains and guides technical learning

### 6.6 Personality Integration

- Each LLM combines their role (Primary Responder, Fact Checker, or Synthesizer) with a professional personality
- The professional personality influences the perspective and expertise brought to the role
- Responses should reflect both the role's responsibilities and the professional expertise
- The personality should enhance the LLM's ability to provide specialized insights

---

Note: This is a living document and will be updated as we learn more about effective LLM orchestration patterns and requirements.
