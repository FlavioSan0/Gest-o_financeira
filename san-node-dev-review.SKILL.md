---
name: san-node-dev-review
description: 'Skill to support San_Node development in Next.js, React, Tailwind, shadcn/ui, Prisma, Supabase, Neon, Express, Google Apps Script, and Google Sheets/Forms automations.'
disable-model-invocation: true
argument-hint: Describe the bug, review, improvement, or feature you want help with.
---

When to use:
- Use this skill for bug fixes, code reviews, component improvements, terminal error analysis, security reviews, project structure organization, database flow design, UX/UI adjustments, or new feature implementation in San_Node systems.

Goal:
- Analyze the issue first, explain the likely root cause, then apply the smallest necessary change to resolve it.
- Preserve existing functionality and identity unless the user explicitly asks for changes.
- Keep recommendations secure, minimal, and easy to test.

Rules:
- Analyze before editing any files. Explain the probable cause and expected impact.
- Make the smallest code change necessary to fix the problem.
- Do not remove existing functionality without warning the user first.
- Do not change visual identity or major UI layout unless the user explicitly requests it.
- Do not install new libraries without explicit justification.
- Do not modify database schemas, migrations, Prisma models, or Supabase/Neon setup without explaining the impact clearly.
- Do not execute destructive commands (like reset/migrate/drop) without explicit user confirmation.
- Prioritize security from the start: authentication, authorization, validation, permissions, environment variables, RLS, route protection, uploads, logs, backups, and LGPD compliance.
- For UI changes, favor clean, responsive layouts with good hierarchy, spacing, and minimal visual noise.
- When making code changes, summarize the modified files and provide easy test steps.
- When possible, suggest or run relevant validations such as `npm run lint`, `npm run build`, `npx prisma validate`, and relevant tests.
- Prefer applying complete file changes and clear diffs instead of isolated fragments when working in the users project.

Workflow:
1. Read the user request and identify the exact goal.
2. Determine whether the task is bug fixing, review, refactor, security, UI, or feature work.
3. Locate the relevant files, routes, and services in the workspace.
4. Inspect the code and runtime information to identify the probable root cause.
5. Explain the cause and why the chosen fix is appropriate.
6. Apply the minimal change needed, keeping the rest of the codebase intact.
7. Note any database, migration, or auth impacts explicitly.
8. Provide testing instructions and recommended validation commands.

Clarify when needed:
- If the request is ambiguous, ask whether the user wants a code fix, security review, UI change, performance improvement, or architecture recommendation.
- Ask whether changes should be limited to a single file or may touch related services, components, or routes.
- Ask whether authentication/authorization behavior should be preserved exactly or updated.

Example prompts to use this skill:
- "Review this Next.js + Prisma bug and fix the authentication flow." 
- "Improve the dashboard UI for mobile and make sure the form validation stays secure." 
- "Analyze this Supabase row-level security rule and explain the vulnerability." 
- "Help me add a new API route for Neon while keeping the existing feature intact."
