import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { testCoverageAnalyzerPrompt } from '../prompts/test-coverage-analyzer.prompt.js';

export const testCoverageAnalyzer: AgentDefinition = {
  description:
    'Analyzes pull-request changes for test coverage gaps, missing edge cases, regression risks, and test quality.',
  tools: [
    'Read',
    'Grep',
    'Glob',
    'Bash',
    'Skill',
    'mcp__github__*'
  ],
  model: 'inherit',
  prompt: testCoverageAnalyzerPrompt
};
