import { describe, expect, it } from 'vitest';

import { CodeReviewOrchestrator } from '../src/orchestrator.js';
import {
  ReviewReportSchema,
  type ReviewReport
} from '../src/types/report-types.js';
import { RateLimiter } from '../src/utils/rate-limiter.js';

describe('CodeReviewOrchestrator', () => {
  describe('Configuration', () => {
    it('should initialize with default options', () => {
      const orchestrator = new CodeReviewOrchestrator();

      expect(orchestrator).toBeInstanceOf(CodeReviewOrchestrator);
    });

    it('should accept custom rate limit configuration', () => {
      const rateLimiter = new RateLimiter({
        maxRequestsPerMinute: 2,
        maxTokensPerMinute: 5000,
        maxConcurrent: 1
      });

      const orchestrator = new CodeReviewOrchestrator({
        model: 'claude-sonnet-4-5-20250929',
        rateLimiter
      });

      expect(orchestrator).toBeInstanceOf(CodeReviewOrchestrator);
      expect(rateLimiter.getStatus().activeRequests).toBe(0);
      expect(rateLimiter.getStatus().requestsInWindow).toBe(0);
    });
  });

  describe('reviewPullRequest', () => {
    it('should reject invalid pull request information', async () => {
      const orchestrator = new CodeReviewOrchestrator({
        rateLimiter: new RateLimiter({
          maxRequestsPerMinute: 10,
          maxTokensPerMinute: 10000,
          maxConcurrent: 1
        })
      });

      await expect(
        orchestrator.reviewPullRequest('', 'repo', 1)
      ).rejects.toThrow('Invalid pull request information.');

      await expect(
        orchestrator.reviewPullRequest('owner', '', 1)
      ).rejects.toThrow('Invalid pull request information.');

      await expect(
        orchestrator.reviewPullRequest('owner', 'repo', 0)
      ).rejects.toThrow('Invalid pull request information.');

      await expect(
        orchestrator.reviewPullRequest('owner', 'repo', 1.5)
      ).rejects.toThrow('Invalid pull request information.');
    });

    it('should accept a valid positive integer pull request number', () => {
      const orchestrator = new CodeReviewOrchestrator();

      expect(orchestrator).toBeInstanceOf(CodeReviewOrchestrator);
    });
  });

  describe('ReviewReport schema', () => {
    const validReport: ReviewReport = {
      pullRequest: {
        owner: 'airaamane',
        repo: 'simple-todo-app',
        number: 1
      },
      fileReviews: [
        {
          file: 'src/todo.js',
          codeQuality: {
            file: 'src/todo.js',
            issues: [],
            overallScore: 90,
            summary: 'No significant code quality issues found.'
          },
          testCoverage: {
            file: 'src/todo.js',
            hasTests: true,
            testFiles: ['test/todo.test.js'],
            untestedPaths: [],
            coverageEstimate: 90,
            summary: 'Core functionality is covered by tests.'
          },
          refactorings: {
            file: 'src/todo.js',
            suggestions: [],
            summary: 'No significant refactoring required.'
          }
        }
      ],
      summary: {
        totalFiles: 1,
        overallScore: 90,
        criticalIssues: 0,
        highPriorityTests: 0,
        refactoringOpportunities: 0
      },
      recommendations: [],
      metadata: {
        analyzedAt: new Date().toISOString(),
        duration: 1000,
        agentVersions: {
          'code-quality-analyzer': 'inherit',
          'test-coverage-analyzer': 'inherit',
          'refactoring-suggester': 'inherit'
        }
      }
    };

    it('should validate a correctly structured ReviewReport', () => {
      const result = ReviewReportSchema.safeParse(validReport);

      expect(result.success).toBe(true);
    });

    it('should reject an invalid ReviewReport', () => {
      const invalidReport = {
        ...validReport,
        pullRequest: {
          ...validReport.pullRequest,
          number: 'invalid'
        }
      };

      const result = ReviewReportSchema.safeParse(invalidReport);

      expect(result.success).toBe(false);
    });
  });

  describe('Integration', () => {
    // Requires a real Claude API configuration and a public GitHub PR.
    it.skip('should review a real small PR', async () => {
      const orchestrator = new CodeReviewOrchestrator();

      const report = await orchestrator.reviewPullRequest(
        'airaamane',
        'simple-todo-app',
        1
      );

      expect(report.pullRequest.owner).toBe('airaamane');
      expect(report.pullRequest.repo).toBe('simple-todo-app');
      expect(report.pullRequest.number).toBe(1);
      expect(ReviewReportSchema.safeParse(report).success).toBe(true);
    });
  });
});
