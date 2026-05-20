# 🐾 Pet Dinner — Pet-Friendly Restaurant Dashboard

Find the perfect restaurant to dine with your furry companion. Pet Dinner is a full-stack application with a **Web app** and a **Mobile app (iOS / Android)**, both powered by the same backend API.

---

## Project Structure

```
Pet-dinner/
├── backend/          # Node.js + Express + SQLite REST API
├── frontend/         # React + Vite web app
├── mobile/           # React Native + Expo mobile app
└── package.json      # Root-level scripts
```

---

## Quick Start

### Step 1 — Start the backend (required first)

```bash
cd backend
npm install
node server.js
```

The API runs on `http://localhost:3001`. On first launch it creates a SQLite database and seeds it with 10 sample restaurants and 12 reviews across 6 Chinese cities.

### Step 2 — Start the web app

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Step 3 — Start the mobile app (optional)

```bash
cd mobile
npm install
npx expo start
```

Install **Expo Go** on your phone and scan the QR code shown in the terminal.

> **Real-device note:** change `localhost:3001` in `mobile/src/api/client.js` to your machine's local network IP (e.g. `192.168.1.100:3001`) so the phone can reach the backend.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Backend | Node.js · Express · SQLite (better-sqlite3) |
| Web frontend | React 18 · Vite · Tailwind CSS · Recharts · Leaflet |
| Mobile app | React Native · Expo 51 · React Navigation · react-native-maps · react-native-chart-kit |

---

## Features

- **Search & filter** — filter by city, cuisine, price range, pet size, and available facilities
- **Interactive map** — pin every restaurant on a map and tap for details
- **Dual-rating reviews** — separate scores for overall experience and pet-friendliness
- **Add a restaurant** — any user can submit a new listing
- **Community feed** — latest reviews stream and dining-with-pets guides
- **Analytics dashboard** — city distribution, cuisine breakdown, price-vs-rating charts, facility coverage, and data-driven market insights

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/restaurants` | List restaurants (filterable via query params) |
| GET | `/api/restaurants/:id` | Restaurant detail with reviews |
| POST | `/api/restaurants` | Create a new restaurant |
| POST | `/api/reviews` | Submit a review |
| GET | `/api/reviews/recent` | Latest reviews feed |
| GET | `/api/analytics/overview` | Aggregate statistics |
| GET | `/api/analytics/insights` | Data-driven market recommendations |

Full route source: [`backend/routes/`](./backend/routes/)

---

## Sub-project Docs

- [Web app README](./frontend/README.md)
- [Mobile app README](./mobile/README.md)
