/**
 * Combines multiple class names into a single string
 * @param {...(string | undefined | null | false)} classes - Class names to combine
 * @returns {string} Combined class names
 * @example
 * cn('text-red-500', 'font-bold', isActive && 'bg-blue-100')
 */
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a date string into a human-readable format
 * @param {string | Date} date - Date to format
 * @param {Intl.DateTimeFormatOptions} [options] - Formatting options
 * @returns {string} Formatted date string
 * @example
 * formatDate('2023-04-01') // Returns 'April 1, 2023'
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', options);
}

/**
 * Truncates text to a specified length and adds an ellipsis
 * @param {string} text - Text to truncate
 * @param {number} [maxLength=100] - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 * @example
 * truncate('This is a long text that will be truncated', 20)
 * // Returns 'This is a long text...'
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} [wait=300] - Wait time in milliseconds
 * @returns {Function} Debounced function
 * @example
 * const debouncedSearch = debounce((query) => {
 *   // Perform search
 * }, 500);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Generates a unique ID
 * @param {number} [length=8] - Length of the ID
 * @returns {string} A unique ID string
 * @example
 * const id = generateId(); // Returns something like 'a1b2c3d4'
 */
export function generateId(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validates an email address
 * @param {string} email - Email address to validate
 * @returns {boolean} Whether the email is valid
 * @example
 * isValidEmail('test@example.com') // Returns true
 * isValidEmail('invalid-email')    // Returns false
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Creates a URL-friendly slug from a string
 * @param {string} str - String to convert to slug
 * @returns {string} URL-friendly slug
 * @example
 * slugify('Hello World!') // Returns 'hello-world'
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Formats a number with commas as thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 * @example
 * formatNumber(1000000) // Returns '1,000,000'
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Delays execution for a specified time
 * @param {number} ms - Time to wait in milliseconds
 * @returns {Promise<void>} A promise that resolves after the specified time
 * @example
 * await sleep(1000); // Waits for 1 second
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Deep clones an object
 * @template T
 * @param {T} obj - Object to clone
 * @returns {T} Deep cloned object
 * @example
 * const original = { a: { b: 1 } };
 * const copy = deepClone(original);
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Converts a string to title case
 * @param {string} str - String to convert
 * @returns {string} Title-cased string
 * @example
 * toTitleCase('hello world') // Returns 'Hello World'
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}
