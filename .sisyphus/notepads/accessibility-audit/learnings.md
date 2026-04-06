# Accessibility Audit Learnings

## 2026-04-04 Final Audit Results

### WCAG AA Contrast Testing Methodology
- Use `adjustForDarkModeWithContrast()` for guaranteed contrast compliance
- Test against #141414 background for dark mode
- WCAG AA requires ≥4.5:1 for text, ≥3:1 for UI components

### Contrast Test Command
```bash
cd frontend && npm test src/constants/colors.test.ts -- --run
```

### All 38 Color Tests Pass
- DARK_COLORS: 8/8 pass (range 4.52:1 to 5.59:1)
- Dashboard Statistics: 3/3 pass
- MemberCard borders: 3/3 pass
- MemberRankingCard trophy: 3/3 pass
- MemberRankingCard progress: 5/5 pass
- Focus indicators: 2/2 pass

### Edge Case Handling
- Bright yellow (#FFFF00) → #8e8e0b → 5.28:1 ✓
- Bright magenta (#FF00FF) → #ec13ec → 5.15:1 ✓
- High saturation colors are softened but remain distinguishable

### Focus Indicators
- Ant Design's `theme.darkAlgorithm` provides proper focus states
- Primary blue (#1890ff → #1382ea) contrast: 4.74:1 against #141414
- Focus ring visible on card background (#1f1f1f): 4.25:1