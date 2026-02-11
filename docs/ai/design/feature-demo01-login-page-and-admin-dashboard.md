---
phase: design
title: System Design & Architecture
description: Define the technical architecture, components, and data models
---

# System Design & Architecture

## Architecture Overview
**What is the high-level system structure?**

- Mermaid diagram of the main components:
  ```mermaid
  graph TD
    AdminUser[Admin User] -->|HTTPS| NextUI[Next.js UI]
    NextUI -->|Sanctum Auth| LaravelAPI[Laravel Sanctum API]
    LaravelAPI --> DB[(Database)]
  ```
- Next.js provides the admin login and dashboard UI.
- Laravel Sanctum handles SPA authentication and admin role validation.
- Tailwind CSS is used for a simple, consistent UI.

## Data Models
**What data do we need to manage?**

- User model includes `email`, `password`, and `role` (admin role = 1).
- Auth session established via Sanctum cookies for the SPA.

## API Design
**How do components communicate?**

- `GET /sanctum/csrf-cookie` to issue CSRF cookie before login.
- `POST /login` (Sanctum SPA): accepts `email` and `password`.
- `POST /logout` (Sanctum SPA): invalidates the session and clears auth.
- On success, backend verifies `role = 1` and sets session cookies.
- On failure, backend returns 401 for invalid credentials or 403 for non-admin.
- Frontend redirects to dashboard on success and shows errors on failure.
- Frontend redirects to home page (`/`) on logout.
- Frontend can fetch `GET /api/user` after login to confirm session state.

## Component Breakdown
**What are the major building blocks?**

- Next.js pages: login page, dashboard page, home page.
- UI components: form fields, buttons, alert/error banner.
- Auth utilities: API client, auth state storage, route guard, logout handler.
- Backend: Laravel Sanctum auth and middleware to enforce admin role.

## Design Decisions
**Why did we choose this approach?**

- Reuse Laravel Sanctum SPA auth to reduce backend changes and risk.
- Keep UI minimal to deliver fast, consistent admin experience.
- Enforce admin role in backend for security (not just frontend checks).

## Non-Functional Requirements
**How should the system perform?**

- Login response should be fast (< 1s on local dev).
- Protect admin routes from unauthenticated or non-admin access.
- Use httpOnly cookies for auth state and ensure CSRF protections.
- Configure `SANCTUM_STATEFUL_DOMAINS` and cookie domain to allow SPA auth.
- Provide consistent error response bodies for login failures.
