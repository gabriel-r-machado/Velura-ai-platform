import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { APIError, ValidationError } from './errors';

export function createErrorResponse(error: unknown): NextResponse {


  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation error', details: error.errors },
      { status: 400 }
    );
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'Unknown error occurred' },
    { status: 500 }
  );
}
