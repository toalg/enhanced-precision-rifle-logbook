# Enhanced Precision Rifle Logbook

A comprehensive React Native mobile application for precision rifle enthusiasts to track shooting sessions, environmental conditions, ladder testing, and ballistic analytics. Features a modern, unified UI design with professional-grade tools for serious shooters.

## 🎯 Features

### Core Functionality
- **Session Logging**: Record detailed shooting sessions with date/time, rifle profiles, ammunition tracking
- **Environmental Integration**: Track temperature, humidity, pressure, and wind conditions
- **Ladder Testing**: Professional load development with charge weight analysis and velocity tracking
- **Advanced Analytics**: Velocity analysis, flat spot detection, and statistical analysis
- **Gun Profile Management**: Track multiple rifles with cleaning schedules and maintenance logs
- **Data Management**: Local storage, export/import, and cloud sync (premium feature)
- **Weather Meter Simulation**: Mock integration for environmental data capture

### Premium Features
- **Professional Analytics**: Advanced ballistic analysis tools with P/E ratio overlays
- **Cloud Sync**: Backup and sync data across devices with encrypted storage
- **Enhanced Charts**: Detailed velocity and performance visualizations
- **Load Recommendations**: AI-powered load optimization suggestions
- **Advanced Risk Metrics**: Professional-grade risk assessment tools

### UI/UX Improvements
- **Unified Design System**: Consistent dark theme across all screens
- **Professional Typography**: Standardized text hierarchy and spacing
- **Modern Card Components**: Reusable UI components with consistent styling
- **Responsive Layout**: Optimized for both iOS and Android devices
- **Accessibility**: Proper contrast ratios and touch targets

## 🏗️ Architecture

### Tech Stack
- **React Native** 0.80.1
- **React Navigation** for tab-based navigation
- **TypeScript** support with proper type definitions
- **Supabase** for cloud database and authentication
- **Local Storage** with SQLite for offline functionality
- **Event-driven architecture** for real-time updates

### Project Structure
```
PrecisionRifleLogbook/
├── src/
│   ├── components/     # Reusable UI components with unified theme
│   │   ├── common/     # Button, Card, InputField, AppStyles
│   │   └── gunProfiles/ # Profile-specific components
│   ├── screens/        # Main application screens
│   │   ├── LogbookScreen.js      # Session logging
│   │   ├── LadderTestScreen.js   # Load development
│   │   ├── AnalyticsScreen.js    # Ballistic analysis
│   │   ├── SettingsScreen.js     # App configuration
│   │   └── GunProfilesScreen.js  # Rifle management
│   ├── services/       # Business logic layer
│   │   ├── LogbookService.js     # Core data management
│   │   ├── GunProfileService.js  # Rifle profile logic
│   │   └── UnifiedDataService.js # Data abstraction
│   ├── models/         # Data models and validation
│   ├── config/         # Supabase and Firebase configuration
│   ├── context/        # React Context for state management
│   └── utils/          # Utility functions and patches
├── android/           # Android-specific configuration
├── ios/              # iOS-specific configuration
└── rifle_logbook.html # Original web version reference
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)
- Supabase account (for cloud features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/toalg/enhanced-precision-rifle-logbook.git
   cd enhanced-precision-rifle-logbook/PrecisionRifleLogbook
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Environment Configuration**
   ```bash
   # Copy and configure your Supabase credentials
   cp src/config/supabase.example.js src/config/supabase.js
   # Edit supabase.js with your project URL and anon key
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## 📱 Screens

### Logbook Screen
- Record new shooting sessions with comprehensive data capture
- View session history with filtering and search
- Environmental data simulation and integration
- Form validation and real-time data persistence
- Professional-grade data entry interface

### Ladder Test Screen
- Create and manage ladder tests for load development
- Track multiple charge weights with velocity analysis
- Statistical analysis and consistency metrics
- Professional load development tools
- Export and share test results

### Analytics Screen
- Professional ballistic analysis with advanced metrics
- Velocity charts and performance visualizations
- P/E ratio overlays and risk assessment
- Flat spot detection and statistical analysis
- Premium feature upgrades and advanced tools

### Settings Screen
- **Unified Design**: Consistent dark theme with professional styling
- **Premium Management**: Upgrade flow and feature gating
- **Cloud Sync**: Encrypted backup and cross-device synchronization
- **Data Management**: Export/import with JSON format
- **Gun Profiles**: Rifle management and maintenance tracking
- **Storage Information**: Data usage and sync status

### Gun Profiles Screen
- Manage multiple rifle configurations
- Track cleaning schedules and maintenance
- Store ballistic coefficients and zero data
- Professional rifle management interface

## 🎨 Design System

### Unified Theme
- **Dark Theme**: Professional dark background with proper contrast
- **Typography**: Consistent font hierarchy using Typography system
- **Colors**: Standardized color palette with semantic naming
- **Spacing**: Unified spacing system using Spacing constants
- **Components**: Reusable Card, Button, and InputField components

### Card Variants
- **Dark**: Standard cards with gray borders
- **Success**: Premium features with green accents
- **Error**: Danger zone with red styling
- **Info**: Information sections with blue accents

## 🔧 Development

### Key Components
- **LogbookService**: Core business logic and data management
- **GunProfileService**: Rifle profile management and maintenance
- **UnifiedDataService**: Data abstraction layer
- **AppStyles**: Centralized design system constants

### Event System
The app uses an event-driven architecture for real-time UI updates:
```javascript
// Subscribe to events
LogbookService.addEventListener('sessionSaved', handleSessionSaved);
LogbookService.addEventListener('premiumEnabled', handlePremiumEnabled);

// Emit events
LogbookService.emit('sessionSaved', { session: data });
```

### Database Schema
- **Shooting Sessions**: Comprehensive session data with environmental conditions
- **Ladder Tests**: Load development data with statistical analysis
- **Gun Profiles**: Rifle configurations and maintenance schedules
- **User Settings**: App preferences and premium status

## 📊 Data Models

### ShootingSession
- Date/time, rifle profile, range distance
- Environmental conditions (temperature, humidity, pressure, wind)
- Ballistic data (predicted vs actual elevation/windage)
- Notes and target photos
- Premium analytics integration

### LadderTest
- Multiple charge weights and velocities
- Statistical analysis and consistency metrics
- Load recommendations and optimization
- Export capabilities for sharing

### GunProfile
- Rifle identification and configuration
- Ballistic coefficients and zero data
- Cleaning schedules and maintenance logs
- Performance tracking and analytics

## 🔮 Roadmap

### Phase 1: Enhanced Analytics ✅
- [x] Unified Settings theme and design system
- [x] Professional card components and typography
- [x] Premium feature gating and upgrade flow
- [x] Cloud sync infrastructure

### Phase 2: Advanced Features
- [ ] Real-time weather integration
- [ ] Camera integration for target photos
- [ ] GPS for range location tracking
- [ ] Advanced ballistic calculations

### Phase 3: Professional Tools
- [ ] Wind reading integration
- [ ] Advanced chart libraries
- [ ] Load optimization algorithms
- [ ] Competition tracking features

### Phase 4: Platform Expansion
- [ ] Web dashboard companion
- [ ] API for third-party integrations
- [ ] Advanced cloud analytics
- [ ] App store deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the established design system and coding standards
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Standards
- Follow the unified design system
- Use TypeScript for new components
- Maintain consistent code formatting
- Add proper error handling
- Include accessibility considerations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Target Users

- **Precision rifle shooters** and long-range shooters
- **Handloaders** developing custom ammunition
- **Competitive shooters** tracking performance
- **Hunters** wanting to understand their rifle's ballistics
- **Professional shooters** requiring advanced analytics

## 💡 Key Capabilities

- **Environmental tracking** - accounts for weather conditions
- **Ballistic calculations** - predicted vs actual trajectory
- **Load development** - systematic testing of different powder charges
- **Performance analytics** - identify patterns and improvements
- **Professional-grade tools** - similar to expensive ballistic software
- **Unified design system** - consistent, professional user experience
- **Cloud integration** - secure data backup and synchronization

## 🔒 Security & Privacy

- **Local-first architecture** - data stays on your device by default
- **Encrypted cloud storage** - premium feature with end-to-end encryption
- **No data mining** - your shooting data belongs to you
- **Offline functionality** - works without internet connection

---

**Built with ❤️ for the precision shooting community**

*Professional tools for serious shooters* 