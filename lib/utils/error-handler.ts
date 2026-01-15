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
   * Check if error is an authentication error (401)
   */
  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  /**
   * Check if error is a forbidden error (403)
   */
  isForbidden(): boolean {
    return this.statusCode === 403;
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

  /**
   * Check if error requires re-authentication
   */
  requiresReauth(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
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

// ============================================
// Auth Error Types
// ============================================

export type AuthErrorType =
  | "invalid_credentials"
  | "account_inactive"
  | "email_not_verified"
  | "session_expired"
  | "network_error"
  | "unknown";

/**
 * Map API error to auth error type for better UX
 */
export function mapToAuthError(error: unknown): AuthErrorType {
  if (isApiError(error)) {
    const message = error.message.toLowerCase();

    // Check for specific error messages
    if (message.includes("email") && message.includes("not found")) {
      return "invalid_credentials";
    }
    if (
      message.includes("incorrect password") ||
      message.includes("wrong password")
    ) {
      return "invalid_credentials";
    }
    if (message.includes("inactive") || message.includes("disabled")) {
      return "account_inactive";
    }
    if (message.includes("verify") || message.includes("verified")) {
      return "email_not_verified";
    }
    if (error.isUnauthorized()) {
      return "session_expired";
    }
    if (error.isServerError()) {
      return "network_error";
    }
  }

  if (error instanceof Error && error.message.includes("Network")) {
    return "network_error";
  }

  return "unknown";
}

/**
 * Get user-friendly error message for auth errors
 */
export function getAuthErrorMessage(
  error: unknown,
  lang: "vi" | "en" = "vi",
): string {
  const errorType = mapToAuthError(error);

  const messages: Record<AuthErrorType, Record<"vi" | "en", string>> = {
    invalid_credentials: {
      vi: "Email hoặc mật khẩu không đúng",
      en: "Invalid email or password",
    },
    account_inactive: {
      vi: "Tài khoản đã bị vô hiệu hóa",
      en: "Account has been disabled",
    },
    email_not_verified: {
      vi: "Vui lòng xác thực email trước khi đăng nhập",
      en: "Please verify your email before signing in",
    },
    session_expired: {
      vi: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại",
      en: "Session expired. Please sign in again",
    },
    network_error: {
      vi: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng",
      en: "Unable to connect to server. Please check your network connection",
    },
    unknown: {
      vi: "Đã có lỗi xảy ra. Vui lòng thử lại sau",
      en: "An error occurred. Please try again later",
    },
  };

  return messages[errorType][lang];
}

/**
 * Handle auth error with optional redirect
 */
export function handleAuthError(
  error: unknown,
  options: {
    onSessionExpired?: () => void;
    onAccountIssue?: () => void;
  } = {},
): void {
  const errorType = mapToAuthError(error);

  if (errorType === "session_expired" && options.onSessionExpired) {
    options.onSessionExpired();
  }

  if (
    (errorType === "account_inactive" || errorType === "email_not_verified") &&
    options.onAccountIssue
  ) {
    options.onAccountIssue();
  }
}
