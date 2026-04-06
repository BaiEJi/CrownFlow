import { describe, it, expect } from 'vitest';
import { DARK_COLORS, COLORS, calculateContrastRatio, getDarkColorsContrastRatios } from './colors';

describe('colors constants', () => {
  const DARK_BACKGROUND = '#141414';
  const WCAG_AA_MIN_CONTRAST = 4.5;

  describe('DARK_COLORS', () => {
    it('should have exactly 8 colors', () => {
      expect(DARK_COLORS).toHaveLength(8);
    });

    it('should match the length of COLORS array', () => {
      expect(DARK_COLORS.length).toBe(COLORS.length);
    });

    it('should have all valid hex color format', () => {
      DARK_COLORS.forEach(color => {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('should have all colors different from original COLORS', () => {
      DARK_COLORS.forEach((darkColor, index) => {
        expect(darkColor).not.toBe(COLORS[index]);
      });
    });
  });

  describe('WCAG AA contrast compliance', () => {
    it('should have contrast ratio ≥ 4.5:1 for all colors against #141414', () => {
      DARK_COLORS.forEach(color => {
        const contrast = calculateContrastRatio(color, DARK_BACKGROUND);
        expect(contrast).toBeGreaterThanOrEqual(WCAG_AA_MIN_CONTRAST);
      });
    });

    it('should verify specific contrast ratios', () => {
      const ratios = getDarkColorsContrastRatios();
      
      ratios.forEach(({ contrast }) => {
        expect(contrast).toBeGreaterThanOrEqual(WCAG_AA_MIN_CONTRAST);
        expect(contrast).toBeLessThanOrEqual(21); // Maximum possible contrast
      });
    });

    it('should have reasonable contrast range (not too high, not too low)', () => {
      const ratios = getDarkColorsContrastRatios();
      
      ratios.forEach(({ contrast }) => {
        expect(contrast).toBeGreaterThanOrEqual(4.5);
        expect(contrast).toBeLessThanOrEqual(15); // Reasonable upper bound
      });
    });
  });

  describe('calculateContrastRatio', () => {
    it('should return 1:1 for identical colors', () => {
      expect(calculateContrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 2);
      expect(calculateContrastRatio('#000000', '#000000')).toBeCloseTo(1, 2);
    });

    it('should return 21:1 for pure black and white', () => {
      expect(calculateContrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
    });

    it('should be symmetric', () => {
      const color1 = '#1890ff';
      const color2 = '#141414';
      
      expect(calculateContrastRatio(color1, color2)).toBeCloseTo(
        calculateContrastRatio(color2, color1),
        5
      );
    });
  });

  describe('getDarkColorsContrastRatios', () => {
    it('should return array with same length as DARK_COLORS', () => {
      const ratios = getDarkColorsContrastRatios();
      expect(ratios).toHaveLength(DARK_COLORS.length);
    });

    it('should return objects with color and contrast properties', () => {
      const ratios = getDarkColorsContrastRatios();
      
      ratios.forEach(item => {
        expect(item).toHaveProperty('color');
        expect(item).toHaveProperty('contrast');
        expect(typeof item.color).toBe('string');
        expect(typeof item.contrast).toBe('number');
      });
    });
  });
});