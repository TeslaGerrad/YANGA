# Yanga Client - Setup Instructions

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

### 2. Configure Google Maps API Key

#### Get Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:

   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Directions API**
   - **Places API**
   - **Distance Matrix API**
   - **Geocoding API**

4. Go to **Credentials** and create an API key

#### Set Up Environment Variable

1. Copy the `.env.example` file to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:
   ```
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC...your-actual-key-here
   ```

#### Important Security Notes

- **Never commit your `.env` file to version control**
- The `.env` file is already in `.gitignore`
- For production, use environment-specific configuration
- Consider using API key restrictions in Google Cloud Console:
  - Restrict by application (bundle ID for iOS, package name for Android)
  - Restrict by IP address for web
  - Set usage quotas to prevent unexpected charges

### 3. Run the App

```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 🎨 Features

### Uber-Style UI

- Clean, minimal design with black and white color scheme
- Smooth animations and transitions
- Professional card-based layouts
- Modern iconography using Ionicons

### Real-Time Maps

- Google Maps integration with real-time directions
- Live location tracking
- Custom markers for pickup and destination
- Route visualization with distance and duration

### Google Places API Integration

- Real-time place autocomplete
- Accurate address suggestions
- Distance calculations
- Current location detection

## 📱 Screens

1. **Home Screen** - Main map view with "Where to?" search
2. **Search Results** - Google Places autocomplete with real locations
3. **Search Destination** - Route preview and confirmation
4. **Ride Selection** - Choose vehicle type and see fare estimates
5. **Finding Driver** - Real-time driver matching
6. **Trip** - Active ride tracking

## 🔧 Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Zustand** for state management
- **Google Maps SDK** for mapping
- **Google Places API** for location search
- **Expo Location** for GPS

## 📦 Key Dependencies

```json
{
  "expo": "~54.0.29",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo-constants": "~18.0.12",
  "expo-location": "^19.0.8",
  "react-native-maps": "1.20.1",
  "react-native-maps-directions": "^1.9.0",
  "zustand": "^5.0.9"
}
```

## 🗺️ Map Configuration

The app uses Google Maps with custom styling:

- **Light mode**: Clean, minimal POI markers
- **Dark mode**: Dark theme with reduced visual clutter
- **Custom markers**: Black and white design matching Uber's aesthetic

## 🚨 Troubleshooting

### Maps Not Loading

1. Check that your API key is set in `.env`
2. Verify all required APIs are enabled in Google Cloud Console
3. Ensure location permissions are granted
4. Check that the API key is not restricted for your development environment

### Places API Not Working

1. Confirm Places API is enabled in Google Cloud Console
2. Check API key restrictions
3. Verify billing is enabled (Google requires it even for free tier)
4. Check console for specific error messages

### Build Errors

1. Clear cache: `npx expo start -c`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Update Expo: `npx expo install --fix`

## 🌍 Supported Regions

The app is configured for Zambia but can be easily adapted for any region by:

1. Changing the initial map coordinates in the code
2. Updating the country bias in Places API calls
3. Adjusting the default location in `useRideStore.ts`

## 📄 License

MIT License - feel free to use this for your own projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions, please open an issue on GitHub.
