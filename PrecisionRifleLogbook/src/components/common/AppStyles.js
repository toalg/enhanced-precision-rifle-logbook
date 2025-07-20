/**
 * App-wide styles and theme
 * Migrated from rifle_logbook.html CSS styles
 */

import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color palette from original design
export const Colors = {
  // Primary blues
  primary: '#0466C8',
  primaryDark: '#0353A4',
  primaryDeep: '#023E7D',
  primaryDarkest: '#002855',
  background: '#001233',
  
  // Grays
  gray: '#979DAC',
  grayDark: '#7D8597',
  grayDeep: '#5C677D',
  grayDarkest: '#33415C',
  
  // UI colors
  white: '#FFFFFF',
  black: '#001845',
  error: '#e74c3c',
  warning: '#f39c12',
  success: '#27ae60',
  info: '#3498db',
  grayLight: '#f8f9fa',
  
  // Cleaning status colors
  cleaningGood: '#27ae60',
  cleaningWarning: '#f39c12', 
  cleaningCritical: '#e74c3c',
  
  // Semi-transparent
  overlay: 'rgba(0, 18, 51, 0.9)',
  cardBackground: 'rgba(255, 255, 255, 0.98)',
  inputBackground: 'rgba(255, 255, 255, 0.9)',
};

// Typography
export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.white,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.black,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.black,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.black,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grayDeep,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primaryDeep,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.grayDark,
  },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 50,
};

// Shadows
export const Shadows = {
  small: {
    shadowColor: Colors.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.background,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Common styles
export const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  contentContainer: {
    flex: 1,
    padding: Spacing.md,
  },
  
  scrollContainer: {
    flexGrow: 1,
    padding: Spacing.md,
  },
  
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.grayDark,
    ...Shadows.medium,
  },
  
  inputContainer: {
    marginBottom: Spacing.md,
  },
  
  input: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 2,
    borderColor: Colors.grayDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.black,
  },
  
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  
  label: {
    ...Typography.label,
    marginBottom: Spacing.sm,
  },
  
  buttonPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...Shadows.small,
  },
  
  buttonSecondary: {
    backgroundColor: Colors.grayDeep,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...Shadows.small,
  },
  
  buttonDanger: {
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...Shadows.small,
  },
  
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  flex1: {
    flex: 1,
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  // Status indicators
  statusInfo: {
    backgroundColor: 'rgba(4, 102, 200, 0.1)',
    borderColor: Colors.primary,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  
  statusSuccess: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    borderColor: Colors.success,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  
  statusWarning: {
    backgroundColor: 'rgba(241, 196, 15, 0.1)',
    borderColor: Colors.warning,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  
  statusError: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderColor: Colors.error,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  
  // Form layouts
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.sm,
  },
  
  formGridItem: {
    flex: 1,
    minWidth: 150,
    marginHorizontal: Spacing.sm,
  },
  
  formGridItemHalf: {
    width: '48%',
    marginHorizontal: '1%',
  },
  
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  emptyStateText: {
    ...Typography.bodySmall,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

// Responsive utilities
export const isTablet = width >= 768;
export const isLandscape = width > height;

// Animation durations
export const AnimationDuration = {
  fast: 200,
  normal: 300,
  slow: 500,
};