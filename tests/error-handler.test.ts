import { describe, expect, it, vi } from 'vitest';

import {
  ErrorCodes,
  ReviewError,
  formatError,
  isReviewError,
  withRetry,
  withTimeout
} from '../src/utils/error-handler.js';

describe('Error Handler', () => {
  it('should create a ReviewError with a code and metadata', () => {
    const error = new ReviewError(
      'Something failed',
      ErrorCodes.AGENT_FAILED,
      { attempt: 1 }
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ReviewError);
    expect(error.name).toBe('ReviewError');
    expect(error.code).toBe(ErrorCodes.AGENT_FAILED);
    expect(error.metadata).toEqual({ attempt: 1 });
  });

  it('should identify ReviewError instances', () => {
    const reviewError = new ReviewError(
      'Timeout',
      ErrorCodes.AGENT_TIMEOUT
    );

    expect(isReviewError(reviewError)).toBe(true);
    expect(isReviewError(new Error('normal error'))).toBe(false);
    expect(isReviewError('error')).toBe(false);
  });

  it('should format ReviewError with its error code', () => {
    const error = new ReviewError(
      'Agent failed',
      ErrorCodes.AGENT_FAILED
    );

    expect(formatError(error)).toBe('[AGENT_FAILED] Agent failed');
  });

  it('should format normal Error instances', () => {
    expect(formatError(new Error('Normal failure'))).toBe(
      'Normal failure'
    );
  });

  it('should format unknown error values', () => {
    expect(formatError('unknown failure')).toBe('unknown failure');
  });

  it('should retry a failing operation and eventually succeed', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    let attempts = 0;

    const result = await withRetry(
      async () => {
        attempts++;

        if (attempts < 3) {
          throw new Error('temporary failure');
        }

        return 'success';
      },
      3,
      1
    );

    expect(result).toBe('success');
    expect(attempts).toBe(3);

    vi.restoreAllMocks();
  });

  it('should throw RETRY_EXHAUSTED after retries are exhausted', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    let attempts = 0;

    await expect(
      withRetry(
        async () => {
          attempts++;
          throw new Error('permanent failure');
        },
        2,
        1
      )
    ).rejects.toMatchObject({
      name: 'ReviewError',
      code: ErrorCodes.RETRY_EXHAUSTED
    });

    expect(attempts).toBe(3);

    vi.restoreAllMocks();
  });

  it('should return the operation result before the timeout', async () => {
    const result = await withTimeout(
      async () => 'completed',
      1000
    );

    expect(result).toBe('completed');
  });

  it('should reject with AGENT_TIMEOUT when the operation exceeds the timeout', async () => {
    await expect(
      withTimeout(
        () =>
          new Promise<string>((resolve) => {
            setTimeout(() => resolve('too late'), 50);
          }),
        5,
        'Test operation timed out'
      )
    ).rejects.toMatchObject({
      name: 'ReviewError',
      code: ErrorCodes.AGENT_TIMEOUT,
      message: 'Test operation timed out'
    });
  });
});
