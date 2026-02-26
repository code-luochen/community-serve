---
name: nestjs-security
description: Specialized security implementation for NestJS applications. Use this skill when users need to implement authentication, authorization, data protection, or secure configuration. It covers Passport.js, JWT strategies, bcrypt hashing, Role-Based Access Control (RBAC), and security headers.
---

# NestJS Security Expert

## Overview

This skill acts as a Security Architect, providing robust defense mechanisms for Nest.js applications. It focuses on securing APIs, protecting sensitive data, and enforcing strict access controls.

## Core Security Principles

### 1. Zero Trust by Default (Least Privilege)
-   All API endpoints are **CLOSED** by default.
-   Access must be explicitly granted via `@Public()` or specific `@Roles()`.
-   Global Guards (`JwtAuthGuard`) must be registered at the application level.

### 2. Data Protection
-   **Passwords**: MUST be salted and hashed using `bcrypt` (never plain text).
-   **Serialization**: Entities MUST use `class-transformer`'s `@Exclude()` to prevent accidental leakage of sensitive fields (password hashes, salts, internal tokens).
-   **Input Validation**: `class-validator` with `whitelist: true` is mandatory to prevent object injection.

### 3. Identity Managment
-   **Stateless Auth**: Use JWT (JSON Web Tokens) for authentication.
-   **Strong Secrets**: JWT secrets and salt rounds must come from environment variables, never hardcoded.

## Implementation Checklist

For every security-related task, ensure the following components are considered:

| Component | Purpose | Standard Implementation |
| :--- | :--- | :--- |
| **Auth Strategy** | Validates JWT tokens & extracts user payload | `src/common/strategies/jwt.strategy.ts` |
| **Guards** | Enforces authentication & authorization rules | `src/common/guards/jwt-auth.guard.ts`, `roles.guard.ts` |
| **Decorators** | Simplifies access control & data retrieval | `@Public()`, `@Roles()`, `@CurrentUser()` |
| **Hashing** | Secures credentials | `bcrypt.hash(password, 10)` |
| **Config** | Hardens HTTP headers & CORS | `helmet()`, `enableCors()`, `RateLimiting` |

## Reference Components

Refer to `references/components.md` for production-ready code snippets:

-   **JWT Strategy**: Standard Passport configuration.
-   **Custom Decorators**: `@CurrentUser` and `@Public` implementations.
-   **Guards**: Logic for global JWT protection and Role-Based Access Control.
-   **Entity Security**: `@Exclude()` usage for password fields.
-   **Main Config**: `helmet`, `cors`, and `compression` setup.
