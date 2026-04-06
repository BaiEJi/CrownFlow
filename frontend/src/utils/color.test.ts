/**
 * 颜色调整工具函数测试
 */

import { describe, it, expect } from 'vitest';
import {
  adjustColorForDarkMode,
  isDarkColor,
  getLuminance,
} from './color';

describe('adjustColorForDarkMode', () => {
  describe('基本功能', () => {
    it('应该降低蓝色 (#1890ff) 的亮度和饱和度', () => {
      const original = '#1890ff';
      const result = adjustColorForDarkMode(original);
      
      // 结果应该与原始颜色不同
      expect(result).not.toBe(original.toLowerCase());
      
      // 结果应该是有效的十六进制颜色
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
      
      // 亮度应该降低
      const originalLum = getLuminance(original);
      const resultLum = getLuminance(result);
      expect(resultLum).toBeLessThan(originalLum);
    });

    it('应该正确处理黄色 (#FFFF00)', () => {
      const original = '#FFFF00';
      const result = adjustColorForDarkMode(original);
      
      expect(result).not.toBe(original.toLowerCase());
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
      
      // 黄色高饱和度，应该降低饱和度
      const originalLum = getLuminance(original);
      const resultLum = getLuminance(result);
      expect(resultLum).toBeLessThan(originalLum);
    });

    it('应该正确处理绿色 (#00FF00)', () => {
      const original = '#00FF00';
      const result = adjustColorForDarkMode(original);
      
      expect(result).not.toBe(original.toLowerCase());
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('应该正确处理红色 (#FF0000)', () => {
      const original = '#FF0000';
      const result = adjustColorForDarkMode(original);
      
      expect(result).not.toBe(original.toLowerCase());
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('边界情况', () => {
    it('应该正确处理纯黑 (#000000)', () => {
      const result = adjustColorForDarkMode('#000000');
      
      // 纯黑应该稍微提亮以保持可见性
      const lum = getLuminance(result);
      expect(lum).toBeGreaterThan(0);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('应该正确处理纯白 (#FFFFFF)', () => {
      const result = adjustColorForDarkMode('#FFFFFF');
      
      // 纯白应该降低亮度
      const lum = getLuminance(result);
      expect(lum).toBeLessThan(1);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('应该正确处理高饱和度颜色', () => {
      const highSatColors = ['#FF0000', '#00FF00', '#0000FF'];
      
      highSatColors.forEach((color) => {
        const result = adjustColorForDarkMode(color);
        expect(result).toBeDefined();
        expect(result).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('应该正确处理灰色 (#808080)', () => {
      const original = '#808080';
      const result = adjustColorForDarkMode(original);
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('应该正确处理浅色 (#E6F7FF)', () => {
      const original = '#E6F7FF';
      const result = adjustColorForDarkMode(original);
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('应该正确处理深色 (#003366)', () => {
      const original = '#003366';
      const result = adjustColorForDarkMode(original);
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
      
      // 深色应该有最小亮度保护
      const lum = getLuminance(result);
      expect(lum).toBeGreaterThanOrEqual(0.05);
    });
  });

  describe('自定义选项', () => {
    it('应该支持自定义亮度调整', () => {
      const original = '#1890ff';
      const result1 = adjustColorForDarkMode(original, { lightnessDelta: -0.1 });
      const result2 = adjustColorForDarkMode(original, { lightnessDelta: -0.3 });
      
      const lum1 = getLuminance(result1);
      const lum2 = getLuminance(result2);
      
      // 更大的降低幅度应该导致更低的亮度
      expect(lum2).toBeLessThan(lum1);
    });

    it('应该支持自定义饱和度调整', () => {
      const original = '#FF0000';
      const result = adjustColorForDarkMode(original, { saturationDelta: -0.4 });
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('应该支持同时自定义亮度和饱和度', () => {
      const original = '#1890ff';
      const result = adjustColorForDarkMode(original, {
        lightnessDelta: -0.25,
        saturationDelta: -0.2,
      });
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('应该支持正向调整（增加亮度和饱和度）', () => {
      const original = '#666666';
      const result = adjustColorForDarkMode(original, {
        lightnessDelta: 0.1,
        saturationDelta: 0.1,
      });
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('输入验证', () => {
    it('应该对无效输入返回原值', () => {
      expect(adjustColorForDarkMode('invalid')).toBe('invalid');
      expect(adjustColorForDarkMode('')).toBe('');
      expect(adjustColorForDarkMode('#ZZZZZZ')).toBe('#ZZZZZZ');
    });

    it('应该接受带 # 前缀的颜色', () => {
      const result = adjustColorForDarkMode('#1890ff');
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('应该接受不带 # 前缀的颜色', () => {
      const result = adjustColorForDarkMode('1890ff');
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('应该接受 3 位简写颜色', () => {
      const result = adjustColorForDarkMode('#fff');
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('输出格式', () => {
    it('应该总是返回 6 位十六进制颜色', () => {
      const colors = ['#1890ff', '#ff0000', '#00ff00', '#0000ff'];
      
      colors.forEach((color) => {
        const result = adjustColorForDarkMode(color);
        expect(result).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });
});

describe('isDarkColor', () => {
  it('应该正确识别暗色', () => {
    expect(isDarkColor('#000000')).toBe(true);
    expect(isDarkColor('#003366')).toBe(true);
    expect(isDarkColor('#333333')).toBe(true);
  });

  it('应该正确识别亮色', () => {
    expect(isDarkColor('#ffffff')).toBe(false);
    expect(isDarkColor('#ffff00')).toBe(false);
    expect(isDarkColor('#cccccc')).toBe(false);
  });

  it('应该对无效输入返回 false', () => {
    expect(isDarkColor('invalid')).toBe(false);
    expect(isDarkColor('')).toBe(false);
  });
});

describe('getLuminance', () => {
  it('应该返回黑色的亮度 0', () => {
    expect(getLuminance('#000000')).toBe(0);
  });

  it('应该返回白色的亮度 1', () => {
    expect(getLuminance('#ffffff')).toBe(1);
  });

  it('应该返回中间灰色的亮度约 0.5', () => {
    const lum = getLuminance('#808080');
    expect(lum).toBeGreaterThan(0.4);
    expect(lum).toBeLessThan(0.6);
  });

  it('应该对无效输入返回 0', () => {
    expect(getLuminance('invalid')).toBe(0);
    expect(getLuminance('')).toBe(0);
  });
});