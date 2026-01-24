/**
 * Rate Limiter
 * 
 * In-memory rate limiting implementation to prevent API abuse.
 * Tracks requests per IP address with configurable limits.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private records: Map<string, RateLimitRecord>;
  private limit: number;
  private windowMs: number;

  /**
   * Creates a rate limiter instance
   * @param limit - Maximum number of requests allowed per window
   * @param windowMs - Time window in milliseconds
   */
  constructor(limit: number = 10, windowMs: number = 60000) {
    this.records = new Map();
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /**
   * Check if a request from the given identifier is allowed
   * @param identifier - Unique identifier (e.g., IP address)
   * @returns Object with allowed status and remaining requests
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.records.get(identifier);

    // No record or expired window - allow and create new record
    if (!record || now > record.resetTime) {
      this.records.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });

      return {
        allowed: true,
        remaining: this.limit - 1,
        resetTime: now + this.windowMs,
      };
    }

    // Within window - check if limit exceeded
    if (record.count >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    // Within window and under limit - increment and allow
    record.count++;
    this.records.set(identifier, record);

    return {
      allowed: true,
      remaining: this.limit - record.count,
      resetTime: record.resetTime,
    };
  }

  /**
   * Clean up expired records to prevent memory leaks
   * Should be called periodically
   */
  cleanup(): void {
    const now = Date.now();
    for (const [identifier, record] of this.records.entries()) {
      if (now > record.resetTime) {
        this.records.delete(identifier);
      }
    }
  }
}

// Singleton instance for code generation API
// 10 requests per minute per IP
export const codeGenerationLimiter = new RateLimiter(10, 60000);

// Cleanup expired records every 5 minutes
setInterval(() => {
  codeGenerationLimiter.cleanup();
}, 5 * 60 * 1000);

/**
 * Extract IP address from request headers
 * @param request - The incoming request
 * @returns IP address or 'unknown'
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    const firstIP = forwarded.split(',')[0];
    return firstIP ? firstIP.trim() : 'unknown';
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}
