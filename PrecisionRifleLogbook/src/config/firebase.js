/**
 * Firebase Configuration
 * Replace these placeholder values with your actual Firebase project credentials
 */

export const firebaseConfig = {
  apiKey: "AIzaSyClgqto0B-sljcpbkNafHgusw7oPSDVsZk",
  authDomain: "prs-log-book.firebaseapp.com",
  projectId: "prs-log-book",
  storageBucket: "prs-log-book.firebasestorage.app",
  messagingSenderId: "560300801821",
  appId: "1:560300801821:ios:2fb509f421ada3bb8c6bf4"
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