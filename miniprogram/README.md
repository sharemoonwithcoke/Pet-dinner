# 📱 Pet Dinner — WeChat Mini Program (微信小程序)

The China-market client for Pet Dinner, built with the native WeChat Mini Program framework (WXML / WXSS / JS). Connects to the same shared backend API.

---

## Prerequisites

- [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) installed
- A WeChat developer account (free at [mp.weixin.qq.com](https://mp.weixin.qq.com))
- Backend running (see root README)

---

## Getting Started

### 1. Open in WeChat DevTools

1. Launch **WeChat DevTools**
2. Click **Import Project**
3. Set the project directory to `Pet-dinner/miniprogram/`
4. Enter your AppID from the WeChat console (or use the test ID for local dev)
5. Click **Confirm**

### 2. Allow non-HTTPS requests in development

Since the backend runs on HTTP locally, disable domain validation in DevTools:

> **Settings → Project Settings → uncheck "Verify valid domain names and HTTPS"**

This is development-only. Production requires HTTPS and registered domains.

### 3. Configure the backend URL

Edit `app.js` line 3:

```js
// Development (DevTools simulator)
const BASE_URL = 'http://localhost:3001';

// Real device preview — use your machine's LAN IP
const BASE_URL = 'http://192.168.1.100:3001';

// Production (must be HTTPS, registered in WeChat console)
const BASE_URL = 'https://your-domain.com';
```

### 4. Run

Click the **Compile** button (or press `Ctrl/Cmd + B`) in DevTools. The simulator appears on the right.

To preview on a real WeChat device, click **Preview** → scan the QR code.

---

## Pages

| Page | Path | Description |
|------|------|-------------|
| **Home** | `pages/index` | Restaurant list, keyword search, city/price/facility filters, add-restaurant button |
| **Map** | `pages/map` | Tencent Maps with restaurant markers, callout sheet, horizontal card strip, city quick-jump |
| **Community** | `pages/community` | Latest review feed + collapsible dining-with-pets guide cards |
| **Analytics** | `pages/analytics` | CSS-based bar/column charts, facility coverage, leaderboard, market insights |
| **Detail** | `pages/detail` | Full restaurant info, dual ratings, facility badges, review thread, write-a-review popup |
| **Add Restaurant** | `pages/add-restaurant` | Full submission form with switches and option groups |

---

## Directory Structure

```
miniprogram/
├── app.js                  # Global app + shared request() helper
├── app.json                # Pages, tabBar, window config
├── app.wxss                # Global styles (cards, tags, buttons, stars)
├── project.config.json     # WeChat DevTools project config
├── sitemap.json
└── pages/
    ├── index/              # Home — restaurant list & filters
    ├── map/                # Tencent Map with markers
    ├── community/          # Review feed + tips
    ├── analytics/          # Data dashboard
    ├── detail/             # Restaurant detail + reviews
    └── add-restaurant/     # Add new restaurant form
```

Each page contains four files: `.wxml` (markup), `.wxss` (styles), `.js` (logic), `.json` (page config).

---

## Key Concepts

| Web / React | Mini Program equivalent |
|-------------|------------------------|
| `<div>` | `<view>` |
| `<span>` / `<p>` | `<text>` |
| `<img>` | `<image>` |
| `useState` | `this.setData({})` |
| `useEffect` | `onLoad()` / `onShow()` |
| `onClick` | `bindtap` |
| `map()` in JSX | `wx:for="{{list}}"` |
| `axios.get()` | `wx.request()` (wrapped in `app.request()`) |
| React Router | `wx.navigateTo()` / `wx.switchTab()` |

---

## Publishing to WeChat

1. In DevTools, click **Upload** (上传)
2. Set version number and description
3. Go to [mp.weixin.qq.com](https://mp.weixin.qq.com) → **Version Management**
4. Submit for review → typically approved within 1–7 days
5. Release after approval

> **Domain requirement:** all API calls must use HTTPS and the domain must be added to the whitelist under **Settings → Development Settings → Server Domain**.

---

## Notes on the Map

The built-in `<map>` component uses **Tencent Maps** (腾讯地图) — no API key needed for basic usage. Coordinate system is **GCJ-02** (same as Amap/Google Maps China), which is what the sample data uses.

For production with high request volume, apply for a Tencent Maps API key at [lbs.qq.com](https://lbs.qq.com) to avoid rate limits.
