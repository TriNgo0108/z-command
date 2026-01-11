---
name: writing-plans
description: Create detailed implementation plans. Use when planning new features or refactoring work.
license: MIT
---

# Writing Implementation Plans

Create clear, actionable implementation plans that can be executed step-by-step.

## Plan Structure

### 1. Goal Description

- What problem are we solving?
- What is the desired outcome?
- What are the success criteria?

### 2. Background Context

- Current state of the system
- Relevant constraints
- Prior decisions and their rationale

### 3. Proposed Changes

Group by component, ordered by dependency:

```markdown
### Component Name

#### [MODIFY] filename.ts

- Change X to Y
- Add validation for Z

#### [NEW] newfile.ts

- Purpose of this file
- Key responsibilities
```

### 4. Implementation Steps

Numbered, atomic steps:

1. Create the new module
2. Add tests for the new functionality
3. Integrate with existing code
4. Update documentation

### 5. Verification Plan

- Unit tests to add
- Integration tests needed
- Manual verification steps

## Best Practices

- Keep steps small and atomic
- Include rollback considerations
- Identify risks and mitigations
- Estimate effort for each step
- Mark dependencies between steps
