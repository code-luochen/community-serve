# NestJS Enterprise Architecture Standards

## 1. Directory Structure

Enforce domain-driven design with strict module separation.

```
src/
├── app.module.ts
├── main.ts
└── modules/
    └── {feature}/
        ├── {feature}.controller.ts
        ├── {feature}.service.ts
        ├── {feature}.module.ts
        ├── entities/
        │   └── {feature}.entity.ts
        ├── dto/
        │   ├── create-{feature}.dto.ts
        │   └── update-{feature}.dto.ts
        └── interfaces/       (Optional: for service interfaces)
```

## 2. Response Standard (TransformInterceptor)

All successful responses must follow the format `{ code: 200, data: T, message: 'success' }`.

```typescript
// src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  code: number;
  message: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        code: 200,
        message: 'success',
      })),
    );
  }
}
```

## 3. Exception Management (HttpExceptionFilter)

Global filter to standardize error responses.

```typescript
// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      code: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
    });
  }
}
```

## 4. DTO Validation Standards

Must use `class-validator` with strict whitelist.

```typescript
// main.ts setup
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,       // Strip properties not in DTO
    forbidNonWhitelisted: true, // Throw error if extra properties present
    transform: true,       // Auto-transform payloads to DTO instances
  }),
);
```

**DTO Example:**

```typescript
import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the User' })
  @IsString()
  name: string;

  @ApiProperty({ example: 25, description: 'The age of the User' })
  @IsInt()
  age: number;
}
```

## 5. Configuration (ConfigService)

NEVER hardcode secrets. Always inject `ConfigService`.

```typescript
// valid usage
constructor(private configService: ConfigService) {}

get dbHost(): string {
  return this.configService.get<string>('DATABASE_HOST');
}
```

## 6. Dependency Injection

Prefer Interface-based injection tokens where possible, or standard constructor injection for services.

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
}
```
