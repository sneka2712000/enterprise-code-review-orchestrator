import { describe, expect, it } from 'vitest';

import {
  ReviewReportJSONSchema,
  ReviewReportSchema
} from '../src/types/report-types.js';

describe('ReviewReport schema', () => {
  const baseReport = {
    pullRequest: {
      owner: 'airaamane',
      repo: 'simple-todo-app',
      number: 1
    },
    fileReviews: [],
    summary: {
      totalFiles: 0,
      overallScore: 0,
      criticalIssues: 0,
      highPriorityTests: 0,
      refactoringOpportunities: 0
    },
    recommendations: [],
    metadata: {
      analyzedAt: new Date().toISOString(),
      duration: 0,
      agentVersions: {}
    }
  };

  it('should accept an empty but structurally valid report', () => {
    expect(ReviewReportSchema.safeParse(baseReport).success).toBe(true);
  });

  it('should reject a non-positive pull request number when the type is invalid', () => {
    const invalid = {
      ...baseReport,
      pullRequest: {
        ...baseReport.pullRequest,
        number: '1'
      }
    };

    expect(ReviewReportSchema.safeParse(invalid).success).toBe(false);
  });

  it('should reject an invalid recommendation priority', () => {
    const invalid = {
      ...baseReport,
      recommendations: [
        {
          priority: 'urgent',
          category: 'security',
          description: 'Invalid priority',
          files: []
        }
      ]
    };

    expect(ReviewReportSchema.safeParse(invalid).success).toBe(false);
  });

  it('should expose a JSON Schema object for SDK structured output', () => {
    expect(ReviewReportJSONSchema).toBeDefined();
    expect(typeof ReviewReportJSONSchema).toBe('object');
    expect(ReviewReportJSONSchema).toHaveProperty('type');
    expect(ReviewReportJSONSchema).toHaveProperty('properties');
  });
});
