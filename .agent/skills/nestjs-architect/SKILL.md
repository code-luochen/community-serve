---
name: nestjs-architect
description: Comprehensive NestJS architecture guide for creating enterprise SaaS applications. Use this skill when users want to build, structure, or refactor NestJS applications following DDD (Domain-Driven Design) and Clean Architecture principles. It enforces strict linting, response standardization, and configuration management.
---

# NestJS Architect

## Overview

This skill acts as a Senior NestJS Architect, guiding the implementation of strictly structured, scalable, and maintainable enterprise backend systems.

## Core Responsibilities

- **Structuring**: Enforce Domain-Driven Design (DDD) with clear module boundaries.
- **Standardizing**: Implement uniform API responses and error handling mechanisms.
- **Securing**: Mandate strict configuration management and prohibit hardcoded secrets.
- **Validating**: Ensure robust data validation using `class-validator` pipelines.

## Implementation Standards

### 1. Directory Structure

Maximize modularity. Every feature MUST reside within `src/modules/{feature}` and contain focused subdirectories:
- `controller/`: REST endpoints
- `service/`: Business logic
- `module/`: Dependency injection configuration
- `dto/`: Data Transfer Objects (Request/Response shapes)
- `entities/`: TypeORM database models

**Detailed Example**: See `references/standards.md` -> ## 1. Directory Structure

### 2. Global Response Formatting

Implement a global `TransformInterceptor` to wrap all *successful* responses in a standard envelope:
```typescript
{
  "code": 200,
  "data": { ... },
  "message": "success"
}
```

**Implementation**: See `references/standards.md` -> ## 2. Response Standard

### 3. Exception Handling

Use a global `HttpExceptionFilter` to catch ALL exceptions and return a standardized JSON error structure. Raw stack traces must never leak to the client in production.

**Implementation**: See `references/standards.md` -> ## 3. Exception Management

### 4. Configuration Management

**NEVER** hardcode values. Use `@nestjs/config` and inject `ConfigService`.
- `.env` files for local development (git-ignored)
- Environment variables for production injection

**Implementation**: See `references/standards.md` -> ## 5. Configuration

### 5. Validation & Documentation

- **DTOs**: Must use `class-validator` decorators.
- **ValidationPipe**: Must be global with `whitelist: true`.
- **Swagger**: All Controllers and DTO properties must be decorated with `@ApiTags`, `@ApiOperation`, and `@ApiProperty`.

**Implementation**: See `references/standards.md` -> ## 4. DTO Validation Standards

## Workflow

1.  **Scaffold**: Create the module directory structure.
2.  **Define**: Create Entities and DTOs first to establish the data contract.
3.  **Implement**: Build the Service logic using dependency injection.
4.  **Expose**: Create the Controller endpoints with full Swagger documentation.
5.  **Verify**: Ensure global Interceptors and Filters are active in `main.ts`.

## Technical Constraints

- **Language**: TypeScript 5.x (Strict Mode)
- **ORM**: TypeORM
- **Validation**: `class-validator` + Global `ValidationPipe`
- **Docs**: Swagger (`@nestjs/swagger`)
