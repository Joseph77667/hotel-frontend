/** Body of every error from GlobalExceptionHandler. */
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  code: string;                              // e.g. "ROOM_NOT_AVAILABLE"
  message: string;
  path: string;
  fieldErrors?: Record<string, string>;      // only for VALIDATION_FAILED
}
