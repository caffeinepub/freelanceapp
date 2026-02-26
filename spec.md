# Specification

## Summary
**Goal:** Fix the role selection page so it never pre-populates a previously chosen role, and fix login redirect logic so users with an existing role bypass the role selection page entirely.

**Planned changes:**
- Update `RoleSelectionPage` to always start with no role pre-selected, ignoring any previously stored role in local/session storage or component state.
- Ensure both Customer and Freelancer options render in an equal, unselected state on page load, with the confirm/continue action disabled until the user actively selects a role.
- Update `LoginPage` redirect logic so that authenticated users who already have a role stored in the backend are sent directly to their role-appropriate dashboard, skipping the role selection page.
- Only users with no stored role are shown the role selection onboarding page.

**User-visible outcome:** Users who already have a role assigned are taken straight to their dashboard after login. Users without a role see a clean, unselected role selection screen where they must actively choose before continuing.
