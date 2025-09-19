# Claude Development Methodology

## 🧠 Step-by-Step Problem Solving Framework

This is our agreed methodology for all development tasks.

### 📋 1. Problem Identification
- Clearly define the issue with specific symptoms
- Identify the trigger/action that causes the problem
- Note any error messages or console logs
- Gather context (browser, device, user flow)

### 🔍 2. Code Structure Analysis
- Examine the relevant component/function structure
- Analyze current styling approach (CSS, Tailwind, etc.)
- Map parent-child relationships
- Identify dependencies and imports

### 🎯 3. Root Cause Investigation
- Check for common issues:
  - Z-index conflicts
  - Overflow/positioning problems
  - Container dimension issues
  - Responsive breakpoint problems
  - State management issues
  - API endpoint problems

### 💡 4. Solution Strategy
- Prioritize minimal impact changes
- Ensure cross-browser compatibility
- Follow mobile-first approach
- Consider performance implications

### 🔧 5. Implementation with Explanation
- Explain the "why" behind each change
- Provide before/after code comparisons
- Assess potential impact of changes
- Use clear, descriptive comments

### ✅ 6. Verification Plan
- Define test scenarios
- Consider edge cases
- Plan for regression testing

### 🔗 7. Dependency Analysis
- Check 3rd party component errors (React, Next.js, Radix UI, etc.)
- Verify package versions and compatibility
- Investigate component prop requirements
- Check for breaking changes in dependencies

### 🧪 8. Incremental Testing
- Test after each individual change
- Validate intermediate states
- Catch regressions early
- Document what works vs what breaks

### 🗂️ 9. Cache Invalidation
- Framework-specific cache clearing (Next.js, browser cache)
- Hard refresh when needed (Cmd/Ctrl + Shift + R)
- Clear local storage/session storage if relevant
- Restart development server when configuration changes

## 📌 Notes
- Always ask for specific symptoms before starting
- Use console logs for debugging when needed
- Prefer existing patterns and conventions in the codebase
- Keep changes focused and atomic
- Test thoroughly before marking tasks as complete

**Last Updated:** 2025-01-18
**Applied To:** All development tasks going forward