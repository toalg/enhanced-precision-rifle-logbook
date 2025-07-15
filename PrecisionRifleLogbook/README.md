# Enhanced Precision Rifle Logbook

A comprehensive React Native application for precision rifle enthusiasts to track shooting sessions, perform ladder tests, analyze performance data, and manage their shooting activities with integrated cloud storage and analytics.

## Features

- **Session Logging**: Record detailed shooting sessions with targets, conditions, and equipment
- **Ladder Testing**: Built-in ladder test functionality for load development
- **Analytics Dashboard**: Performance metrics and trend analysis
- **Cloud Integration**: Firebase and Supabase backend support
- **Cross-Platform**: iOS and Android support
- **Offline Capability**: Local storage with cloud sync

## Tech Stack

- **Frontend**: React Native 0.80.1
- **Navigation**: React Navigation v7
- **Backend**: Firebase (Firestore, Auth, Storage) + Supabase
- **Database**: SQLite (local) + Cloud databases
- **Language**: TypeScript/JavaScript

## Prerequisites

- Node.js >= 18
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS dependencies)

## Installation

### 1. Clone and Install Dependencies

```sh
git clone <your-repo-url>
cd PrecisionRifleLogbook
npm install
```

### 2. iOS Setup

Install CocoaPods dependencies:

```sh
cd ios
bundle install
bundle exec pod install
cd ..
```

### 3. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Download `GoogleService-Info.plist` for iOS
3. Place `GoogleService-Info.plist` in `ios/PrecisionRifleLogbook/`
4. Add the file to your Xcode project (drag and drop into the project navigator)

### 4. Supabase Configuration

1. Create a Supabase project at [Supabase Dashboard](https://supabase.com/dashboard)
2. Copy your project URL and anon key
3. Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Started

### Start Metro Bundler

```sh
npm start
# or
npx react-native start
```

### Run on iOS

```sh
npm run ios
# or
npx react-native run-ios
```

### Run on Android

```sh
npm run android
# or
npx react-native run-android
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components (Button, Card, etc.)
├── database/           # Database schemas and migrations
├── models/             # Data models (LadderTest, ShootingSession)
├── screens/            # App screens
│   ├── AnalyticsScreen.js
│   ├── LadderTestScreen.js
│   ├── LogbookScreen.js
│   └── SettingsScreen.js
└── services/           # Backend services
    ├── DatabaseService.js
    ├── LogbookService.js
    └── MockDatabaseService.js
```

## Firebase Setup

The app is configured to use Firebase for:
- **Authentication**: User login and registration
- **Firestore**: Document-based data storage
- **Storage**: File uploads (target images, etc.)

Firebase is automatically initialized in `ios/PrecisionRifleLogbook/AppDelegate.swift`:

```swift
import FirebaseCore

func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
    // Configure Firebase
    FirebaseApp.configure()
    // ... rest of initialization
}
```

## Supabase Setup

Supabase provides:
- **PostgreSQL Database**: Relational data storage
- **Real-time subscriptions**: Live data updates
- **Row Level Security**: Data access control

## Troubleshooting

### Common Issues

1. **"RNFBAppModule not found" Error**
   - Ensure `GoogleService-Info.plist` is in the correct location
   - Clean build: `cd ios && xcodebuild clean && cd ..`
   - Reset Metro cache: `npx react-native start --reset-cache`

2. **Pod Install Issues**
   - Update CocoaPods: `sudo gem install cocoapods`
   - Clean and reinstall: `cd ios && rm -rf Pods && bundle exec pod install`

3. **Metro Cache Issues**
   - Clear cache: `npx react-native start --reset-cache`
   - Delete node_modules: `rm -rf node_modules && npm install`

### iOS Build Issues

If you encounter build issues on iOS:

1. Clean the build folder in Xcode (Product → Clean Build Folder)
2. Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`
3. Rebuild the project

### Android Build Issues

For Android issues:

1. Clean the project: `cd android && ./gradlew clean && cd ..`
2. Clear React Native cache: `npx react-native start --reset-cache`

## Development

### Adding New Features

1. Create new screens in `src/screens/`
2. Add navigation routes in `App.tsx`
3. Update services as needed in `src/services/`
4. Test on both iOS and Android

### Database Schema

The app uses a hybrid approach:
- **Local**: SQLite for offline functionality
- **Cloud**: Firebase Firestore and Supabase PostgreSQL for sync

### Testing

```sh
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both platforms
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review React Native documentation
- Check Firebase and Supabase documentation for backend issues
