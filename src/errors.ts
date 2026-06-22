export class LocApiError extends Error {
  public readonly statusCode: number;
  public readonly errorType?: string;
  public readonly issues?: Record<string, string[]>;
  public readonly meta?: Record<string, any>;

  constructor(message: string, statusCode: number, details?: { errorType?: string; issues?: Record<string, string[]>; meta?: Record<string, any> }) {
    super(message);
    this.name = 'LocApiError';
    this.statusCode = statusCode;
    this.errorType = details?.errorType;
    this.issues = details?.issues;
    this.meta = details?.meta;

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
