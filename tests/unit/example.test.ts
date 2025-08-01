import { describe, it, expect } from '@jest/globals';

describe('Example Test Suite', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should use our custom matcher', () => {
    expect(5).toBeWithinRange(1, 10);
  });
});
