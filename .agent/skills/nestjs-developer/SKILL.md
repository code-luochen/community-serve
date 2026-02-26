---
name: nestjs-developer
description: Expert business logic implementation for NestJS. Use this skill when users need to implement or refactor features, services, controllers, or database interactions within a NestJS application. It focuses on clean, testable, and robust business logic using TypeORM, class-validator, and proper separation of concerns.
---

# NestJS Business Developer

## Overview

This skill acts as a Nest.js Business Development Expert. Its primary goal is to translate business requirements into high-quality, maintainable, and type-safe code modules.

## Core Principles

1.  **Single Responsibility**: STRICT separation of concerns.
    -   **Service**: Pure business logic only. No HTTP handling.
    -   **Controller**: Request validation, parameter parsing, response formatting. No business logic.
    -   **DTO**: Data shape definition and validation rules.

2.  **Strong Typing**:
    -   NO `any`. Every function argument and return value must be typed.
    -   Use `interface` or `class` for complex structures.

3.  **Defensive Programming**:
    -   **Always Validate Input**: Trust no client data.
    -   **Handle Edge Cases**: Check for `null`/`undefined` explicitly.
    -   **Semantic Exceptions**: Throw `NotFoundException`, `BadRequestException`, `ForbiddenException`, etc., with clear messages.

## Implementation Guidelines

### 1. Database Interactions (TypeORM)

-   **Complex Queries**: Use `QueryBuilder` for anything beyond simple CRUD (joins, subqueries, aggregations).
-   **Atomic Writes**: Use transactions (`QueryRunner` or `transactional` decorator) for multi-step write operations.
-   **Existence Checks**: Always verify an entity exists before attempting to update or delete it.
    ```typescript
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    ```

### 2. Validation & Documentation

-   **Class Validator**: Use `@IsString()`, `@IsOptional()`, etc. on DTO properties.
-   **Swagger Sync**: Every DTO property and Controller method MUST have `@ApiProperty` / `@ApiOperation` decorators.
-   **Whitelist**: Ensure `ValidationPipe` is stripping unknown properties.

### 3. Output Components Checklist

Every new feature implementation MUST include the following 5 components. Do not skip any.

| Component | Responsibility | Standard Location |
| :--- | :--- | :--- |
| **Entity** | Database Schema Model | `src/modules/{feature}/entities/{feature}.entity.ts` |
| **DTOs** | Input/Output Contracts | `src/modules/{feature}/dto/create-{feature}.dto.ts` |
| **Service** | Business Logic | `src/modules/{feature}/{feature}.service.ts` |
| **Controller** | API Endpoints | `src/modules/{feature}/{feature}.controller.ts` |
| **Module** | Dependency Wiring | `src/modules/{feature}/{feature}.module.ts` |

## Reference Templates

For standard implementations, refer to `references/templates.md`. This file contains the approved boilerplate for:
-   `BaseEntity` usage
-   DTO structure with validation
-   Service methods with error handling
-   Controller routing and Swagger tags
-   Module imports/exports
