/**
 * Navigation Styles - Consistent styling for the app navigation
 */

import { StyleSheet } from 'react-native';

// Color palette
export const NavigationColors = {
  primary: '#001233',
  secondary: '#33415C',
  accent: '#0466C8',
  active: '#0466C8',
  inactive: '#7D8597',
  text: '#FFFFFF',
  background: '#001233',
  cardBackground: '#33415C',
  border: '#4A5568',
  success: '#4ECDC4',
  warning: '#FFD93D',
  error: '#FF6B6B',
  info: '#6C5CE7'
};

// Tab bar styles
export const NavigationStyles = StyleSheet.create({
  // Safe area container
  safeAreaContainer: {
    flex: 1,
    backgroundColor: NavigationColors.background,
  },

  // Tab bar styling
  tabBarStyle: {
    backgroundColor: NavigationColors.background,
    borderTopColor: NavigationColors.border,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    height: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },

  // Tab bar label styling
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    fontFamily: 'System',
  },

  // Tab bar icon styling
  tabBarIconStyle: {
    marginTop: 2,
  },

  // Tab icon styling
  tabIcon: {
    fontSize: 20,
    fontWeight: '500',
  },

  // Header styling
  headerStyle: {
    backgroundColor: NavigationColors.background,
    borderBottomColor: NavigationColors.border,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  // Header title styling
  headerTitleStyle: {
    fontWeight: '700',
    fontSize: 18,
    color: NavigationColors.text,
    fontFamily: 'System',
  },

  // PRO badge styling
  proBadge: {
    backgroundColor: NavigationColors.accent,
    color: NavigationColors.text,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 15,
    overflow: 'hidden',
  },

  // Card styling
  card: {
    backgroundColor: NavigationColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: NavigationColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Button styling
  button: {
    backgroundColor: NavigationColors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  buttonText: {
    color: NavigationColors.text,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },

  // Secondary button styling
  buttonSecondary: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: NavigationColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonSecondaryText: {
    color: NavigationColors.accent,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },

  // Input styling
  input: {
    backgroundColor: NavigationColors.cardBackground,
    borderWidth: 1,
    borderColor: NavigationColors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: NavigationColors.text,
    fontFamily: 'System',
  },

  inputFocused: {
    borderColor: NavigationColors.accent,
    shadowColor: NavigationColors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },

  // Text styling
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: NavigationColors.text,
    marginBottom: 8,
    fontFamily: 'System',
  },

  subtitle: {
    fontSize: 16,
    color: NavigationColors.inactive,
    marginBottom: 16,
    fontFamily: 'System',
  },

  bodyText: {
    fontSize: 16,
    color: NavigationColors.text,
    lineHeight: 24,
    fontFamily: 'System',
  },

  caption: {
    fontSize: 14,
    color: NavigationColors.inactive,
    fontFamily: 'System',
  },

  // Status indicators
  statusSuccess: {
    backgroundColor: NavigationColors.success,
    color: NavigationColors.text,
  },

  statusWarning: {
    backgroundColor: NavigationColors.warning,
    color: NavigationColors.primary,
  },

  statusError: {
    backgroundColor: NavigationColors.error,
    color: NavigationColors.text,
  },

  statusInfo: {
    backgroundColor: NavigationColors.info,
    color: NavigationColors.text,
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NavigationColors.background,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: NavigationColors.inactive,
    fontFamily: 'System',
  },

  // Empty states
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: NavigationColors.background,
  },

  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },

  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: NavigationColors.text,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },

  emptyStateText: {
    fontSize: 16,
    color: NavigationColors.inactive,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: 'System',
  },

  // List styling
  listContainer: {
    backgroundColor: NavigationColors.background,
    flex: 1,
  },

  listItem: {
    backgroundColor: NavigationColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: NavigationColors.border,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  listItemText: {
    fontSize: 16,
    color: NavigationColors.text,
    fontFamily: 'System',
  },

  listItemSubtext: {
    fontSize: 14,
    color: NavigationColors.inactive,
    marginTop: 4,
    fontFamily: 'System',
  },

  // Section styling
  section: {
    marginVertical: 16,
  },

  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: NavigationColors.text,
    marginBottom: 12,
    paddingHorizontal: 20,
    fontFamily: 'System',
  },

  // Divider styling
  divider: {
    height: 1,
    backgroundColor: NavigationColors.border,
    marginVertical: 16,
  },

  // Badge styling
  badge: {
    backgroundColor: NavigationColors.accent,
    color: NavigationColors.text,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
    fontFamily: 'System',
  },

  // Progress bar styling
  progressBar: {
    height: 8,
    backgroundColor: NavigationColors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: NavigationColors.accent,
  },
});

export default NavigationStyles;