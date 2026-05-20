# 🌐 Pet Dinner — Web App

The browser-based interface for Pet Dinner, built with **React + Vite + Tailwind CSS**.

---

## Prerequisites

- Node.js 18+
- Backend running on `http://localhost:3001` (see root README)

---

## Development

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:5173`. Vite proxies all `/api` requests to `localhost:3001`, so no CORS configuration is needed during development.

---

## Production Build

```bash
npm run build       # outputs to dist/
npm run preview     # serve the build locally to verify
```

For production deployment, either serve the `dist/` folder via a static CDN/host (update the API base URL accordingly) or configure Nginx to reverse-proxy `/api` to the backend.

---

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Restaurant grid, search bar, multi-filter panel, add-restaurant button |
| `/map` | Map | Leaflet interactive map with paw-print markers; sidebar list |
| `/community` | Community | Live review feed and collapsible dining-with-pets guides |
| `/analytics` | Analytics | Charts dashboard with market insights and recommendations |
| `/restaurant/:id` | Detail | Full info, facility list, review thread, write-a-review modal |

---

## Directory Structure

```
frontend/
├── index.html
├── vite.config.js          # Dev proxy to backend
├── tailwind.config.js
└── src/
    ├── App.jsx             # Route definitions
    ├── index.css           # Tailwind base + custom utilities
    ├── main.jsx
    ├── components/
    │   ├── Navbar.jsx              # Responsive top nav
    │   ├── RestaurantCard.jsx      # Card with ratings and facility tags
    │   ├── SearchFilter.jsx        # Filter bar (city, cuisine, price, sort)
    │   ├── AddRestaurantModal.jsx  # Full form modal for new listings
    │   └── ReviewModal.jsx         # Write-a-review modal
    └── pages/
        ├── Home.jsx
        ├── MapPage.jsx
        ├── Community.jsx
        ├── Analytics.jsx
        └── RestaurantDetail.jsx
```

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| Leaflet + react-leaflet | Interactive map (OpenStreetMap — no API key needed) |
| Recharts | Bar, pie, and radar charts |
| Axios | HTTP client |
