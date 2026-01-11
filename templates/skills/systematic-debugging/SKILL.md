---
name: systematic-debugging
description: 4-phase root cause debugging process. Use when fixing bugs or investigating issues.
license: MIT
---

# Systematic Debugging

A structured approach to finding and fixing bugs.

## Phase 1: Reproduce

- Confirm the bug exists
- Document exact steps to reproduce
- Identify the expected vs actual behavior
- Create a minimal test case

## Phase 2: Isolate

- Narrow down the problem area
- Use binary search to find the failing component
- Add logging or breakpoints strategically
- Check recent changes that might have caused the issue

## Phase 3: Identify Root Cause

- Don't just fix symptoms
- Trace the issue to its origin
- Understand WHY it's happening
- Consider related areas that might be affected

## Phase 4: Fix and Verify

- Make the minimal fix required
- Add a regression test
- Verify the fix doesn't break other functionality
- Document the fix for future reference

## Techniques

### Root Cause Tracing

- Follow the data flow backwards
- Check all inputs and outputs
- Verify assumptions at each step

### Defense in Depth

- Add validation at multiple layers
- Fail fast with clear error messages
- Log important state changes

### Condition-Based Waiting

- Avoid arbitrary sleep/delays
- Wait for specific conditions
- Use timeouts with clear error messages
