# Setup Instructions for Firebase and Supabase

This guide will help you set up Firebase and Supabase for your Enhanced Precision Rifle Logbook app.

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `enhanced-precision-rifle-logbook`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Add Android App
1. In Firebase Console, click "Add app" → "Android"
2. Android package name: `com.precisionriflelogbook`
3. App nickname: `Precision Rifle Logbook`
4. Click "Register app"
5. Download `google-services.json`
6. Place `google-services.json` in `android/app/` directory

### 3. Add iOS App
1. In Firebase Console, click "Add app" → "iOS"
2. iOS bundle ID: `com.precisionriflelogbook`
3. App nickname: `Precision Rifle Logbook`
4. Click "Register app"
5. Download `GoogleService-Info.plist`
6. Place `GoogleService-Info.plist` in `ios/PrecisionRifleLogbook/` directory

### 4. Enable Authentication
1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Email/Password"
3. Enable "Google" (optional)
4. Enable "Apple" (optional, for iOS)

### 5. Create Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Start in test mode (for development)
4. Choose location closest to your users

### 6. Set Up Storage
1. Go to "Storage"
2. Click "Get started"
3. Start in test mode (for development)
4. Choose location closest to your users

### 7. Update Firebase Config
1. Go to Project Settings → General
2. Copy the config values
3. Update `src/config/firebase.js` with your actual values:

```javascript
export const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 🟦 Supabase Setup

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New project"
3. Choose organization
4. Project name: `enhanced-precision-rifle-logbook`
5. Database password: (generate a strong password)
6. Region: Choose closest to your users
7. Click "Create new project"

### 2. Get Project Credentials
1. In Supabase Dashboard, go to Settings → API
2. Copy the following values:
   - Project URL
   - Anon public key
3. Update `src/config/supabase.js`:

```javascript
const supabaseUrl = 'your-project-url';
const supabaseAnonKey = 'your-anon-key';
```

### 3. Create Database Schema
1. In Supabase Dashboard, go to SQL Editor
2. Copy the contents of `src/database/supabase-schema.sql`
3. Paste and run the SQL script
4. This will create all necessary tables, indexes, and RLS policies

### 4. Set Up Storage Buckets
The SQL script will automatically create the storage buckets, but you can verify:
1. Go to Storage in Supabase Dashboard
2. You should see: `target-photos`, `user-avatars`, `exports`, `temp`

### 5. Configure Authentication (Optional)
If you want to use Supabase Auth instead of Firebase Auth:
1. Go to Authentication → Settings
2. Configure email templates
3. Set up OAuth providers if needed

## 🔧 iOS Configuration

### 1. Update iOS Podfile
Add Firebase pods to `ios/Podfile`:

```ruby
target 'PrecisionRifleLogbook' do
  # ... existing pods ...
  
  # Firebase pods
  pod 'Firebase/Core'
  pod 'Firebase/Auth'
  pod 'Firebase/Firestore'
  pod 'Firebase/Storage'
end
```

### 2. Install iOS Dependencies
```bash
cd ios
pod install
cd ..
```

## 🤖 Android Configuration

### 1. Update Android Build Files
The `google-services.json` file should automatically configure Android.

### 2. Verify Android Permissions
Ensure `android/app/src/main/AndroidManifest.xml` has necessary permissions:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## 🚀 Testing the Setup

### 1. Test Firebase Connection
```javascript
// In your app, test Firebase initialization
import FirebaseService from './src/services/FirebaseService';

const testFirebase = async () => {
  const result = await FirebaseService.initialize();
  console.log('Firebase test result:', result);
};
```

### 2. Test Supabase Connection
```javascript
// In your app, test Supabase initialization
import SupabaseService from './src/services/SupabaseService';

const testSupabase = async () => {
  const result = await SupabaseService.initialize();
  console.log('Supabase test result:', result);
};
```

### 3. Test Authentication
```javascript
// Test user registration
const testAuth = async () => {
  const result = await UnifiedDataService.signUpWithEmail('test@example.com', 'password123');
  console.log('Auth test result:', result);
};
```

## 🔒 Security Rules

### Firebase Security Rules
Update Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /ladderTests/{testId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

Update Storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /target-photos/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /exports/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Supabase RLS Policies
The SQL script already includes RLS policies, but you can verify in Supabase Dashboard:
1. Go to Authentication → Policies
2. Verify all tables have appropriate policies

## 🐛 Troubleshooting

### Common Issues

1. **Firebase initialization fails**
   - Check that `google-services.json` and `GoogleService-Info.plist` are in correct locations
   - Verify Firebase config values match your project

2. **Supabase connection fails**
   - Check project URL and anon key
   - Verify database is created and accessible

3. **Authentication not working**
   - Check that Email/Password auth is enabled in Firebase
   - Verify RLS policies in Supabase

4. **Storage upload fails**
   - Check storage rules in Firebase
   - Verify storage buckets exist in Supabase

### Debug Commands
```bash
# Check if pods are installed correctly
cd ios && pod install && cd ..

# Clean and rebuild
npx react-native clean
npx react-native run-ios  # or run-android
```

## 📱 Next Steps

After setup is complete:

1. **Test the app** with real Firebase and Supabase connections
2. **Implement authentication UI** in your app
3. **Add data persistence** using the UnifiedDataService
4. **Test file uploads** for target photos
5. **Implement real-time features** using Supabase subscriptions

## 🔄 Environment Variables (Optional)

For production, consider using environment variables:

```bash
# .env file
FIREBASE_API_KEY=your-api-key
FIREBASE_PROJECT_ID=your-project-id
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
```

Then update config files to use `process.env.VARIABLE_NAME`.

---

**Need help?** Check the Firebase and Supabase documentation, or create an issue in the project repository. 