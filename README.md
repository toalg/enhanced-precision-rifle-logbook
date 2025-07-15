# Enhanced Precision Rifle Logbook

A comprehensive React Native mobile application for precision rifle enthusiasts to track shooting sessions, environmental conditions, ladder testing, and ballistic analytics.

## 🎯 Features

### Core Functionality
- **Session Logging**: Record detailed shooting sessions with date/time, rifle profiles, ammunition tracking
- **Environmental Integration**: Track temperature, humidity, pressure, and wind conditions
- **Ladder Testing**: Professional load development with charge weight analysis and velocity tracking
- **Advanced Analytics**: Velocity analysis, flat spot detection, and statistical analysis
- **Data Management**: Local storage, export/import, and cloud sync (premium feature)
- **Weather Meter Simulation**: Mock integration for environmental data capture

### Premium Features
- **Professional Analytics**: Advanced ballistic analysis tools
- **Cloud Sync**: Backup and sync data across devices
- **Enhanced Charts**: Detailed velocity and performance visualizations
- **Load Recommendations**: AI-powered load optimization suggestions

## 🏗️ Architecture

### Tech Stack
- **React Native** 0.80.1
- **React Navigation** for tab-based navigation
- **TypeScript** support
- **Local Storage** with SQLite (planned)
- **Event-driven architecture** for real-time updates

### Project Structure
```
PrecisionRifleLogbook/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Main application screens
│   ├── services/       # Business logic layer
│   ├── models/         # Data models and validation
│   └── database/       # Data persistence layer
├── android/           # Android-specific configuration
├── ios/              # iOS-specific configuration
└── rifle_logbook.html # Original web version
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

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

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## 📱 Screens

### Logbook Screen
- Record new shooting sessions
- View session history
- Environmental data simulation
- Form validation and data persistence

### Ladder Test Screen
- Create and manage ladder tests
- Track multiple charge weights
- Velocity analysis and statistics
- Load development tools

### Analytics Screen
- Professional ballistic analysis
- Velocity charts and visualizations
- Flat spot detection
- Statistical performance metrics
- Premium feature upgrades

### Settings Screen
- Data export/import
- Cloud sync configuration
- App preferences
- Premium feature management

## 🔧 Development

### Key Components
- **LogbookService**: Core business logic and data management
- **ShootingSession**: Data model for shooting sessions
- **LadderTest**: Data model for load development tests
- **MockDatabaseService**: Development data persistence

### Event System
The app uses an event-driven architecture for real-time UI updates:
```javascript
// Subscribe to events
LogbookService.addEventListener('sessionSaved', handleSessionSaved);

// Emit events
LogbookService.emit('sessionSaved', { session: data });
```

## 📊 Data Models

### ShootingSession
- Date/time, rifle profile, range distance
- Environmental conditions (temperature, humidity, pressure, wind)
- Ballistic data (predicted vs actual elevation/windage)
- Notes and target photos

### LadderTest
- Multiple charge weights and velocities
- Statistical analysis
- Consistency metrics
- Load recommendations

## 🔮 Roadmap

### Phase 1: Data Layer Migration
- [ ] Replace MockDatabaseService with SQLite
- [ ] Implement real data persistence
- [ ] Add export/import functionality

### Phase 2: Analytics & Charts
- [ ] Integrate chart libraries
- [ ] Implement velocity analysis visualizations
- [ ] Complete analytics screen

### Phase 3: Device Integration
- [ ] Camera for target photos
- [ ] Weather meter Bluetooth connectivity
- [ ] GPS for range locations

### Phase 4: Cloud & Polish
- [ ] Firebase integration
- [ ] Cloud sync implementation
- [ ] App store preparation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Target Users

- **Precision rifle shooters** and long-range shooters
- **Handloaders** developing custom ammunition
- **Competitive shooters** tracking performance
- **Hunters** wanting to understand their rifle's ballistics

## 💡 Key Capabilities

- **Environmental tracking** - accounts for weather conditions
- **Ballistic calculations** - predicted vs actual trajectory
- **Load development** - systematic testing of different powder charges
- **Performance analytics** - identify patterns and improvements
- **Professional-grade tools** - similar to expensive ballistic software

---

**Built with ❤️ for the precision shooting community** 