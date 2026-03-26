import { describe, it, expect } from 'vitest';
import { formatBytes } from '../formatBytes';

describe('formatBytes', () => {
  it('should return "0 Bytes" for 0 bytes', () => {
    expect(formatBytes(0, 2)).toBe('0 Bytes');
  });

  it('should format bytes correctly with default decimals logic', () => {
    expect(formatBytes(1000, 0)).toBe('1 KB');
    expect(formatBytes(1000, 2)).toBe('1 KB');
  });

  it('should format bytes with specified decimals', () => {
    expect(formatBytes(1234, 3)).toBe('1.234 KB');
    expect(formatBytes(1500, 2)).toBe('1.5 KB');
  });

  it('should handle different units', () => {
    expect(formatBytes(500, 2)).toBe('500 Bytes');
    expect(formatBytes(1000, 2)).toBe('1 KB');
    expect(formatBytes(1000 * 1000, 2)).toBe('1 MB');
    expect(formatBytes(1000 * 1000 * 1000, 2)).toBe('1 GB');
    expect(formatBytes(1000 * 1000 * 1000 * 1000, 2)).toBe('1 TB');
  });

  it('should round correctly', () => {
      expect(formatBytes(1900, 1)).toBe('1.9 KB');
  });
});
