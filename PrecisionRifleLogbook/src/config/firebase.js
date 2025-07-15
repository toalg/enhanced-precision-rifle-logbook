/**
 * Firebase Configuration
 * Replace these placeholder values with your actual Firebase project credentials
 */

export const firebaseConfig = {
  // Your Firebase project configuration
  // Get these values from your Firebase Console
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional, for Analytics
};

// Firebase service initialization
export const initializeFirebase = () => {
  // Firebase is auto-initialized by @react-native-firebase/app
  // This function can be used for any additional setup
  console.log('Firebase initialized');
};

// Firebase collections
export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  SESSIONS: 'sessions',
  LADDER_TESTS: 'ladderTests',
  RIFLE_PROFILES: 'rifleProfiles',
  SETTINGS: 'settings',
  ANALYTICS: 'analytics'
};

// Firebase storage paths
export const STORAGE_PATHS = {
  TARGET_PHOTOS: 'target-photos',
  USER_AVATARS: 'user-avatars',
  EXPORTS: 'exports'
}; 