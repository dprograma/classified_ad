/**
 * Rate limiting helper utilities
 */

/**
 * Creates a delay for the specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the delay
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Implements exponential backoff for retries
 * @param {number} attempt - Current attempt number (0-based)
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @returns {number} Delay in milliseconds
 */
export const exponentialBackoff = (attempt, baseDelay = 1000, maxDelay = 30000) => {
  const delay = baseDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
};

/**
 * Retry wrapper with exponential backoff for API calls
 * @param {Function} apiCall - Function that makes the API call
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries
 * @param {number} options.baseDelay - Base delay in milliseconds
 * @param {number} options.maxDelay - Maximum delay in milliseconds
 * @param {Function} options.shouldRetry - Function to determine if error should trigger retry
 * @returns {Promise} Promise that resolves with the API call result
 */
export const retryWithBackoff = async (
  apiCall,
  {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = (error) => error.status === 429 || error.status >= 500
  } = {}
) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exhausted attempts or error shouldn't be retried
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Wait before retrying
      const delayMs = exponentialBackoff(attempt, baseDelay, maxDelay);
      await delay(delayMs);
    }
  }

  throw lastError;
};

/**
 * Rate limit status tracker to prevent too many requests
 */
export class RateLimitTracker {
  constructor() {
    this.requests = new Map();
  }

  /**
   * Check if we should throttle requests for a given endpoint
   * @param {string} endpoint - API endpoint
   * @param {number} windowMs - Time window in milliseconds
   * @param {number} maxRequests - Maximum requests per window
   * @returns {boolean} True if should throttle
   */
  shouldThrottle(endpoint, windowMs = 60000, maxRequests = 10) {
    const now = Date.now();
    const key = endpoint;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const requests = this.requests.get(key);

    // Clean old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    this.requests.set(key, validRequests);

    // Check if we're at the limit
    return validRequests.length >= maxRequests;
  }

  /**
   * Record a request for rate limiting tracking
   * @param {string} endpoint - API endpoint
   */
  recordRequest(endpoint) {
    const now = Date.now();
    const key = endpoint;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    this.requests.get(key).push(now);
  }

  /**
   * Clear all tracking data
   */
  clear() {
    this.requests.clear();
  }
}

// Global instance
export const globalRateLimitTracker = new RateLimitTracker();