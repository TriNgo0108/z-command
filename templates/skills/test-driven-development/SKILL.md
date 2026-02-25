---
name: test-driven-development
description: Guide for RED-GREEN-REFACTOR cycle. Use when writing tests or implementing features with TDD.
license: MIT
---

# Test-Driven Development

Follow the RED-GREEN-REFACTOR cycle for all development work.

## Process

### 1. RED - Write a Failing Test

- Write a test that describes the desired behavior
- Run the test to confirm it fails
- The test should fail for the right reason

### 2. GREEN - Make It Pass

- Write the minimum code to make the test pass
- Don't over-engineer or add extra features
- Focus only on passing the current test

### 3. REFACTOR - Clean Up

- Improve code quality without changing behavior
- Remove duplication
- Improve naming and structure
- All tests should still pass

## Anti-Patterns to Avoid

- Writing code before tests
- Writing multiple tests before making any pass
- Refactoring while tests are failing
- Testing implementation details instead of behavior
- Skipping the refactor step

## Best Practices

- Keep tests fast and isolated
- Test behavior, not implementation
- One assertion per test when possible
- Use descriptive test names
- Mock external dependencies


## Parent Hub
- [_testing-qa-mastery](../_testing-qa-mastery/SKILL.md)


## Part of Workflow
This skill is utilized in the following sequential workflows:
- [_workflow-feature-lifecycle](../_workflow-feature-lifecycle/SKILL.md)
- [_workflow-data-pipeline](../_workflow-data-pipeline/SKILL.md)
