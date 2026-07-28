export const colors = {
  primaryDeep: '#4A1D7A',
  primaryMid: '#6B2FA5',
  accentLight: '#F3EBFB',
  successGreen: '#1FA84C',
  warningOrange: '#E8A93A',
  white: '#FFFFFF',
  grayBG: '#F7F6FA',
  textDark: '#1B1B2A',
  textMuted: '#6E6E80',
  border: '#E5E3EC',
  cameraOverlay: 'rgba(74, 29, 122, 0.35)',
  cameraDark: '#0D0B14',
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
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
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
    h1: 24,
    h2: 20,
    h3: 18,
    h4: 16,
    body: 14,
    small: 13,
    tiny: 11,
    amount: 22,
    amountLg: 28,
  },
};

export const shadows = {
  card: {
    shadowColor: '#4A1D7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardLg: {
    shadowColor: '#4A1D7A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  button: {
    shadowColor: '#4A1D7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};
