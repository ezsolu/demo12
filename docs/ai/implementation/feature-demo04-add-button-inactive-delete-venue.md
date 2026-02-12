---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup
**How do we get started?**

- Prerequisites and dependencies
  - Running Laravel app and admin frontend in local docker setup.
  - Authenticated admin test account.
- Environment setup steps
  - Seed venue data with both `show` and `hide` values.
  - Prepare at least one venue candidate for delete testing.
- Configuration needed
  - Ensure admin auth middleware/guard is enabled in local environment.

## Code Structure
**How is the code organized?**

- Directory structure
  - Venue API logic in Venue module controllers/services.
  - Admin venue detail/list UI in existing admin pages/components.
- Module organization
  - Keep list-filter and delete behavior in existing venue domain boundaries.
- Naming conventions
  - Use explicit naming: `status`, `show`, `hide`, `all`, `deleteVenue`, `confirmDelete`.

## Implementation Notes
**Key technical details to remember:**

### Core Features
- Feature 1: List API status filter
  - Validate `status` query value in enum: `show|hide|all`.
  - Apply default `show` when param is absent.
  - For `all`, skip status condition.
- Feature 2: Admin-only delete API
  - Add/extend venue delete endpoint in Venue module.
  - Enforce admin authorization at route/controller/policy level.
  - Return consistent HTTP response shape per project conventions.
- Feature 3: Admin UI updates
  - Venue detail form: add status select using `show`/`hide` values directly.
  - Venue detail delete button: open confirm dialog with `Xac nhan` and `Huy`.
  - On confirm: call delete API, handle success/error, redirect to venue list on success.
  - Venue list page: add status filter UI with default `all`.

### Patterns & Best Practices
- Design patterns being used
  - Thin controller, service-based business logic where applicable.
- Code style guidelines
  - Follow existing module conventions for request validation and resources/transformers.
- Common utilities/helpers
  - Reuse existing toast/dialog/navigation utilities from admin frontend.

## Integration Points
**How do pieces connect?**

- API integration details
  - Frontend sends status filter in list requests.
  - Frontend sends delete request from detail page after explicit confirmation.
- Database connections
  - Reuse existing `venues` table status field and delete operation.
- Third-party service setup
  - None.

## Error Handling
**How do we handle failures?**

- Error handling strategy
  - Validate status param and return clear client error for invalid value.
  - For delete errors (403/404/409), show user-friendly message and stay on detail page.
- Logging approach
  - Log unexpected delete failures with venue id and admin id context.
- Retry/fallback mechanisms
  - No automatic retry for delete; allow user to retry manually from UI.

## Performance Considerations
**How do we keep it fast?**

- Optimization strategies
  - Keep status filtering in query builder/database layer.
- Caching approach
  - Not required for this feature scope.
- Query optimization
  - Ensure status predicate can use existing indexes (if present).
- Resource management
  - Avoid refetching large datasets after delete; redirect to list with existing pagination behavior.

## Security Notes
**What security measures are in place?**

- Authentication/authorization
  - Delete endpoint and status-management actions are restricted to admin users.
- Input validation
  - Strict enum validation for `status` parameter and form input mapping.
- Data encryption
  - No new encryption requirement introduced.
- Secrets management
  - No new secret introduced.

