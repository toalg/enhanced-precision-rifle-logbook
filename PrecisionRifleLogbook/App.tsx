/**
 * Precision Rifle Logbook Mobile App
 * Migrated from rifle_logbook.html single-page application
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, StyleSheet, Alert, Text, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Import screens
import LogbookScreen from './src/screens/LogbookScreen.js';
import LadderTestScreen from './src/screens/LadderTestScreen.js';
import AnalyticsScreen from './src/screens/AnalyticsScreen.js';
import SettingsScreen from './src/screens/SettingsScreen.js';
import GunProfilesScreen from './src/screens/GunProfilesScreen.js';
import TestBackendScreen from './src/screens/TestBackendScreen.js';

// Import services
import LogbookService from './src/services/LogbookService.js';
import UnifiedDataService from './src/services/UnifiedDataService.js';
import GunProfileService from './src/services/GunProfileService.js';
import { testSupabaseConnection } from './src/utils/testSupabase.js';

// Import navigation styles
import { NavigationStyles, NavigationColors } from './src/styles/NavigationStyles.js';

const Tab = createBottomTabNavigator();

// Enhanced icon component with better visibility
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <Text style={[
    NavigationStyles.tabIcon,
    { color: focused ? NavigationColors.active : NavigationColors.inactive }
  ]}>
    {name === 'logbook' && '📝'}
    {name === 'ladder' && '🎯'}
    {name === 'analytics' && '📊'}
    {name === 'profiles' && '🔫'}
    {name === 'settings' && '⚙️'}
  </Text>
);

const App = () => {
  useEffect(() => {
    // Initialize the app
    const initializeApp = async () => {
      try {
        // Test Supabase connection first
        console.log('🚀 Starting app initialization...');
        const supabaseTest = await testSupabaseConnection();
        
        await LogbookService.initialize();
        await GunProfileService.initialize();
        const unifiedResult = await UnifiedDataService.initialize();
        
        if (unifiedResult.success) {
          console.log('✅ App initialized successfully');
          console.log('📊 Backend status:', {
            supabase: supabaseTest.success,
            backend: unifiedResult.backend || 'supabase'
          });
        } else {
          throw new Error('UnifiedDataService initialization failed');
        }
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        Alert.alert(
          'Initialization Error',
          'Failed to initialize the app. Please restart the application.',
          [{ text: 'OK' }]
        );
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      LogbookService.cleanup();
      UnifiedDataService.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={NavigationStyles.safeAreaContainer}>
        <NavigationContainer>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor="#001233" 
            translucent={false}
          />
          
          <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <TabIcon name={route.name} focused={focused} />
          ),
          tabBarAccessibilityLabel: route.name === 'logbook' ? 'Logbook Tab' :
                                   route.name === 'ladder' ? 'Ladder Test Tab' :
                                   route.name === 'analytics' ? 'Analytics Tab' :
                                   route.name === 'profiles' ? 'Gun Profiles Tab' :
                                   route.name === 'settings' ? 'Settings Tab' : route.name,
          tabBarActiveTintColor: NavigationColors.active,
          tabBarInactiveTintColor: NavigationColors.inactive,
          tabBarStyle: NavigationStyles.tabBarStyle,
          tabBarLabelStyle: NavigationStyles.tabBarLabelStyle,
          tabBarIconStyle: NavigationStyles.tabBarIconStyle,
          headerStyle: NavigationStyles.headerStyle,
          headerTintColor: NavigationColors.text,
          headerTitleStyle: NavigationStyles.headerTitleStyle,
        })}
      >
        <Tab.Screen 
          name="logbook" 
          component={LogbookScreen}
          options={{
            title: 'Logbook',
            headerTitle: 'Shooting Sessions',
          }}
        />
        
        <Tab.Screen 
          name="ladder" 
          component={LadderTestScreen}
          options={{
            title: 'Ladder',
            headerTitle: 'Ladder Tests',
          }}
        />
        
        <Tab.Screen 
          name="analytics" 
          component={AnalyticsScreen}
          options={{
            title: 'Analytics',
            headerTitle: 'Pro Analytics',
            headerRight: () => (
              <Text style={NavigationStyles.proBadge}>PRO</Text>
            ),
          }}
        />
        
        <Tab.Screen 
          name="profiles" 
          component={GunProfilesScreen}
          options={{
            title: 'Profiles',
            headerTitle: 'Gun Profiles',
          }}
        />
        
        <Tab.Screen 
          name="settings" 
          component={SettingsScreen}
          options={{
            title: 'Settings',
            headerTitle: 'Settings & Data',
          }}
        />

        {/* Temporarily disabled Firebase test tab
        <Tab.Screen 
          name="test" 
          component={TestBackendScreen}
          options={{
            title: '🧪 Test',
            headerTitle: 'Backend Test',
          }}
        />
        */}
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

// Styles moved to NavigationStyles.js

export default App;
