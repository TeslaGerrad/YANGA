# Quick Start Guide

## Installation Steps

1. **Install required dependencies** (if you skipped the automatic installation):

```bash
cd /home/namycodes/Desktop/Work_Projects/yanga/yanga-driver
bun add @react-native-async-storage/async-storage expo-location
```

2. **Start the development server**:

```bash
bun start
```

3. **Run on your preferred platform**:

```bash
# iOS
bun ios

# Android
bun android

# Web
bun web
```

## Required Packages

The app requires these additional packages that may need to be installed:

```bash
bun add @react-native-async-storage/async-storage expo-location
```

All other dependencies are already included in your package.json:

- ✅ @gorhom/bottom-sheet
- ✅ react-native-maps
- ✅ react-native-gesture-handler
- ✅ react-native-reanimated
- ✅ expo-router
- ✅ react-native-safe-area-context

## Testing the App

Once running, you'll see:

1. **Home Tab**: View and manage ride requests

   - Tap on a ride card to see details in the bottom sheet
   - Accept or dismiss rides
   - Make counter offers on pricing

2. **Earnings Tab**: Track your income

   - Switch between Today, This Month, This Year, All Time
   - View breakdown of earnings and commission
   - See recent earning history

3. **Profile Tab**: Manage your driver profile
   - View your stats and rating
   - Check vehicle information
   - Access settings and support

## Demo Features

The app includes demo data with:

- 2 initial mock ride requests
- Automatic new ride generation every 30 seconds
- Simulated earnings data
- Mock driver profile

## Next Steps

To connect to a real backend:

1. Replace mock data in `context/driver-context.tsx` with API calls
2. Implement WebSocket for real-time ride updates
3. Add authentication flow
4. Integrate payment processing
5. Add push notifications

Happy coding! 🚀
