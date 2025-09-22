/**
 * Simple request throttling utility to prevent API spam
 */

class RequestThrottler {
  constructor() {
    this.lastRequests = new Map();
  }

  /**
   * Check if a request should be throttled
   * @param {string} key - Unique identifier for the request type
   * @param {number} minInterval - Minimum interval between requests in ms
   * @returns {boolean} True if request should be blocked
   */
  shouldThrottle(key, minInterval = 1000) {
    const now = Date.now();
    const lastRequest = this.lastRequests.get(key);

    if (lastRequest && (now - lastRequest) < minInterval) {
      return true;
    }

    this.lastRequests.set(key, now);
    return false;
  }

  /**
   * Clear all throttling data
   */
  clear() {
    this.lastRequests.clear();
  }

  /**
   * Clear throttling for a specific key
   * @param {string} key - Key to clear
   */
  clearKey(key) {
    this.lastRequests.delete(key);
  }
}

// Global throttler instance
export const globalThrottler = new RequestThrottler();