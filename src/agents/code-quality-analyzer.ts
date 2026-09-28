import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { codeQualityAnalyzerPrompt } from '../prompts/code-quality-analyzer.prompt.js';

export const codeQualityAnalyzer: AgentDefinition = {
  description:
    'Analyzes pull-request code for quality, maintainability, TypeScript and JavaScript best practices, performance, security, and common coding pitfalls.',
  tools: [
    'Read',
    'Grep',
    'Glob',
    'Bash',
    'Skill',
    'mcp__github__*',
  ],
  model: 'inherit',
  prompt: `
${codeQualityAnalyzerPrompt}

## Claude Skills

Use the project Claude Skills during your analysis.

### TypeScript files

For .ts and .tsx files:
1. Read the file with the Read tool.
2. Invoke and apply the guidance from:
   .claude/skills/typescript-patterns/SKILL.md

### JavaScript files

For .js and .jsx files:
1. Read the file with the Read tool.
2. Invoke and apply the guidance from:
   .claude/skills/javascript-best-practices/SKILL.md

### Security analysis

For ALL reviewed files:
1. Read the relevant file with the Read tool.
2. Invoke and apply:
   .claude/skills/security-analysis/SKILL.md

### Performance analysis

When reviewing performance-sensitive code:
1. Read the relevant file with the Read tool.
2. Invoke and apply:
   .claude/skills/performance-optimization/SKILL.md

Do not merely mention the skills. Use their guidance when analyzing the
actual pull-request code.

Do not invent files, line numbers, vulnerabilities, or performance problems.
Base all findings on the actual repository and pull-request changes.
`
};
