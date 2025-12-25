/**
 * Custom API Error class for centralized error handling
 */
export class ApiError extends Error {
  public statusCode: number;
  public data?: unknown;

  constructor(message: string, statusCode: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }

  /**
   * Check if error is a not found error (404)
   */
  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  /**
   * Check if error is a network/server error (5xx)
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is a conflict error (409)
   */
  isConflict(): boolean {
    return this.statusCode === 409;
  }
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

/**
 * Map API error to table landing error type
 */
export type TableLandingErrorType =
  | "not_found"
  | "table_inactive"
  | "network_error";

export function mapToTableLandingError(error: unknown): TableLandingErrorType {
  if (isApiError(error)) {
    if (error.isNotFound()) {
      return "not_found";
    }
    if (error.isConflict()) {
      return "table_inactive";
    }
  }
  return "network_error";
}
