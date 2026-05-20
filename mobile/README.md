# 📱 Pet Dinner — Mobile App

Cross-platform mobile app for Pet Dinner, built with **React Native + Expo**. Runs on both **iOS and Android** from a single codebase.

---

## Prerequisites

- Node.js 18+
- Backend running and reachable from your device (see root README)
- **Expo Go** app installed on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

---

## Running the App

### Option A — Expo Go (fastest, no Xcode/Android Studio needed)

```bash
npm install
npx expo start
```

A QR code appears in the terminal:
- **iOS** — open the Camera app and scan, or use the Expo Go app
- **Android** — scan inside the Expo Go app

> Your phone and development machine must be on the **same Wi-Fi network**.

---

### Option B — iOS Simulator (requires macOS + Xcode 15+)

```bash
npx expo run:ios
```

Or press `i` after running `npx expo start`.

---

### Option C — Android Emulator (requires Android Studio)

```bash
npx expo run:android
```

Or press `a` after running `npx expo start`.

---

## Configuring the Backend URL

Open `src/api/client.js` and set `API_BASE` to match your environment:

```js
// iOS Simulator or web browser
export const API_BASE = 'http://localhost:3001';

// Android Emulator
export const API_BASE = 'http://10.0.2.2:3001';

// Physical device — replace with your machine's local IP
export const API_BASE = 'http://192.168.1.100:3001';
```

---

## Screens

| Screen | Description |
|--------|-------------|
| **Home** | Gradient hero, search bar, city / price / sort filters, restaurant card list, pull-to-refresh, add-restaurant modal |
| **Map** | Native map with paw-print markers, tap-to-callout, horizontal card strip at the bottom, city quick-jump buttons |
| **Community** | Tab-switched view: latest review feed and collapsible dining-with-pets guide cards |
| **Analytics** | Stat cards, bar & pie charts, rating distribution, facility coverage chart, top-5 leaderboard, market insight cards |
| **Restaurant Detail** | Dual ratings, pet policy, facility badges, review thread, write-a-review modal |

---

## Directory Structure

```
mobile/
├── App.js                         # Entry point — mounts navigation
├── app.json                       # Expo config (name, icons, permissions)
├── babel.config.js
└── src/
    ├── api/
    │   └── client.js              # Axios instance + all API helpers
    ├── navigation/
    │   └── index.js               # Bottom tab + native stack setup
    ├── components/
    │   ├── StarRating.js          # StarDisplay and interactive StarPicker
    │   ├── RestaurantCard.js      # Card with ratings, price, facility tags
    │   ├── AddRestaurantModal.js  # Full-form sheet with switches and option groups
    │   └── ReviewModal.js         # Write-a-review sheet with dual star pickers
    └── screens/
        ├── HomeScreen.js
        ├── MapScreen.js
        ├── CommunityScreen.js
        ├── AnalyticsScreen.js
        └── RestaurantDetailScreen.js
```

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| Expo 51 | App framework, simplifies native builds |
| React Native 0.74 | Cross-platform UI primitives |
| React Navigation v6 | Bottom tab + native stack navigation |
| react-native-maps | Native map component (Apple Maps / Google Maps) |
| react-native-chart-kit | Bar and pie charts |
| react-native-svg | SVG renderer required by chart-kit |
| expo-linear-gradient | Gradient backgrounds |
| @expo/vector-icons | Ionicons icon set |
| Axios | HTTP client |

---

## Building for Production

### EAS Build (recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Configure EAS for this project (run once)
eas build:configure

# Build for iOS (requires Apple Developer account)
eas build --platform ios

# Build for Android (.apk or .aab)
eas build --platform android
```

### Local Build

```bash
# iOS — requires macOS + Xcode 15+
npx expo run:ios --configuration Release

# Android — requires Android Studio
npx expo run:android --variant release
```

---

## Troubleshooting

**"Network request failed" on device**
The phone cannot reach the backend. Verify the backend is running, both devices share the same Wi-Fi, and `API_BASE` in `src/api/client.js` uses your machine's local IP — not `localhost`.

**Map screen is blank on Android**
Android uses Google Maps, which requires a Google Maps API Key. Add it to `app.json` under `plugins` and rebuild with `npx expo run:android`. iOS uses Apple Maps and works without a key.

**Works in simulator but fails on a real iOS device**
Same root cause as the first issue — switch `localhost` to your machine's LAN IP.
