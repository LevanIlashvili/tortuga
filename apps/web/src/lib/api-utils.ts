import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  status: number = 500,
  errors?: Record<string, string[]>
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      errors,
    },
    { status }
  );
}

export function validationErrorResponse(error: ZodError) {
  const errors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return errorResponse('Validation failed', 400, errors);
}

export function withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      console.error('API Error:', error);

      if (error instanceof ZodError) {
        return validationErrorResponse(error);
      }

      if (error.message === 'Unauthorized') {
        return errorResponse('Unauthorized', 401);
      }

      if (error.message === 'Forbidden') {
        return errorResponse('Forbidden', 403);
      }

      if (error.message === 'Not Found') {
        return errorResponse('Not Found', 404);
      }

      return errorResponse(
        error.message || 'Internal server error',
        error.status || 500
      );
    }
  }) as T;
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export function rateLimitResponse() {
  return errorResponse('Too many requests', 429);
}
