/**
 * Precision Rifle Logbook Mobile App
 * Migrated from rifle_logbook.html single-page application
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, StyleSheet, Alert, Text } from 'react-native';

// Import screens
import LogbookScreen from './src/screens/LogbookScreen.js';
import LadderTestScreen from './src/screens/LadderTestScreen.js';
import AnalyticsScreen from './src/screens/AnalyticsScreen.js';
import SettingsScreen from './src/screens/SettingsScreen.js';

// Import services
import LogbookService from './src/services/LogbookService.js';
import UnifiedDataService from './src/services/UnifiedDataService.js';

const Tab = createBottomTabNavigator();

// Simple icon component for now
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <Text style={{ fontSize: 20, color: focused ? '#0466C8' : '#7D8597' }}>
    {name === 'logbook' && '📝'}
    {name === 'ladder' && '🎯'}
    {name === 'analytics' && '📊'}
    {name === 'settings' && '⚙️'}
  </Text>
);

const App = () => {
  useEffect(() => {
    // Initialize the app
    const initializeApp = async () => {
      try {
        await LogbookService.initialize();
        await UnifiedDataService.initialize();
        console.log('App initialized successfully');
      } catch (error) {
        console.error('App initialization failed:', error);
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
          tabBarActiveTintColor: '#0466C8',
          tabBarInactiveTintColor: '#7D8597',
          tabBarStyle: {
            backgroundColor: '#001233',
            borderTopColor: '#33415C',
            borderTopWidth: 1,
            paddingTop: 5,
            paddingBottom: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 2,
          },
          headerStyle: {
            backgroundColor: '#001233',
            borderBottomColor: '#33415C',
            borderBottomWidth: 1,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
        })}
      >
        <Tab.Screen 
          name="logbook" 
          component={LogbookScreen}
          options={{
            title: '📝 Logbook',
            headerTitle: 'Shooting Sessions',
          }}
        />
        
        <Tab.Screen 
          name="ladder" 
          component={LadderTestScreen}
          options={{
            title: '🎯 Ladder Test',
            headerTitle: 'Ladder Tests',
          }}
        />
        
        <Tab.Screen 
          name="analytics" 
          component={AnalyticsScreen}
          options={{
            title: '📊 Analytics',
            headerTitle: 'Pro Analytics',
            headerRight: () => (
              <Text style={styles.proBadge}>PRO</Text>
            ),
          }}
        />
        
        <Tab.Screen 
          name="settings" 
          component={SettingsScreen}
          options={{
            title: '⚙️ Settings',
            headerTitle: 'Settings & Data',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  proBadge: {
    backgroundColor: '#0466C8',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 15,
  },
});

export default App;
