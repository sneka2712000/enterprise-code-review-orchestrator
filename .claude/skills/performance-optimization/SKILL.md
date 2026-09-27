# Performance Optimization Skill

## Purpose

Use this skill when reviewing code for unnecessary work, inefficient algorithms,
resource usage, and performance bottlenecks.

## Algorithmic Efficiency

Check for:

- Unnecessary nested loops
- Repeated processing of the same data
- Inefficient searches
- Avoidable sorting
- Poor time or space complexity
- Operations that can be reduced or combined safely

Consider Big-O complexity when it helps explain the issue.

## Memory and Resource Usage

Check for:

- Unnecessary object or array creation
- Large data structures kept in memory unnecessarily
- Resource leaks
- Unclosed files, connections, or streams
- Unnecessary duplication of data
- Excessive caching

## Async and Concurrency

Check for:

- Sequential async operations that could safely run concurrently
- Missing error handling for concurrent operations
- Unnecessary blocking operations
- Excessive parallel requests
- Unbounded concurrency

Use concurrency carefully when operations have dependencies or rate limits.

## Database and API Performance

When applicable, check for:

- Repeated API calls
- N+1 request patterns
- Unnecessary data retrieval
- Missing pagination
- Repeated database queries
- Fetching data that is not required

## Code-Level Optimization

Check for:

- Repeated calculations
- Expensive operations inside loops
- Unnecessary conversions
- Excessive serialization/deserialization
- Inefficient string or collection operations

Avoid recommending micro-optimizations without a meaningful performance benefit.

## Maintainability

Performance improvements should not unnecessarily make the code difficult to
understand.

Prefer simple optimizations with a clear benefit over complicated rewrites.

## Review Output

For each performance finding provide:

1. File path
2. Line number or line range when available
3. Performance concern
4. Why it may affect performance
5. Severity: critical, high, medium, low, or info
6. Concrete optimization
7. Before/after code example when useful

Do not invent performance problems or assume behavior that cannot be verified.
Base findings only on the actual code being reviewed.
