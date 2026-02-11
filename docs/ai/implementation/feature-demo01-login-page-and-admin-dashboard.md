---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup
**How do we get started?**

- Ensure Laravel API and Next.js frontend are running locally.
- Configure API base URL in Next.js environment variables.
- Verify Tailwind CSS is enabled for the frontend.
- Confirm Sanctum stateful domains and CSRF cookie endpoint.

## Code Structure
**How is the code organized?**

- Next.js pages for `login` and `admin/dashboard`.
- Reusable UI components for inputs, buttons, and alerts.
- Auth utilities for login API calls and auth state management.
- Optional middleware/route guard for admin-only routes.

## Implementation Notes
**Key technical details to remember:**

### Core Features
- Login page: form with email/password, validation, loading state, error banner.
- Auth API: call Sanctum CSRF endpoint, then `POST /login`.
- Role enforcement: backend validates `role = 1` and returns 403 if non-admin.
- Dashboard page: simple layout with placeholder content for admin features.
- Logout flow: `POST /logout`, clear client auth state, redirect to home.
- Session check: call `GET /api/user` to confirm authenticated admin.

### Patterns & Best Practices
- Keep UI components small and reusable.
- Centralize API calls in a single client module.
- Use cookie-based auth and avoid storing tokens in insecure storage.
- Use Tailwind utility classes for consistent styling.

## Integration Points
**How do pieces connect?**

- Frontend calls `GET /sanctum/csrf-cookie`, then `POST /login`.
- On success, rely on session cookies and redirect to dashboard.
- On failure, show error message and stay on login page.
- Frontend calls `POST /logout` from dashboard and redirects to home.
- Frontend can call `GET /api/user` on load to protect routes.

## Error Handling
**How do we handle failures?**

- Show inline validation for missing fields.
- Map 401/403 responses to user-friendly messages (use response body if provided).
- Handle network errors with retry guidance.

## Performance Considerations
**How do we keep it fast?**

- Keep login page lightweight and avoid heavy client-side logic.
- Use server-side redirects if auth state is available at request time.

## Security Notes
**What security measures are in place?**

- Admin role enforced on backend.
- Avoid exposing sensitive data in client logs.
- Ensure CSRF protections align with Laravel Sanctum configuration.
