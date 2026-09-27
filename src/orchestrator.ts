import { query } from '@anthropic-ai/claude-agent-sdk';
import type { SDKMessage } from '@anthropic-ai/claude-agent-sdk';

import { mcpServersConfig } from './config/mcp.config.js';
import {
  codeQualityAnalyzer,
  testCoverageAnalyzer,
  refactoringSuggester
} from './agents/index.js';
import { orchestratorPrompt } from './prompts/orchestrator.prompt.js';
import {
  ReviewReportSchema,
  ReviewReportJSONSchema,
  type ReviewReport
} from './types/report-types.js';
import { globalRateLimiter, RateLimiter } from './utils/rate-limiter.js';
import { withRetry, withTimeout } from './utils/error-handler.js';

export interface OrchestratorOptions {
  model?: string;
  rateLimiter?: RateLimiter;
}

export class CodeReviewOrchestrator {
  private readonly model: string;
  private readonly rateLimiter: RateLimiter;

  constructor(options: OrchestratorOptions = {}) {
    this.model = options.model || process.env.ANTHROPIC_MODEL || '';

    if (!this.model) {
      throw new Error('ANTHROPIC_MODEL is required.');
    }

    this.rateLimiter = options.rateLimiter || globalRateLimiter;
  }

  async reviewPullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<ReviewReport> {
    const startedAt = Date.now();

    if (!owner || !repo || !Number.isInteger(prNumber) || prNumber <= 0) {
      throw new Error('Invalid pull request information.');
    }

    await this.rateLimiter.acquire();

    try {
      const prompt = `
${orchestratorPrompt}

Review this pull request:

Repository owner: ${owner}
Repository: ${repo}
Pull request number: ${prNumber}

Use the GitHub MCP tools to inspect the actual pull request, changed files,
diffs, and relevant repository tests.

Delegate the analysis using the Task tool to all three registered agents:
- code-quality-analyzer
- test-coverage-analyzer
- refactoring-suggester

Run the specialized analyses independently where possible, then combine their
results into the final ReviewReport.

Every fileReviews entry must contain valid results for all three analysis
categories. If an agent fails, continue the review and provide an empty,
schema-valid result for that category rather than failing the entire review.

Return ONLY data matching the ReviewReport schema.
`;

      const executeReview = async (): Promise<
        Extract<SDKMessage, { type: 'result' }>
      > => {
        const response = query({
          prompt,
          options: {
            model: this.model,
            allowedTools: [
              'Task',
              'Read',
              'Grep',
              'Glob',
              'Bash',
              'Skill',
              'mcp__github__*',
              'mcp__eslint__*'
            ],
            permissionMode: 'bypassPermissions',
            allowDangerouslySkipPermissions: true,
            mcpServers: mcpServersConfig,
            agents: {
              'code-quality-analyzer': codeQualityAnalyzer,
              'test-coverage-analyzer': testCoverageAnalyzer,
              'refactoring-suggester': refactoringSuggester
            },
            outputFormat: {
              type: 'json_schema',
              schema: ReviewReportJSONSchema
            }
          }
        });

        let resultMessage:
          | Extract<SDKMessage, { type: 'result' }>
          | undefined;

        for await (const message of response) {
          if (message.type === 'result') {
            resultMessage = message;
          }
        }

        if (!resultMessage) {
          throw new Error('Claude Agent SDK did not return a result.');
        }

        return resultMessage;
      };

      const resultMessage = await withRetry(
        () =>
          withTimeout(
            executeReview,
            120_000,
            'Code review timed out after 120 seconds.'
          ),
        2,
        1_000
      );

      if (resultMessage.subtype !== 'success') {
        const errors = 'errors' in resultMessage
          ? resultMessage.errors.join('; ')
          : 'Unknown SDK execution error';

        throw new Error(`Code review failed: ${errors}`);
      }

      if (!resultMessage.structured_output) {
        throw new Error('Claude returned no structured review output.');
      }

      const validation = ReviewReportSchema.safeParse(
        resultMessage.structured_output
      );

      if (!validation.success) {
        throw new Error(
          `Invalid structured review output: ${validation.error.message}`
        );
      }

      const parsed = validation.data;

      return {
        ...parsed,
        pullRequest: {
          owner,
          repo,
          number: prNumber
        },
        metadata: {
          ...parsed.metadata,
          analyzedAt: new Date().toISOString(),
          duration: Date.now() - startedAt,
          agentVersions: {
            'code-quality-analyzer': 'inherit',
            'test-coverage-analyzer': 'inherit',
            'refactoring-suggester': 'inherit'
          }
        }
      };
    } finally {
      this.rateLimiter.release();
    }
  }
}
