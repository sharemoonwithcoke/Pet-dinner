# 🐾 Pet Dinner — Complete Technical Reference

A full-stack pet-friendly restaurant discovery platform with four client surfaces sharing one backend API:

| Surface | Technology | Target Market |
|---------|-----------|---------------|
| **Backend API** | Node.js + Express + SQLite | Shared |
| **Web App** | React 18 + Vite | Desktop / mobile browser |
| **Mobile App** | React Native + Expo 51 | iOS & Android |
| **Mini Program** | WeChat native WXML/JS | China (WeChat ecosystem) |

---

## Table of Contents

1. [Repository Layout](#1-repository-layout)
2. [Architecture Overview](#2-architecture-overview)
3. [Data Flow & Workflow](#3-data-flow--workflow)
4. [Database Schema](#4-database-schema)
5. [Backend API Reference](#5-backend-api-reference)
6. [Tech Stack & Exact Versions](#6-tech-stack--exact-versions)
7. [Setup & Installation](#7-setup--installation)
8. [Environment Configuration](#8-environment-configuration)
9. [Running in Development](#9-running-in-development)
10. [Building for Production](#10-building-for-production)
11. [Deployment Guide](#11-deployment-guide)
12. [Project-by-Project Deep Dive](#12-project-by-project-deep-dive)
13. [Troubleshooting](#13-troubleshooting)
14. [Roadmap & Future Integrations](#14-roadmap--future-integrations)

---

## 1. Repository Layout

```
Pet-dinner/
├── backend/                    # REST API server
│   ├── server.js               # Express app entry point
│   ├── database.js             # SQLite setup, schema, seed data
│   ├── package.json
│   └── routes/
│       ├── restaurants.js      # CRUD + search/filter
│       ├── reviews.js          # Review submission & feed
│       └── analytics.js        # Aggregated statistics & insights
│
├── frontend/                   # React web application
│   ├── index.html
│   ├── vite.config.js          # Dev server + API proxy
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── App.jsx             # Route definitions
│       ├── main.jsx            # React DOM entry
│       ├── index.css           # Tailwind + global utilities
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── RestaurantCard.jsx
│       │   ├── SearchFilter.jsx
│       │   ├── AddRestaurantModal.jsx
│       │   └── ReviewModal.jsx
│       └── pages/
│           ├── Home.jsx
│           ├── MapPage.jsx
│           ├── Community.jsx
│           ├── Analytics.jsx
│           └── RestaurantDetail.jsx
│
├── mobile/                     # React Native / Expo app
│   ├── App.js                  # Root component
│   ├── app.json                # Expo configuration
│   ├── babel.config.js
│   └── src/
│       ├── api/
│       │   └── client.js       # Axios wrappers for all API calls
│       ├── navigation/
│       │   └── index.js        # Tab + stack navigator setup
│       ├── components/
│       │   ├── StarRating.js
│       │   ├── RestaurantCard.js
│       │   ├── AddRestaurantModal.js
│       │   └── ReviewModal.js
│       └── screens/
│           ├── HomeScreen.js
│           ├── MapScreen.js
│           ├── CommunityScreen.js
│           ├── AnalyticsScreen.js
│           └── RestaurantDetailScreen.js
│
├── miniprogram/                # WeChat Mini Program
│   ├── app.js                  # Global app + shared request helper
│   ├── app.json                # Pages, tabBar, window config
│   ├── app.wxss                # Global styles
│   ├── project.config.json     # WeChat DevTools project settings
│   ├── sitemap.json
│   └── pages/
│       ├── index/              # Home list + filters
│       ├── map/                # Tencent Maps page
│       ├── community/          # Review feed + tips
│       ├── analytics/          # Data dashboard
│       ├── detail/             # Restaurant detail + reviews
│       └── add-restaurant/     # Add restaurant form
│
├── package.json                # Root-level convenience scripts
├── README.md                   # This file
└── .gitignore
```

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │  Web App     │  │  Mobile App  │  │  WeChat Mini      │ │
│  │  React+Vite  │  │  RN + Expo   │  │  Program          │ │
│  │  :5173       │  │  Expo Go /   │  │  WeChat DevTools  │ │
│  │              │  │  Simulator   │  │                   │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘ │
│         │ HTTP /api/*      │ HTTP /api/*        │ wx.request │
└─────────┼──────────────────┼────────────────────┼───────────┘
          │                  │                    │
          ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND  (Node.js + Express)                │
│                        localhost:3001                        │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ /api/       │  │ /api/       │  │ /api/               │ │
│  │ restaurants │  │ reviews     │  │ analytics           │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                     │            │
│         └────────────────┴─────────────────────┘            │
│                          │                                   │
│                          ▼                                   │
│              ┌───────────────────────┐                      │
│              │  SQLite  (WAL mode)   │                      │
│              │  petdinner.db         │                      │
│              │  • restaurants        │                      │
│              │  • reviews            │                      │
│              │  • tips               │                      │
│              └───────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

### Key design decisions

- **Single backend, multiple frontends.** All three clients read and write through the same Express REST API, so data added on one surface is immediately visible on all others.
- **SQLite over PostgreSQL.** Chosen for zero-dependency local development and easy single-file deployment. WAL mode (`PRAGMA journal_mode = WAL`) enables concurrent reads alongside writes.
- **No authentication layer (yet).** The current build is a proof-of-concept. Any user can add restaurants or write reviews without logging in.
- **Vite dev proxy.** During web development, Vite proxies all `/api/*` requests to `localhost:3001`, so the browser never makes cross-origin requests and no CORS configuration is needed client-side.
- **Mini program uses no npm packages.** The WeChat Mini Program is intentionally dependency-free to minimise bundle size and WeChat review friction.

---

## 3. Data Flow & Workflow

### 3.1 User views the restaurant list

```
User opens web/mobile/mini-program
  │
  ├─► Client sends: GET /api/restaurants?city=上海&sort=rating
  │
  ├─► Express router (routes/restaurants.js)
  │     builds dynamic SQL with WHERE clauses from query params
  │     LEFT JOINs reviews to compute avg_rating, avg_pet_rating, review_count
  │
  ├─► SQLite returns rows
  │
  └─► JSON array → client renders restaurant cards
```

### 3.2 User adds a restaurant

```
User fills in add-restaurant form
  │
  ├─► Client sends: POST /api/restaurants
  │     body: { name, city, address, cuisine, price_range,
  │             latitude, longitude, pet_area, pet_size_limit,
  │             has_pet_menu, has_pet_seats, has_pet_bowls,
  │             has_pet_toys, has_pet_parking, pet_policy }
  │
  ├─► Server validates required fields
  │     (name, city, address, cuisine, price_range, latitude, longitude)
  │
  ├─► INSERT INTO restaurants → returns lastInsertRowid
  │
  └─► 201 { id, message } → client refreshes list / navigates to detail
```

### 3.3 User submits a review

```
User fills in review modal (rating 1-5, pet_rating 1-5, content)
  │
  ├─► Client sends: POST /api/reviews
  │     body: { restaurant_id, author, rating, pet_rating, content,
  │             pet_name?, pet_type? }
  │
  ├─► Server validates required fields + checks restaurant exists
  │
  ├─► INSERT INTO reviews
  │
  ├─► 201 { id, message }
  │
  └─► Client reloads restaurant detail to show updated review thread
        (avg_rating recalculated on next GET /api/restaurants/:id)
```

### 3.4 Analytics dashboard loads

```
Client mounts Analytics page
  │
  ├─► 7 parallel API calls:
  │     GET /api/analytics/overview
  │     GET /api/analytics/by-city
  │     GET /api/analytics/by-cuisine
  │     GET /api/analytics/by-price
  │     GET /api/analytics/rating-distribution
  │     GET /api/analytics/top-restaurants
  │     GET /api/analytics/insights
  │
  ├─► Each runs an aggregated SQL query (GROUP BY, AVG, COUNT)
  │
  ├─► /insights computes dynamic text by:
  │     - Querying city with highest restaurant count
  │     - Querying city with lowest restaurant count
  │     - Finding facility with lowest coverage percentage
  │     - Computing gap between avg_rating and avg_pet_rating
  │
  └─► Client renders charts + insight cards
```

---

## 4. Database Schema

Database file: `backend/petdinner.db`  
Engine: SQLite 3, WAL journal mode, foreign keys ON

### 4.1 `restaurants`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | — |
| `name` | TEXT | NOT NULL | — |
| `city` | TEXT | NOT NULL | — |
| `address` | TEXT | NOT NULL | — |
| `phone` | TEXT | nullable | — |
| `website` | TEXT | nullable | — |
| `cuisine` | TEXT | NOT NULL | — |
| `price_range` | INTEGER | NOT NULL, CHECK (1–4) | — |
| `latitude` | REAL | NOT NULL | — |
| `longitude` | REAL | NOT NULL | — |
| `pet_allowed` | INTEGER | NOT NULL | `1` |
| `pet_area` | TEXT | — | `'outdoor'` |
| `pet_size_limit` | TEXT | — | `'all'` |
| `has_pet_menu` | INTEGER | — | `0` |
| `has_pet_seats` | INTEGER | — | `0` |
| `has_pet_bowls` | INTEGER | — | `0` |
| `has_pet_toys` | INTEGER | — | `0` |
| `has_pet_parking` | INTEGER | — | `0` |
| `pet_policy` | TEXT | nullable | — |
| `image_url` | TEXT | nullable | — |
| `created_at` | TEXT | — | `datetime('now')` |
| `updated_at` | TEXT | — | `datetime('now')` |

**Notes:**
- `price_range`: `1` = ¥ (budget), `2` = ¥¥, `3` = ¥¥¥, `4` = ¥¥¥¥ (premium)
- `pet_area`: one of `'outdoor'`, `'indoor'`, `'both'`
- `pet_size_limit`: `'all'` or `'small'`
- Boolean columns (`has_pet_*`, `pet_allowed`) stored as INTEGER `0`/`1`
- `latitude`/`longitude`: WGS-84 for web/mobile (Leaflet); Tencent Maps uses GCJ-02 — current seed data uses real coordinates that work for display in both systems

### 4.2 `reviews`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | — |
| `restaurant_id` | INTEGER | NOT NULL, FK → restaurants(id) ON DELETE CASCADE | — |
| `author` | TEXT | NOT NULL | — |
| `rating` | INTEGER | NOT NULL, CHECK (1–5) | — |
| `pet_rating` | INTEGER | NOT NULL, CHECK (1–5) | — |
| `content` | TEXT | NOT NULL | — |
| `pet_name` | TEXT | nullable | — |
| `pet_type` | TEXT | nullable | — |
| `photo_url` | TEXT | nullable | — |
| `created_at` | TEXT | — | `datetime('now')` |

**Notes:**
- Deleting a restaurant cascades to delete all its reviews
- `rating` = overall food/service experience; `pet_rating` = pet-friendliness specifically

### 4.3 `tips`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `title` | TEXT | NOT NULL |
| `content` | TEXT | NOT NULL |
| `category` | TEXT | NOT NULL |
| `created_at` | TEXT | DEFAULT datetime('now') |

**Seed categories:** `礼仪`, `选择指南`, `安全须知`, `准备清单`, `行为训练`

### 4.4 Seed data

On first launch, if `restaurants` is empty, `database.js` inserts:

- **10 restaurants** across 6 cities: 上海 (2), 北京 (2), 成都 (2), 广州 (1), 深圳 (1), 杭州 (2)
- **12 reviews** spread across the 10 restaurants (avg 1.2 reviews/restaurant)
- **5 tips** covering etiquette, selection guide, safety, packing checklist, training

---

## 5. Backend API Reference

Base URL (development): `http://localhost:3001`  
All request and response bodies are `application/json`.

### 5.1 Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Returns `{ "status": "ok" }` |

---

### 5.2 Restaurants

#### `GET /api/restaurants`

Returns a list of restaurants, optionally filtered and sorted. Each record is augmented with computed `avg_rating`, `avg_pet_rating`, and `review_count` from a LEFT JOIN on the `reviews` table.

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Fuzzy match on `name`, `address`, `cuisine` (SQL LIKE `%value%`) |
| `city` | string | Exact match on `city` |
| `cuisine` | string | Exact match on `cuisine` |
| `price_range` | integer (1–4) | Exact match |
| `pet_area` | string | Matches `pet_area = value OR pet_area = 'both'` |
| `pet_size_limit` | string | `'small'` or `'all'`; if `'small'`, matches `small` or `all` rows |
| `has_pet_menu` | `'1'` | Filter to rows where `has_pet_menu = 1` |
| `has_pet_seats` | `'1'` | Filter to rows where `has_pet_seats = 1` |
| `has_pet_bowls` | `'1'` | Filter to rows where `has_pet_bowls = 1` |
| `sort` | string | `'rating'`, `'pet_rating'`, `'price_asc'`, `'price_desc'`; default: `review_count DESC, avg_rating DESC` |

**Response:** `200 OK` — array of restaurant objects with extra computed fields:
```json
[
  {
    "id": 1,
    "name": "汪星人花园餐厅",
    "city": "上海",
    "address": "上海市静安区南京西路1号",
    "phone": "021-12345678",
    "website": "www.wangxing.com",
    "cuisine": "中式料理",
    "price_range": 2,
    "latitude": 31.2304,
    "longitude": 121.4737,
    "pet_allowed": 1,
    "pet_area": "outdoor",
    "pet_size_limit": "small",
    "has_pet_menu": 1,
    "has_pet_seats": 1,
    "has_pet_bowls": 1,
    "has_pet_toys": 1,
    "has_pet_parking": 0,
    "pet_policy": "欢迎小型犬入内...",
    "image_url": null,
    "created_at": "2024-01-01 00:00:00",
    "updated_at": "2024-01-01 00:00:00",
    "avg_rating": 4.5,
    "avg_pet_rating": 4.5,
    "review_count": 2
  }
]
```

---

#### `GET /api/restaurants/:id`

Returns a single restaurant with its full review thread.

**Response:** `200 OK`
```json
{
  "id": 1,
  "...": "all restaurant fields + avg_rating, avg_pet_rating, review_count",
  "reviews": [
    {
      "id": 1,
      "restaurant_id": 1,
      "author": "李小明",
      "rating": 5,
      "pet_rating": 5,
      "content": "环境非常好...",
      "pet_name": "豆豆",
      "pet_type": "柴犬",
      "photo_url": null,
      "created_at": "2024-01-01 00:00:00"
    }
  ]
}
```

**Error:** `404 { "error": "Restaurant not found" }`

---

#### `POST /api/restaurants`

Creates a new restaurant listing.

**Required body fields:** `name`, `city`, `address`, `cuisine`, `price_range`, `latitude`, `longitude`

**Optional body fields:** `phone`, `website`, `pet_area`, `pet_size_limit`, `has_pet_menu`, `has_pet_seats`, `has_pet_bowls`, `has_pet_toys`, `has_pet_parking`, `pet_policy`

**Response:** `201 Created`
```json
{ "id": 11, "message": "餐厅添加成功" }
```

**Error:** `400 { "error": "缺少必填字段" }`

---

#### `PUT /api/restaurants/:id`

Fully replaces a restaurant's fields. Accepts same body as POST.

**Response:** `200 { "message": "更新成功" }`  
**Error:** `404 { "error": "Restaurant not found" }`

---

#### `DELETE /api/restaurants/:id`

Deletes a restaurant and (via CASCADE) all its reviews.

**Response:** `200 { "message": "删除成功" }`  
**Error:** `404 { "error": "Restaurant not found" }`

---

#### `GET /api/restaurants/meta/cities`

**Response:** `["上海", "北京", "成都", "广州", "深圳", "杭州"]`

#### `GET /api/restaurants/meta/cuisines`

**Response:** `["中式料理", "西式简餐", ...]`

---

### 5.3 Reviews

#### `GET /api/reviews/restaurant/:restaurantId`

Returns all reviews for a single restaurant, ordered by `created_at DESC`.

**Response:** `200 OK` — array of review objects

---

#### `POST /api/reviews`

**Required body fields:** `restaurant_id`, `author`, `rating` (1–5), `pet_rating` (1–5), `content`  
**Optional:** `pet_name`, `pet_type`

**Response:** `201 { "id": 13, "message": "评价提交成功" }`  
**Errors:** `400` missing fields, `404` restaurant not found

---

#### `GET /api/reviews/recent`

Returns a cross-restaurant feed of the most recent reviews, joined with restaurant name, city, and cuisine.

**Query parameter:** `limit` (optional integer, default `20`, max `50`)

**Response:**
```json
[
  {
    "id": 12,
    "restaurant_id": 10,
    "author": "林晨",
    "rating": 5,
    "pet_rating": 5,
    "content": "...",
    "pet_name": "薯条",
    "pet_type": "泰迪",
    "created_at": "...",
    "restaurant_name": "汉堡狗狗乐",
    "city": "杭州",
    "cuisine": "美式快餐"
  }
]
```

---

### 5.4 Analytics

All analytics routes are `GET` and return pre-aggregated data. No query parameters unless noted.

#### `GET /api/analytics/overview`

```json
{
  "totalRestaurants": 10,
  "totalReviews": 12,
  "avgRating": 4.42,
  "avgPetRating": 4.67,
  "totalCities": 6,
  "facilityCoverage": {
    "menu_pct": 50,
    "seats_pct": 100,
    "bowls_pct": 100,
    "toys_pct": 50,
    "parking_pct": 30
  }
}
```

#### `GET /api/analytics/by-city`

```json
[
  { "city": "上海", "restaurant_count": 2, "avg_rating": 4.5, "total_reviews": 4 }
]
```

#### `GET /api/analytics/by-cuisine`

```json
[{ "cuisine": "中式料理", "count": 2, "avg_rating": 4.5 }]
```

#### `GET /api/analytics/by-price`

```json
[{ "price_range": 1, "count": 2, "avg_rating": 4.5, "avg_pet_rating": 4.8 }]
```

#### `GET /api/analytics/by-pet-area`

```json
[{ "pet_area": "outdoor", "count": 6 }, { "pet_area": "both", "count": 4 }]
```

#### `GET /api/analytics/rating-distribution`

```json
[{ "rating": 5, "count": 8 }, { "rating": 4, "count": 3 }, ...]
```

#### `GET /api/analytics/top-restaurants`

Top 5 restaurants by `avg_rating DESC, avg_pet_rating DESC` with at least 1 review.

```json
[{ "id": 7, "name": "...", "city": "...", "cuisine": "...", "price_range": 2, "avg_rating": 5.0, "avg_pet_rating": 5.0, "review_count": 1 }]
```

#### `GET /api/analytics/facilities`

```json
[
  { "facility": "pet_menu",    "count": 5 },
  { "facility": "pet_seats",   "count": 10 },
  { "facility": "pet_bowls",   "count": 10 },
  { "facility": "pet_toys",    "count": 5 },
  { "facility": "pet_parking", "count": 3 }
]
```

#### `GET /api/analytics/tips`

Returns all rows from the `tips` table ordered by `created_at DESC`.

#### `GET /api/analytics/insights`

Returns 4 dynamically generated insight objects:

```json
[
  { "type": "market",   "icon": "📍", "title": "市场集中度", "content": "..." },
  { "type": "facility", "icon": "🏪", "title": "设施缺口",   "content": "..." },
  { "type": "rating",   "icon": "⭐", "title": "评分洞察",   "content": "..." },
  { "type": "trend",    "icon": "📈", "title": "发展建议",   "content": "..." }
]
```

The content strings are computed at request time from live aggregation queries.

---

## 6. Tech Stack & Exact Versions

### Backend

| Package | Version | Role |
|---------|---------|------|
| Node.js | 22.x | Runtime |
| express | ^4.18.3 | HTTP framework |
| better-sqlite3 | ^9.4.3 | Synchronous SQLite driver |
| cors | ^2.8.5 | Cross-origin headers |
| multer | ^1.4.5-lts.1 | Multipart form parsing (reserved for future image upload) |
| nodemon | ^3.1.0 (dev) | Auto-restart during development |

### Web Frontend

| Package | Version | Role |
|---------|---------|------|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | DOM renderer |
| react-router-dom | ^6.23.1 | Client-side routing |
| vite | ^5.2.13 | Build tool + dev server (port 5173) |
| @vitejs/plugin-react | ^4.3.0 | JSX transform + Fast Refresh |
| tailwindcss | ^3.4.4 | Utility-first CSS |
| postcss | ^8.4.38 | CSS processing |
| autoprefixer | ^10.4.19 | Vendor prefix injection |
| leaflet | ^1.9.4 | Interactive map (OpenStreetMap) |
| react-leaflet | ^4.2.1 | React bindings for Leaflet |
| recharts | ^2.12.4 | SVG chart components |
| axios | ^1.6.8 | HTTP client |

### Mobile App

| Package | Version | Role |
|---------|---------|------|
| expo | ~51.0.8 | App framework |
| react-native | 0.74.1 | Cross-platform UI |
| react | 18.2.0 | UI library |
| @react-navigation/native | ^6.1.18 | Navigation core |
| @react-navigation/native-stack | ^6.11.0 | Stack navigator |
| @react-navigation/bottom-tabs | ^6.6.1 | Bottom tab navigator |
| react-native-maps | 1.14.0 | Native map component |
| react-native-safe-area-context | 4.10.1 | Safe area insets |
| react-native-screens | 3.31.1 | Native screen optimization |
| react-native-svg | 15.2.0 | SVG renderer for charts |
| react-native-chart-kit | ^6.12.0 | Bar + pie charts |
| expo-linear-gradient | ~13.0.2 | Gradient backgrounds |
| @expo/vector-icons | ^14.0.2 | Ionicons icon set |
| expo-status-bar | ~1.12.1 | Status bar control |
| axios | ^1.6.8 | HTTP client |
| @babel/core | ^7.24.0 (dev) | JS transpilation |

### WeChat Mini Program

No external npm packages. Uses WeChat's built-in APIs:

| Built-in API | Role |
|-------------|------|
| `wx.request()` | HTTP client (wrapped in `app.request()`) |
| `<map>` component | Tencent Maps (GCJ-02 coordinates) |
| `wx.navigateTo()` / `wx.switchTab()` | Navigation |
| `wx.showToast()` / `wx.showModal()` | User feedback |
| `wx.stopPullDownRefresh()` | Pull-to-refresh control |
| `wx.setNavigationBarTitle()` | Dynamic page title |

---

## 7. Setup & Installation

### Prerequisites

| Tool | Minimum version | How to install |
|------|----------------|----------------|
| Node.js | 18.x | [nodejs.org](https://nodejs.org) |
| npm | 9.x | Bundled with Node |
| WeChat DevTools | Latest | [developers.weixin.qq.com](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) |
| Expo Go (optional) | Latest | App Store / Play Store |

### Clone the repository

```bash
git clone https://github.com/sharemoonwithcoke/Pet-dinner.git
cd Pet-dinner
```

### Install all dependencies

```bash
# Backend
cd backend && npm install && cd ..

# Web frontend
cd frontend && npm install && cd ..

# Mobile app
cd mobile && npm install && cd ..

# Mini Program: no npm install needed
```

---

## 8. Environment Configuration

### Backend

No `.env` file is required for development. The only configurable value is:

```js
// backend/server.js — line 6
const PORT = process.env.PORT || 3001;
```

Set `PORT` as an environment variable to change the port:

```bash
PORT=4000 node server.js
```

### Web Frontend

No `.env` needed for development. Vite's proxy (`vite.config.js`) automatically forwards all `/api/*` requests to `http://localhost:3001`.

For production, set the API base URL before building:

```bash
# frontend/.env.production
VITE_API_BASE=https://api.your-domain.com
```

Then update `frontend/src/` API calls to use `import.meta.env.VITE_API_BASE`.

### Mobile App

Edit `mobile/src/api/client.js` — the `API_BASE` constant:

| Scenario | Value |
|----------|-------|
| iOS Simulator | `http://localhost:3001` |
| Android Emulator | `http://10.0.2.2:3001` |
| Real device (same Wi-Fi) | `http://192.168.x.x:3001` (your machine's LAN IP) |
| Production | `https://api.your-domain.com` |

The current code uses `__DEV__` to switch between dev and prod:

```js
export const API_BASE = __DEV__
  ? 'http://localhost:3001'
  : 'https://your-production-api.com';
```

### WeChat Mini Program

Edit `miniprogram/app.js` — line 3:

```js
const BASE_URL = 'http://localhost:3001'; // dev
// const BASE_URL = 'https://api.your-domain.com'; // prod
```

For development in DevTools, disable HTTPS domain validation:
> **Settings → Project Settings → uncheck "Verify valid domain names and HTTPS"**

For production, the domain must be registered in the WeChat console under:
> **Settings → Development Settings → Server Domain → request合法域名**

---

## 9. Running in Development

### Start order (backend must be first)

**Terminal 1 — Backend**
```bash
cd backend
npm install        # first time only
node server.js     # or: npx nodemon server.js for auto-reload
```
Expected output:
```
Pet Dinner API running on http://localhost:3001
```
On first run, SQLite creates `backend/petdinner.db` and seeds 10 restaurants, 12 reviews, and 5 tips automatically.

**Terminal 2 — Web App**
```bash
cd frontend
npm install        # first time only
npm run dev
```
Open `http://localhost:5173`

**Terminal 3 — Mobile App (optional)**
```bash
cd mobile
npm install        # first time only
npx expo start
```
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go on a real device

**WeChat Mini Program (separate tool)**
1. Open WeChat DevTools
2. Import Project → select `Pet-dinner/miniprogram/`
3. Enter your AppID (or use test AppID)
4. Disable HTTPS validation in Settings
5. Click Compile (`Ctrl/Cmd + B`)

### Verify the backend is working

```bash
curl http://localhost:3001/api/health
# → {"status":"ok"}

curl http://localhost:3001/api/restaurants | python3 -m json.tool | head -20
# → array of 10 restaurants

curl http://localhost:3001/api/analytics/overview
# → {"totalRestaurants":10,"totalReviews":12,...}
```

---

## 10. Building for Production

### Backend

No build step. Deploy `server.js`, `database.js`, and `routes/` directly with Node.js. Use a process manager in production:

```bash
npm install -g pm2
pm2 start backend/server.js --name pet-dinner-api
pm2 save
pm2 startup
```

### Web Frontend

```bash
cd frontend
npm run build
```

Output in `frontend/dist/`. Serve as a static site (Nginx, Vercel, Netlify, etc.).

Preview the production build locally:
```bash
npm run preview   # serves on http://localhost:4173
```

### Mobile App — EAS Build (recommended)

```bash
npm install -g eas-cli
eas login
eas build:configure         # run once per project
eas build --platform ios    # requires Apple Developer account ($99/yr)
eas build --platform android
```

### Mobile App — Local Build

```bash
# iOS (requires macOS + Xcode 15+)
npx expo run:ios --configuration Release

# Android (requires Android Studio + JDK 17)
npx expo run:android --variant release
```

### WeChat Mini Program

1. WeChat DevTools → **Upload** (上传)
2. Set version number
3. Go to [mp.weixin.qq.com](https://mp.weixin.qq.com) → **Version Management** → submit for review
4. Approval typically takes 1–7 business days

---

## 11. Deployment Guide

### Recommended stack for a single-server deployment

```
Internet
    │
    ▼
Nginx (reverse proxy + static file server)
    ├── / → serve frontend/dist/ (static files)
    └── /api/ → proxy to localhost:3001 (Node.js)

Node.js (backend, port 3001, managed by PM2)
    └── SQLite file at /var/data/petdinner.db
```

**Sample Nginx config:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve React build
    root /var/www/pet-dinner/frontend/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API to Node
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Add SSL with Let's Encrypt:
```bash
certbot --nginx -d your-domain.com
```

### Cloud deployment options

| Platform | Backend | Frontend | Notes |
|----------|---------|----------|-------|
| Railway | ✅ Node.js | ✅ Static | Free tier, SQLite file persists on disk |
| Render | ✅ Web Service | ✅ Static Site | Free tier available |
| Fly.io | ✅ Docker | ✅ | Persistent volumes for SQLite |
| Vercel | ❌ (serverless only) | ✅ | Backend needs separate host |
| Netlify | ❌ | ✅ | Backend needs separate host |

> **SQLite in production:** SQLite works well for single-server deployments with moderate traffic. For multi-instance deployments, migrate to PostgreSQL and update `database.js` to use the `pg` driver.

---

## 12. Project-by-Project Deep Dive

### 12.1 Backend

**Entry point:** `backend/server.js`

The server applies three global middleware layers in order:
1. `cors()` — allows all origins (tighten in production with `cors({ origin: 'https://your-domain.com' })`)
2. `express.json()` — parses `application/json` request bodies
3. `express.urlencoded({ extended: true })` — parses form-encoded bodies

Routes are modular: each file in `routes/` is a separate Express Router mounted at a prefix.

**Database connection:** `database.js` opens the SQLite file synchronously at module load time using `better-sqlite3`. The connection is a singleton — all routes import the same `db` object. `better-sqlite3` is synchronous by design, which pairs cleanly with Express's synchronous middleware model.

**Dynamic SQL construction** in `GET /api/restaurants`: rather than using an ORM, the route builds a parameterised SQL string by appending `WHERE` clauses conditionally, passing values via a `params` array to prevent SQL injection.

---

### 12.2 Web Frontend

**Routing:** React Router v6 `<Routes>` with five `<Route>` definitions in `App.jsx`. The Navbar is rendered outside the Routes so it appears on every page.

**API calls:** All pages use Axios directly (no shared client instance). The Vite proxy removes the need for a base URL — every call uses a relative path like `/api/restaurants`.

**Map:** Leaflet's default icon path resolution breaks when bundled with Vite. The fix in `MapPage.jsx` deletes `_getIconUrl` from the prototype and manually sets icon URLs pointing to the Leaflet CDN:
```js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/...' });
```

**Charts:** Recharts renders all charts as SVG. The Analytics page fires 7 parallel `axios.get()` calls inside a `Promise.all`, then processes the results before calling `setData`.

---

### 12.3 Mobile App

**Navigation structure:**

```
NavigationContainer
└── Stack.Navigator (headerShown: false at root)
    ├── Screen "Tabs" → HomeTabs (BottomTabNavigator)
    │     ├── Tab "首页"  → HomeScreen
    │     ├── Tab "地图"  → MapScreen
    │     ├── Tab "社区"  → CommunityScreen
    │     └── Tab "分析"  → AnalyticsScreen
    └── Screen "RestaurantDetail" → RestaurantDetailScreen
              (headerShown: true, title: "餐厅详情")
```

**API layer:** `mobile/src/api/client.js` exports three named objects (`restaurantAPI`, `reviewAPI`, `analyticsAPI`), each with methods that return Axios promises. Screens import and call these directly — no React Query or Redux.

**Map:** `react-native-maps` renders Apple Maps on iOS (no API key) and Google Maps on Android (requires a Google Maps API key added to `app.json` plugins for production builds). In the DevTools/simulator, default markers are used.

**Charts:** `react-native-chart-kit` uses `react-native-svg` under the hood. The `BarChart` and `PieChart` components receive pre-processed data arrays computed in the screen's `loadAll()` async function.

---

### 12.4 WeChat Mini Program

**Global state:** `app.js` exposes a `request(path, options)` helper that wraps `wx.request()` in a Promise. Every page calls `getApp()` to access this helper:
```js
const app = getApp();
app.request('/api/restaurants').then(data => this.setData({ restaurants: data }));
```

**Page lifecycle used across all pages:**
- `onLoad(options)` — called once; receives URL params (e.g., `id` for the detail page)
- `onPullDownRefresh()` — triggered when user pulls down; always calls `wx.stopPullDownRefresh()` in `.finally()`
- `onShow()` — not used currently; useful for refreshing data when navigating back

**Map component:** The built-in `<map>` component uses Tencent Maps. Markers are configured as objects with `id`, `latitude`, `longitude`, `title`, and an optional `callout` object. The `bindmarkertap` event returns the marker's `id` in `e.markerId`.

**Charts:** The Analytics page uses no external charting library. All charts are rendered with pure WXSS:
- Horizontal bar charts: `<view>` with `style="width:{{item.pct}}%"` computed from data
- Vertical column charts: `<view>` with `style="height:{{item.pct}}%"` inside a fixed-height container
- No `<canvas>` API is used

**Popup/modal pattern:** Since WeChat has no native modal component, the review form and callout card use a fixed-position overlay:
```xml
<view class="overlay" wx:if="{{showForm}}" bindtap="close">
  <view class="popup" catchtap="">  <!-- catchtap stops tap propagation -->
    ...
  </view>
</view>
```

---

## 13. Troubleshooting

### Backend won't start — port already in use

```bash
lsof -i :3001          # find the process
kill -9 <PID>          # kill it
node backend/server.js
```

### SQLite database is corrupted

Delete `backend/petdinner.db` (and `petdinner.db-shm`, `petdinner.db-wal` if present) and restart the server. It will recreate the database with fresh seed data.

### Web app shows blank page after `npm run dev`

1. Confirm the backend is running on port 3001
2. Check browser console for network errors — the Vite proxy only works when the dev server is running; direct file-open (`file://`) won't work

### Mobile app: "Network request failed"

| Situation | Fix |
|-----------|-----|
| iOS Simulator | Use `http://localhost:3001` — should work by default |
| Android Emulator | Use `http://10.0.2.2:3001` instead of `localhost` |
| Real iOS/Android device | Use your machine's LAN IP: `http://192.168.x.x:3001` — both must be on the same Wi-Fi |
| Expo Go on phone | Same as real device above |

Find your LAN IP:
```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'

# Windows
ipconfig | findstr IPv4
```

### Mobile app: Map is blank (Android)

The `react-native-maps` Google Maps renderer requires a Google Maps API key for Android production builds. For local development via Expo Go, the map renders using a WebView fallback that doesn't need a key.

### WeChat Mini Program: "request:fail"

1. In DevTools → Settings → Project Settings → uncheck **Verify valid domain names and HTTPS**
2. Confirm `BASE_URL` in `miniprogram/app.js` is reachable from your machine
3. When using the real WeChat app preview (not DevTools), enable **Development Mode** on the scan screen

### WeChat Mini Program: Map not showing

The `<map>` component only renders in the WeChat environment (DevTools or real device). It will not work in a standard browser. Confirm you are testing in WeChat DevTools, not a browser.

### `npm install` fails in `mobile/` — peer dependency error

Force-install and ignore peer conflicts:
```bash
cd mobile && npm install --legacy-peer-deps
```

---

## 14. Roadmap & Future Integrations

### Yelp Fusion API (Seattle data import)

For the Seattle market, **Yelp Fusion API** is the recommended data source:
- Native `dogs_allowed` attribute filter — no keyword guessing
- Excellent Seattle/US coverage
- Free tier: 500 requests/day

Planned backend endpoint:
```
POST /api/import/yelp
body: { location: "Seattle, WA", radius: 10000 }
```

This will call Yelp's `GET /businesses/search?attributes=dogs_allowed&location=...`, transform the response to match the `restaurants` schema, and bulk-insert via SQLite transactions.

### Amap (高德地图) API (China data import)

For the China market:
- `GET https://restapi.amap.com/v3/place/text?keywords=宠物友好餐厅&types=050000`
- 300,000 free calls/day
- Coordinates are in GCJ-02 (same system as Tencent Maps used in the mini program)

### Authentication

Add JWT-based auth to enable:
- User profiles and review history
- Restaurant owner claiming
- Moderation of user-submitted listings

### Image uploads

`multer` is already installed in the backend. The `image_url` column and `photo_url` column exist in the schema. Wire up:
```
POST /api/restaurants/:id/image
POST /api/reviews/:id/photo
```

### Push notifications

Notify users when a new restaurant is added near them or when a restaurant they reviewed replies.

### PostgreSQL migration

When moving beyond a single-server deployment, replace `better-sqlite3` with `pg` (PostgreSQL driver). The SQL queries use standard syntax and require minimal changes.
