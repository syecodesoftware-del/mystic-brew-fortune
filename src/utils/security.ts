/**
 * Security utility functions for input validation and sanitization
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Rate limiter for client-side spam protection
interface RateLimiterState {
  attempts: Record<string, number[]>;
}

export const rateLimiter: RateLimiterState = {
  attempts: {}
};

export const canProceed = (
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  
  if (!rateLimiter.attempts[key]) {
    rateLimiter.attempts[key] = [];
  }
  
  // Remove old attempts outside the time window
  rateLimiter.attempts[key] = rateLimiter.attempts[key].filter(
    time => now - time < windowMs
  );
  
  // Check if limit exceeded
  if (rateLimiter.attempts[key].length >= maxAttempts) {
    return false;
  }
  
  // Add new attempt
  rateLimiter.attempts[key].push(now);
  return true;
};

// Safe JSON parse with fallback
export const safeJSONParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
};

// Validate localStorage quota
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};
