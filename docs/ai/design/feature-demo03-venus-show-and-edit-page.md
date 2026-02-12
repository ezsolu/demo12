---
phase: design
title: System Design & Architecture
description: Define the technical architecture, components, and data models
---

# System Design & Architecture

## Architecture Overview
**What is the high-level system structure?**

- ```mermaid
  graph TD
    AdminUI[Next.js Admin Venue Detail] -->|HTTPS| Api[Laravel API /api/v1]
    Api --> VenueModule[Modules/Venue Controllers]
    Api --> CityModule[Modules/City Controllers]
    VenueModule --> DB[(MySQL)]
    Api --> Auth[Sanctum + Admin Role Check]
    DB --> Venues[venues]
    DB --> Cities[cities]
    DB --> VenueTypes[venue_types]
  ```
- Key components and their responsibilities
  - Next.js admin detail page fetches venue data, renders a form, and submits updates.
  - Laravel Venue module exposes show, update, and venue type list endpoints.
  - Laravel City module exposes city list endpoint.
  - Sanctum authenticates update requests; admin role check authorizes updates.
- Technology stack choices and rationale
  - Reuse existing Next.js admin pages and Laravel modular API to align with current architecture.

## Data Models
**What data do we need to manage?**

- Core entities and their relationships
  - `Venue` belongs to `City` and `VenueType`.
- Data schemas/structures
  - Venue fields: `name`, `address`, `latitude`, `longitude`, `seat_count`, `people_count`,
    `rating`, `rating_count`, `price_level`, `city_id`, `venue_type_id`.
- Data flow between components
  - GET loads venue details for display.
  - PUT/PATCH sends updated fields to API for persistence.

## API Design
**How do components communicate?**

- External APIs (if applicable)
  - None.
- Internal interfaces
  - `GET /api/v1/venues/{id}` (public): returns venue detail.
  - `GET /api/v1/cities` (public): returns city options for dropdowns.
  - `GET /api/v1/venue-types` (public): returns venue type options for dropdowns.
  - `PUT /api/v1/venues/{id}` (admin only): updates venue fields.
- Request/response formats
  - Show response (example)
    - `{ "data": { "id": 1, "name": "...", "address": "...", "latitude": ..., "city_id": 2, "venue_type_id": 3, "rating": 4.5, "rating_count": 10, "price_level": 2 } }`
  - City list response (example)
    - `{ "data": [{ "id": 1, "name": "Sydney" }] }`
  - Venue type list response (example)
    - `{ "data": [{ "id": 1, "name": "Hotel" }] }`
  - Update request body: JSON with editable fields (same as fillable fields).
  - Update response: updated venue payload.
- Authentication/authorization approach
  - Show endpoint is public.
  - Update endpoint uses Sanctum auth + admin role check.

## Component Breakdown
**What are the major building blocks?**

- Frontend components (if applicable)
  - `nextjs/app/admin/venues/[id]/page.tsx`: fetch, render, edit state, save handling.
  - Shared API helpers in `nextjs/lib/api` for authenticated requests.
- Backend services/modules
  - `Modules/Venue` API controller(s) for show and update.
  - `Modules/Venue` API controller for venue type list (public).
  - `Modules/City` API controller for city list (public).
  - `FormRequest` for update validation.
  - Admin authorization (middleware or policy).
- Database/storage layer
  - `venues`, `cities`, `venue_types` tables.
- Third-party integrations
  - None.

## Design Decisions
**Why did we choose this approach?**

- Use `Modules/Venue` to keep venue logic encapsulated with existing list API.
- Separate show (public) and update (admin) behavior by HTTP method while keeping route prefix stable.
- Keep form fields aligned with `Venue::$fillable` to avoid hidden data dependencies.
- Provide public list endpoints for city and venue type to populate dropdowns.
- Alternatives considered
  - Separate admin route prefix for update (`/api/v1/admin/venues/{id}`) rejected to minimize changes.
  - Making show endpoint authenticated rejected because requirement says public.

## Non-Functional Requirements
**How should the system perform?**

- Performance targets
  - Detail page loads with three API requests (venue, cities, venue types).
- Scalability considerations
  - Minimal; one venue at a time.
- Security requirements
  - Update requires Sanctum auth and admin role.
  - Input validation on update request.
- Reliability/availability needs
  - Clear error messages and non-destructive edit flow if save fails.
