import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { refactoringSuggesterPrompt } from '../prompts/refactoring-suggester.prompt.js';

export const refactoringSuggester: AgentDefinition = {
  description:
    'Identifies practical refactoring opportunities that improve code structure, readability, maintainability, and extensibility.',
  tools: [
    'Read',
    'Grep',
    'Glob',
    'Bash',
    'Skill',
    'mcp__github__*',
    'mcp__eslint__*'
  ],
  model: 'inherit',
  prompt: refactoringSuggesterPrompt
};
