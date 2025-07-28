/**
 * Input sanitization utility to protect against XSS and injection attacks
 */

// HTML entities mapping for escaping
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

// Regular expression to match unsafe characters
const UNSAFE_CHARS_REGEX = /[&<>"'/`=]/g;

// Regular expression to match potentially dangerous URL protocols
const DANGEROUS_URL_PROTOCOLS = /^(javascript:|data:|vbscript:)/i;

/**
 * Escapes a string to protect against XSS attacks
 */
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe);
  }
  
  return unsafe.replace(UNSAFE_CHARS_REGEX, (match) => 
    HTML_ESCAPE_MAP[match] || match
  );
}

/**
 * Sanitizes a string by removing or escaping potentially dangerous content
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    if (input === null || input === undefined) return '';
    return String(input);
  }
  
  // Trim whitespace
  let result = input.trim();
  
  // Remove null bytes
  result = result.replace(/\0/g, '');
  
  // Escape HTML
  result = escapeHtml(result);
  
  return result;
}

/**
 * Sanitizes a URL to prevent XSS and injection attacks
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }
  
  // Trim and remove null bytes
  let sanitized = url.trim().replace(/\0/g, '');
  
  // Check for dangerous protocols
  try {
    const parsedUrl = new URL(sanitized, window.location.origin);
    
    // Allow only http, https, and relative URLs
    if (!['http:', 'https:'].includes(parsedUrl.protocol) && !sanitized.startsWith('/')) {
      return '';
    }
    
    // Escape HTML in the URL
    return escapeHtml(sanitized);
  } catch (e) {
    // If URL parsing fails, return a safe empty string
    return '';
  }
}

/**
 * Sanitizes an object by applying the sanitizeString function to all string properties
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  const result: Record<string, any> = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (value && typeof value === 'object') {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  
  return result as T;
}

/**
 * Middleware to sanitize request body, query, and params
 * Returns a new object with sanitized values instead of mutating the input
 */
export function sanitizeRequest(req: Request): Request {
  const sanitizedReq = { ...req };
  
  if (sanitizedReq.body && typeof sanitizedReq.body === 'object') {
    sanitizedReq.body = sanitizeObject(sanitizedReq.body);
  }
  
  // @ts-ignore - Add query and params sanitization if using Express/Connect
  if (sanitizedReq.query && typeof sanitizedReq.query === 'object') {
    // @ts-ignore
    sanitizedReq.query = sanitizeObject(sanitizedReq.query);
  }
  
  // @ts-ignore
  if (sanitizedReq.params && typeof sanitizedReq.params === 'object') {
    // @ts-ignore
    sanitizedReq.params = sanitizeObject(sanitizedReq.params);
  }
  
  return sanitizedReq;
}

/**
 * Validates and sanitizes an email address
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== 'string') return null;
  
  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(sanitized) ? sanitized : null;
}

/**
 * Validates and sanitizes a password
 */
export function sanitizePassword(password: string): string | null {
  if (typeof password !== 'string') return null;
  
  // Basic password requirements
  if (password.length < 8) return null;
  
  return password;
}
