# Yanga Rides - Uber-Style Ride Booking App

A beautiful, clean ride-booking application built with React Native, Expo, and Zustand. Features a minimalist black and white theme with comprehensive ride management capabilities.

## Features

### User Authentication
- Email/phone registration and login
- Profile management
- Saved locations

### Ride Booking
- Interactive map with current location
- Enter pickup and destination points
- View estimated fare and time
- Multiple vehicle types (Standard, Premium, XL)
- Real-time fare calculation

### Trip Management
- Active trip tracking
- Driver information display
- Cancel ride with reason selection
- Trip status updates

### Rating & Feedback
- Rate driver and trip experience
- Submit detailed feedback
- Issue reporting for low ratings

### Profile & History
- View ride history
- Trip statistics
- Account management
- Notification settings

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Maps**: react-native-maps with Expo Location
- **Icons**: @expo/vector-icons (Ionicons)
- **Package Manager**: Bun

## Installation

### Prerequisites

- Node.js 18+ or Bun
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Setup

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Configure Google Maps API**:
   - Get API keys from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Maps SDK for Android/iOS
   - Update `app.json` with your API keys:
     - Replace `YOUR_GOOGLE_MAPS_API_KEY_IOS` (iOS)
     - Replace `YOUR_GOOGLE_MAPS_API_KEY_ANDROID` (Android)

3. **Run the app**:
   ```bash
   # Start development server
   bun start

   # Run on iOS
   bun ios

   # Run on Android
   bun android
   ```

## Project Structure

```
yanga-client/
├── app/                      # Expo Router pages
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── home.tsx         # Main map screen
│   │   ├── history.tsx      # Ride history
│   │   └── profile.tsx      # User profile
│   ├── login.tsx            # Login screen
│   ├── register.tsx         # Registration screen
│   ├── booking.tsx          # Ride booking flow
│   ├── trip.tsx             # Active trip screen
│   └── rating.tsx           # Trip rating screen
├── components/
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx       # Custom button
│       ├── Input.tsx        # Text input
│       └── Card.tsx         # Card container
├── constants/
│   └── colors.ts            # Theme colors
├── store/
│   ├── useAuthStore.ts      # Authentication state
│   └── useRideStore.ts      # Ride management state
└── hooks/                   # Custom hooks
```

## State Management

The app uses Zustand for clean, minimal state management:

### Auth Store (`useAuthStore`)
- User authentication
- Profile management
- Login/logout functionality

### Ride Store (`useRideStore`)
- Ride booking and management
- Location handling
- Fare calculation
- Trip history

## Screens Overview

### Authentication
- **Login**: Email/password authentication
- **Register**: New user registration with validation

### Main App
- **Home**: Interactive map with location services
- **Booking**: Select locations, vehicle type, and book rides
- **Trip**: Active ride tracking with driver info
- **Rating**: Rate completed rides with feedback
- **History**: View past rides and trip details
- **Profile**: Manage account and settings

## Design System

### Theme
- **Light Mode**: White background, black text
- **Dark Mode**: Black background, white text
- Minimalist, clean design
- Consistent spacing and typography

### Components
- Custom buttons with variants (primary, secondary, outline)
- Styled text inputs with icons
- Card components with elevation
- Ionicons for all icons (no emojis)

## API Integration Notes

Currently using mock data for demonstration. To integrate with a real backend:

1. Update auth methods in `store/useAuthStore.ts`
2. Replace booking logic in `store/useRideStore.ts`
3. Add API client configuration
4. Update location services for real-time tracking

## Environment Variables

Create a `.env` file for API keys and configuration:

```env
GOOGLE_MAPS_API_KEY=your_key_here
API_BASE_URL=your_api_url_here
```

## Development

### Adding New Features

1. Create screen in `app/` directory
2. Add to navigation in `app/_layout.tsx`
3. Create store in `store/` if needed
4. Build reusable components in `components/ui/`

### Styling Guidelines

- Use color constants from `constants/colors.ts`
- Follow existing component patterns
- Maintain black/white theme consistency
- Use Ionicons for all icons

## Testing

```bash
# Run tests (when implemented)
bun test
```

## Building for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## Troubleshooting

### Maps not showing
- Verify Google Maps API keys are set correctly
- Check location permissions are granted
- Ensure Maps SDK is enabled in Google Cloud Console

### Location services not working
- Grant location permissions in device settings
- Check `app.json` permissions configuration

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ using React Native & Expo**
