export const colors = {
  primaryDeep: '#3B1566',
  primaryMid: '#5B21B6',
  primaryLight: '#7C3AED',
  accentLight: '#F3E8FF',
  successGreen: '#10B981',
  successLight: '#D1FAE5',
  warningOrange: '#F59E0B',
  warningLight: '#FEF3C7',
  dangerRed: '#EF4444',
  dangerLight: '#FEE2E2',
  white: '#FFFFFF',
  grayBG: '#F8FAFC',
  cardSurface: '#FFFFFF',
  textDark: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  cameraOverlay: 'rgba(59, 21, 102, 0.45)',
  cameraDark: '#0B0714',
  glassWhite: 'rgba(255, 255, 255, 0.15)',
  glassDark: 'rgba(15, 23, 42, 0.65)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
  full: 9999,
};

export const typography = {
  heading: {
    fontFamily: 'System',
    fontWeight: '700' as const,
  },
  body: {
    fontFamily: 'System',
    fontWeight: '400' as const,
  },
  bold: {
    fontFamily: 'System',
    fontWeight: '700' as const,
  },
  sizes: {
    h1: 26,
    h2: 22,
    h3: 18,
    h4: 16,
    body: 14,
    small: 13,
    tiny: 11,
    amount: 24,
    amountLg: 32,
  },
};

export const shadows = {
  card: {
    shadowColor: '#3B1566',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardLg: {
    shadowColor: '#3B1566',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  button: {
    shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  glow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
};
