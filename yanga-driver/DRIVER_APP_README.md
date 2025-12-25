# Yanga Driver App 🚗

A professional Uber-like driver application built with React Native and Expo, designed for drivers to manage ride requests, track earnings, and view their profile.

## 📱 Features

### 🏠 Home Screen

- **Real-time ride requests** with automatic updates every 30 seconds
- **Interactive map** showing pickup locations for pending rides
- **Ride cards** with passenger info, ratings, pickup/dropoff locations
- **Active ride tracking** with ability to complete rides
- **Smart notifications** for new ride requests
- **Drawer navigation** for easy access to all screens

### 💰 Earnings Screen

- **Multiple time periods**: Today, This Month, This Year, All Time
- **Earnings breakdown** with commission calculation (20%)
- **Detailed statistics**: Total earnings, net income, average per ride
- **Recent earnings history** with ride details
- **Visual cards** with earnings summaries

### 👤 Profile Screen

- **Driver information** with avatar, name, email, rating
- **Statistics overview**: Total rides, earnings, monthly/daily rides
- **Vehicle information**: Model and license plate
- **Contact details**: Phone and email
- **Quick actions**: Help & Support, Documents, Payment Methods, Ride History
- **Settings and logout** options

### 🎯 Ride Management

- **Accept rides** instantly or with counter offers
- **Dismiss unwanted rides** to keep your queue clean
- **Counter offer pricing** to negotiate fares
- **View trip details**: Distance, duration, pickup/dropoff locations
- **Passenger ratings** to make informed decisions

### 🎨 Navigation

- **Drawer layout** for intuitive navigation between screens
- **Custom drawer** with driver profile and quick stats
- **Beautiful UI** with smooth animations and transitions

## 🛠️ Technologies Used

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for routing
- **@gorhom/bottom-sheet** for smooth bottom sheet interactions
- **react-native-maps** for map visualization
- **@react-native-async-storage/async-storage** for local data persistence
- **Context API** for state management

## 📦 Installation

### Prerequisites

- Node.js 16+
- Bun package manager
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Install Dependencies

```bash
cd yanga-driver
bun install @react-native-async-storage/async-storage expo-location
```

### Run the App

```bash
# Start the Expo development server
bun start

# Run on iOS
bun ios

# Run on Android
bun android

# Run on Web
bun web
```

## 🗂️ Project Structure

```
yanga-driver/
├── app/
│   ├── _layout.tsx            # Root drawer navigation layout
│   ├── index.tsx              # Redirect to home screen
│   ├── home.tsx               # Home screen with ride requests
│   ├── earnings.tsx           # Earnings dashboard
│   ├── profile.tsx            # Profile screen
│   └── (tabs)/                # Old tab structure (can be removed)
├── components/
│   ├── ride-request-sheet.tsx # Bottom sheet for ride details
│   ├── custom-drawer.tsx      # Custom drawer content
│   └── ui/                    # Reusable UI components
├── context/
│   └── driver-context.tsx     # Global state management
├── types/
│   └── index.ts               # TypeScript type definitions
└── constants/
    └── theme.ts               # Theme colors and styles
```

## 🎨 Key Components

### DriverContext

Global state management for:

- Driver profile data
- Ride requests (pending, accepted, completed)
- Earnings tracking
- Real-time ride generation

### RideRequestSheet

Interactive bottom sheet featuring:

- Passenger information
- Trip details with map markers
- Distance and duration
- Price negotiation
- Accept/Dismiss actions

### Home Screen

Main interface showing:

- Driver status and rating
- Interactive map with ride markers
- List of pending ride requests
- Active rides section

### Earnings Screen

Comprehensive earnings tracking:

- Period filters (day/month/year/all)
- Total and net earnings
- Commission breakdown
- Recent earnings history

### Profile Screen

Driver profile management:

- Personal information
- Statistics dashboard
- Vehicle details
- Quick action buttons

## 💾 Data Storage

The app uses AsyncStorage to persist:

- Driver profile information
- Ride history
- Earnings data

Data is automatically saved when:

- Rides are accepted, dismissed, or completed
- Driver information is updated
- New earnings are recorded

## 🔄 Real-Time Features

- **Automatic ride generation**: New ride requests appear every 30 seconds (configurable)
- **Auto-select first ride**: The first pending ride is automatically selected
- **Live updates**: Earnings and statistics update in real-time
- **Persistent state**: All data persists across app restarts

## 🎯 Future Enhancements

- [ ] Push notifications for ride requests
- [ ] GPS navigation integration
- [ ] Chat with passengers
- [ ] Ride history with filters
- [ ] Payment integration
- [ ] Document upload and verification
- [ ] Multiple language support
- [ ] Dark mode theme
- [ ] Offline mode
- [ ] Analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Built with ❤️ for Yanga Driver Platform

---

**Note**: This is a demo application with mock data. For production use, integrate with a real backend API and implement proper authentication, real-time WebSocket connections, and payment processing.
