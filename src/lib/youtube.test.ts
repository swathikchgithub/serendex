import { describe, it, expect } from 'vitest';
import { parseDuration, searchYouTube } from './youtube';

describe('YouTube Utilities', () => {
  describe('parseDuration', () => {
    it('should parse simple minutes and seconds', () => {
      expect(parseDuration('PT5M12S')).toBe('5:12');
      expect(parseDuration('PT10M5S')).toBe('10:05');
    });

    it('should parse durations with hours', () => {
      expect(parseDuration('PT1H20M30S')).toBe('1:20:30');
      expect(parseDuration('PT2H5M0S')).toBe('2:05:00');
    });

    it('should handle missing components', () => {
      expect(parseDuration('PT5M')).toBe('5:00');
      expect(parseDuration('PT30S')).toBe('0:30');
      expect(parseDuration('PT1H')).toBe('1:00:00');
    });

    it('should return 0:00 for invalid formats', () => {
      expect(parseDuration('invalid')).toBe('0:00');
    });
  });
});
