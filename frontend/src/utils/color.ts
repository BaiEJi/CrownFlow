/**
 * 颜色调整工具函数
 *
 * 提供颜色格式转换和暗色模式优化功能。
 *
 * @module utils/color
 */

/**
 * 颜色调整选项
 */
export interface AdjustmentOptions {
  /** 亮度调整值（-1 到 1），默认 -0.2（降低 20%） */
  lightnessDelta?: number;
  /** 饱和度调整值（-1 到 1），默认 -0.15（降低 15%） */
  saturationDelta?: number;
}

/**
 * HSL 颜色对象
 */
interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * RGB 颜色对象
 */
interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * 将十六进制颜色转换为 RGB
 * @param hex - 十六进制颜色字符串（如 '#1890ff' 或 '1890ff'）
 * @returns RGB 对象，如果格式无效则返回 null
 */
function hexToRgb(hex: string): RGB | null {
  // 移除 # 前缀
  const cleanHex = hex.replace(/^#/, '');
  
  // 验证格式
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex) && !/^[0-9A-Fa-f]{3}$/.test(cleanHex)) {
    return null;
  }
  
  // 扩展 3 位颜色为 6 位
  let fullHex = cleanHex;
  if (cleanHex.length === 3) {
    fullHex = cleanHex
      .split('')
      .map((char) => char + char)
      .join('');
  }
  
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * 将 RGB 转换为 HSL
 * @param r - 红色值（0-255）
 * @param g - 绿色值（0-255）
 * @param b - 蓝色值（0-255）
 * @returns HSL 对象（h: 0-360, s: 0-1, l: 0-1）
 */
function rgbToHsl(r: number, g: number, b: number): HSL {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / delta + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / delta + 4) / 6;
        break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 1000) / 1000,
    l: Math.round(l * 1000) / 1000,
  };
}

/**
 * 将 HSL 转换为 RGB
 * @param h - 色相（0-360）
 * @param s - 饱和度（0-1）
 * @param l - 亮度（0-1）
 * @returns RGB 对象（r, g, b: 0-255）
 */
function hslToRgb(h: number, s: number, l: number): RGB {
  const hNorm = h / 360;
  
  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }
  
  const hue2rgb = (p: number, q: number, t: number): number => {
    let tNorm = t;
    if (tNorm < 0) tNorm += 1;
    if (tNorm > 1) tNorm -= 1;
    if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
    if (tNorm < 1 / 2) return q;
    if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
    return p;
  };
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  const r = Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hNorm) * 255);
  const b = Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255);
  
  return { r, g, b };
}

/**
 * 将 RGB 转换为十六进制颜色
 * @param r - 红色值（0-255）
 * @param g - 绿色值（0-255）
 * @param b - 蓝色值（0-255）
 * @returns 十六进制颜色字符串（如 '#1890ff'）
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number): string => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    const hex = clamped.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 将十六进制颜色转换为 HSL
 * @param hex - 十六进制颜色字符串
 * @returns HSL 对象，如果格式无效则返回 null
 */
function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

/**
 * 将 HSL 转换为十六进制颜色
 * @param h - 色相（0-360）
 * @param s - 饱和度（0-1）
 * @param l - 亮度（0-1）
 * @returns 十六进制颜色字符串
 */
function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * 调整颜色以适应暗色模式
 *
 * 降低亮度和饱和度，使颜色在暗色背景上更加柔和。
 *
 * @param hex - 原始十六进制颜色字符串（如 '#1890ff'）
 * @param options - 调整选项
 * @param options.lightnessDelta - 亮度调整值（-1 到 1），默认 -0.2
 * @param options.saturationDelta - 饱和度调整值（-1 到 1），默认 -0.15
 * @returns 调整后的十六进制颜色字符串，如果输入无效则返回原值
 *
 * @example
 * ```ts
 * // 基本用法
 * adjustColorForDarkMode('#1890ff') // 返回柔和的蓝色
 *
 * // 自定义调整
 * adjustColorForDarkMode('#ff0000', { lightnessDelta: -0.3, saturationDelta: -0.2 })
 *
 * // 处理边界情况
 * adjustColorForDarkMode('#000000') // 纯黑会被保护
 * adjustColorForDarkMode('#ffffff') // 纯白会被保护
 * ```
 */
export function adjustColorForDarkMode(
  hex: string,
  options?: AdjustmentOptions
): string {
  const { lightnessDelta = -0.2, saturationDelta = -0.15 } = options || {};
  
  // 验证输入格式
  const hsl = hexToHsl(hex);
  if (!hsl) {
    return hex; // 无效输入返回原值
  }
  
  // 边界保护：纯黑和纯白需要特殊处理
  if (hex.replace(/^#/, '').toLowerCase() === '000000') {
    // 纯黑：稍微提亮以保持可见性
    return hslToHex(hsl.h, hsl.s, Math.max(0.05, hsl.l + 0.05));
  }
  
  if (hex.replace(/^#/, '').toLowerCase() === 'ffffff') {
    // 纯白：降低亮度到合适范围
    return hslToHex(hsl.h, 0.1, 0.85);
  }
  
  // 计算新的饱和度和亮度，并限制在有效范围内
  let newS = Math.max(0, Math.min(1, hsl.s + saturationDelta));
  let newL = Math.max(0, Math.min(1, hsl.l + lightnessDelta));
  
  // 保护极端亮度：确保颜色可见
  if (newL < 0.05) {
    newL = 0.05;
  } else if (newL > 0.95) {
    newL = 0.95;
  }
  
  // 保护高饱和度颜色：避免过度降低饱和度导致颜色失真
  if (hsl.s > 0.8 && newS < 0.3) {
    newS = 0.3;
  }
  
  return hslToHex(hsl.h, newS, newL);
}

/**
 * 判断颜色是否为暗色
 * @param hex - 十六进制颜色字符串
 * @returns 如果是暗色返回 true，否则返回 false
 */
export function isDarkColor(hex: string): boolean {
  const hsl = hexToHsl(hex);
  if (!hsl) return false;
  return hsl.l < 0.5;
}

/**
 * 获取颜色的相对亮度
 * @param hex - 十六进制颜色字符串
 * @returns 亮度值（0-1），如果输入无效返回 0
 */
export function getLuminance(hex: string): number {
  const hsl = hexToHsl(hex);
  return hsl ? hsl.l : 0;
}