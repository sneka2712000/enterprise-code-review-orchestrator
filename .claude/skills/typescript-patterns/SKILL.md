# TypeScript Patterns Skill

## Purpose

Use this skill when reviewing TypeScript code to identify type-safety issues,
modern TypeScript patterns, maintainability problems, and common type-related
mistakes.

## Type Safety

Check for:

- Avoiding `any` unless there is a justified reason
- Prefer explicit types for public APIs
- Correct use of `unknown` instead of unsafe `any`
- Proper null and undefined handling
- Avoiding unnecessary type assertions
- Correct function parameter and return types
- Safe handling of optional properties
- Appropriate use of union and intersection types

## Modern TypeScript

Prefer:

- `const` where reassignment is unnecessary
- Union types instead of loosely typed values
- Type aliases and interfaces where appropriate
- Optional chaining (`?.`)
- Nullish coalescing (`??`)
- Generics for reusable typed functions
- Discriminated unions for related variants
- Utility types such as `Pick`, `Omit`, `Partial`, and `Record`
- `satisfies` when it improves type checking without widening types

## Common Problems

Look for:

- `any` hiding potential bugs
- Incorrect type assertions
- Non-null assertions (`!`) without justification
- Nullable values used without checks
- Inconsistent interfaces
- Duplicate or conflicting types
- Overly broad types such as `object` or `{}` 
- Incorrect generic constraints
- Unsafe access to external/API data
- Type definitions that do not match runtime behavior

## Error Handling

Check that:

- Errors are typed safely
- `catch` variables are handled as `unknown` when appropriate
- External data is validated before use
- Functions do not silently ignore errors

## Review Output

For each issue provide:

1. File path
2. Line number or line range when available
3. Description of the TypeScript issue
4. Why it matters
5. Severity: critical, high, medium, low, or info
6. A concrete fix
7. A code example when useful

Do not invent files, line numbers, types, or problems.
Base findings only on the actual code being reviewed.
