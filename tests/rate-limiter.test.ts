import { describe, expect, it } from 'vitest';

import {
  DEFAULT_RATE_LIMITS,
  RateLimiter,
  withRateLimit
} from '../src/utils/rate-limiter.js';

describe('RateLimiter', () => {
  it('should expose the expected default limits', () => {
    expect(DEFAULT_RATE_LIMITS.maxRequestsPerMinute).toBe(50);
    expect(DEFAULT_RATE_LIMITS.maxTokensPerMinute).toBe(100000);
    expect(DEFAULT_RATE_LIMITS.maxConcurrent).toBe(5);
  });

  it('should allow a request when limits are available', () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 2,
      maxTokensPerMinute: 2000,
      maxConcurrent: 1
    });

    expect(limiter.canProceed(1000)).toBe(true);
  });

  it('should reject a request when the request-per-minute limit is reached', async () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 1,
      maxTokensPerMinute: 10000,
      maxConcurrent: 2
    });

    await limiter.acquire(1000);

    expect(limiter.canProceed(1000)).toBe(false);

    limiter.release();
  });

  it('should reject a request when the token-per-minute limit would be exceeded', async () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 10,
      maxTokensPerMinute: 1000,
      maxConcurrent: 2
    });

    await limiter.acquire(1000);

    expect(limiter.canProceed(1)).toBe(false);

    limiter.release();
  });

  it('should track active requests and release them correctly', async () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 10,
      maxTokensPerMinute: 10000,
      maxConcurrent: 2
    });

    await limiter.acquire(500);

    expect(limiter.getStatus().activeRequests).toBe(1);
    expect(limiter.getStatus().requestsInWindow).toBe(1);
    expect(limiter.getStatus().tokensInWindow).toBe(500);

    limiter.release();

    expect(limiter.getStatus().activeRequests).toBe(0);
  });

  it('should not allow active requests to become negative', () => {
    const limiter = new RateLimiter();

    limiter.release();
    limiter.release();

    expect(limiter.getStatus().activeRequests).toBe(0);
  });

  it('should execute an operation through withRateLimit', async () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 10,
      maxTokensPerMinute: 10000,
      maxConcurrent: 1
    });

    const result = await withRateLimit(
      limiter,
      async () => 'success',
      100
    );

    expect(result).toBe('success');
    expect(limiter.getStatus().activeRequests).toBe(0);
  });
});
