# 🚀 QUICK START GUIDE

## Step 1: Add Your Google Maps API Key

1. **Copy the environment file template:**

   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file and add your Google Maps API key:**

   ```
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
   ```

3. **Get your API key from Google Cloud Console:**

   - Go to https://console.cloud.google.com/
   - Create a project or select existing one
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key and paste it in your `.env` file

4. **Enable required APIs in Google Cloud Console:**
   - Maps SDK for Android
   - Maps SDK for iOS
   - Directions API
   - Places API
   - Distance Matrix API
   - Geocoding API

## Step 2: Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

## Step 3: Run the App

```bash
npm start
```

Then press:

- `a` for Android
- `i` for iOS
- `w` for Web

## ✅ That's it!

You should now see:

- ✨ Clean Uber-style UI
- 🗺️ Real-time Google Maps
- 🔍 Live place search with Google Places API
- 📍 Accurate directions and navigation

## 🆘 Troubleshooting

**Maps not loading?**

- Check your API key in `.env` file
- Verify all APIs are enabled in Google Cloud Console
- Ensure billing is enabled (required for Google Maps APIs)

**Places search not working?**

- Confirm Places API is enabled
- Check API key restrictions
- Look for errors in the console

**Build errors?**

- Try `npx expo start -c` to clear cache
- Delete `node_modules` and reinstall

## 📚 More Info

See `SETUP.md` and `CHANGES.md` for detailed documentation.
