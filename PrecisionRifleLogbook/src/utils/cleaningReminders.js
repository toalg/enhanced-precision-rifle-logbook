/**
 * Cleaning Reminder Utilities
 * Handles cleaning reminder notifications and alerts
 */

import { Alert } from 'react-native';
import GunProfileService from '../services/GunProfileService';

export class CleaningReminderManager {
  static showCleaningAlert(profile) {
    const cleaningStatus = profile.getCleaningStatus();
    
    if (cleaningStatus.status === 'needs_cleaning') {
      Alert.alert(
        `${profile.getDisplayName()} Needs Cleaning!`,
        `You've fired ${profile.getRoundsSinceLastCleaning()} rounds since the last cleaning. It's recommended to clean your firearm every ${profile.cleaningInterval} rounds.`,
        [
          {
            text: 'Remind Later',
            style: 'cancel'
          },
          {
            text: 'Mark as Cleaned',
            onPress: async () => {
              const result = await GunProfileService.markProfileCleaned(profile.id);
              if (result.success) {
                Alert.alert(
                  'Marked as Cleaned',
                  `${profile.getDisplayName()} has been marked as cleaned. The round counter has been reset.`
                );
              }
            }
          }
        ]
      );
      return true;
    }
    
    return false;
  }

  static checkForCleaningReminders() {
    const profilesNeedingCleaning = GunProfileService.getProfilesNeedingCleaning();
    
    if (profilesNeedingCleaning.length > 0) {
      if (profilesNeedingCleaning.length === 1) {
        this.showCleaningAlert(profilesNeedingCleaning[0]);
      } else {
        this.showMultipleCleaningAlert(profilesNeedingCleaning);
      }
      return true;
    }
    
    return false;
  }

  static showMultipleCleaningAlert(profiles) {
    const profileNames = profiles.map(p => p.getDisplayName()).join(', ');
    
    Alert.alert(
      'Multiple Guns Need Cleaning',
      `${profiles.length} guns need cleaning: ${profileNames}`,
      [
        {
          text: 'View Profiles',
          onPress: () => {
            // Navigate to Gun Profiles screen
            // This would typically use navigation
          }
        },
        {
          text: 'Dismiss',
          style: 'cancel'
        }
      ]
    );
  }

  static showSessionCompleteCleaningCheck(profile, roundsFired) {
    if (!profile || roundsFired <= 0) return false;

    const wasCleaningDue = profile.isCleaningDue();
    
    // Simulate adding rounds to check if cleaning becomes due
    const tempProfile = profile.clone();
    tempProfile.addRounds(roundsFired);
    
    const isNowCleaningDue = tempProfile.isCleaningDue();
    
    // Show alert if cleaning is now due (but wasn't before)
    if (isNowCleaningDue && !wasCleaningDue) {
      setTimeout(() => {
        Alert.alert(
          'Cleaning Reminder',
          `After this session, your ${profile.getDisplayName()} has reached ${tempProfile.getRoundsSinceLastCleaning()} rounds since last cleaning. Consider cleaning it soon.`,
          [
            {
              text: 'OK',
              style: 'default'
            },
            {
              text: 'Mark as Cleaned',
              onPress: async () => {
                const result = await GunProfileService.markProfileCleaned(profile.id);
                if (result.success) {
                  Alert.alert('Success', 'Gun marked as cleaned!');
                }
              }
            }
          ]
        );
      }, 1000); // Slight delay to let session save complete
      
      return true;
    }
    
    return false;
  }

  static getCleaningNotificationText(profile) {
    const cleaningStatus = profile.getCleaningStatus();
    
    switch (cleaningStatus.status) {
      case 'needs_cleaning':
        return `🚨 ${profile.getDisplayName()}: Cleaning overdue! ${profile.getRoundsSinceLastCleaning()} rounds fired.`;
      
      case 'warning':
        return `⚠️ ${profile.getDisplayName()}: Approaching cleaning interval. ${profile.getRoundsUntilCleaning()} rounds remaining.`;
      
      case 'clean':
        return `✅ ${profile.getDisplayName()}: ${profile.getRoundsUntilCleaning()} rounds until next cleaning.`;
      
      default:
        return '';
    }
  }

  static scheduleCleaningReminder(profile, delayMinutes = 60) {
    // In a production app, you would use a proper notification system
    // like @react-native-push-notification or @react-native-async-storage
    // For now, we'll use a simple setTimeout as demonstration
    
    if (profile.isCleaningDue()) {
      setTimeout(() => {
        this.showCleaningAlert(profile);
      }, delayMinutes * 60 * 1000);
      
      console.log(`Cleaning reminder scheduled for ${profile.getDisplayName()} in ${delayMinutes} minutes`);
      return true;
    }
    
    return false;
  }

  // Integration hook for session completion
  static onSessionComplete(profileId, sessionData) {
    try {
      const profile = GunProfileService.getProfile(profileId);
      if (profile && sessionData.rounds > 0) {
        this.showSessionCompleteCleaningCheck(profile, sessionData.rounds);
      }
    } catch (error) {
      console.error('Error in cleaning reminder session hook:', error);
    }
  }

  // Integration hook for app startup
  static onAppStartup() {
    try {
      // Check for any guns that need cleaning on app startup
      setTimeout(() => {
        this.checkForCleaningReminders();
      }, 2000); // Give app time to initialize
    } catch (error) {
      console.error('Error in cleaning reminder startup hook:', error);
    }
  }
}

export default CleaningReminderManager;