// ==================== CUSTOM ERROR HIERARCHY ====================

/**
 * Base application error. All domain errors extend this.
 * Carries an HTTP status code and optional structured details.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/** 400 — Invalid input or request shape. */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, details);
  }
}

/** 401 — Missing or invalid authentication. */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401);
  }
}

/** 404 — Requested resource not found. */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

/** 429 — Rate limit exceeded. */
export class RateLimitError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 429, details);
  }
}

/** 500 — Unexpected database failure. */
export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, details);
  }
}

/** 502 — External service (LLM, OAuth provider) failure. */
export class ExternalServiceError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 502, details);
  }
}

/** Type guard to check if an error is an AppError (or subclass). */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};
