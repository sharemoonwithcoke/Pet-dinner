import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const pawIcon = new L.DivIcon({
  html: '<div style="font-size:28px;line-height:1;filter:drop-shadow(1px 1px 2px rgba(0,0,0,0.4))">🐾</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
});

const priceLabel = { 1: '¥', 2: '¥¥', 3: '¥¥¥', 4: '¥¥¥¥' };

export default function MapPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [city, setCity] = useState('');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    axios.get('/api/restaurants/meta/cities').then(r => setCities(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const params = city ? { city } : {};
    axios.get('/api/restaurants', { params }).then(r => setRestaurants(r.data)).catch(() => {});
  }, [city]);

  const center = [32.0, 114.0];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 font-bold">🗺️ 地图探索</span>
          <span className="text-sm text-gray-400">· {restaurants.length} 家餐厅</span>
        </div>
        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="">全部城市</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-80 border-r border-gray-100 bg-white overflow-y-auto">
          {restaurants.map(r => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className={`text-left p-4 border-b border-gray-50 hover:bg-orange-50 transition-colors ${
                selected?.id === r.id ? 'bg-orange-50 border-l-4 border-l-orange-400' : ''
              }`}
            >
              <div className="font-medium text-gray-900 text-sm">{r.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{r.city} · {r.cuisine} · {priceLabel[r.price_range]}</div>
              {r.avg_rating && (
                <div className="text-xs text-yellow-500 mt-1">
                  {'★'.repeat(Math.round(r.avg_rating))}{'☆'.repeat(5 - Math.round(r.avg_rating))}
                  <span className="text-gray-400 ml-1">{r.avg_rating}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="flex-1">
          <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {restaurants.map(r => (
              <Marker
                key={r.id}
                position={[r.latitude, r.longitude]}
                icon={pawIcon}
                eventHandlers={{ click: () => setSelected(r) }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="font-bold text-gray-900 mb-1">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.address}</div>
                    <div className="text-xs text-gray-500 mt-1">{r.cuisine} · {priceLabel[r.price_range]}</div>
                    {r.avg_rating && (
                      <div className="text-xs text-yellow-500 mt-1">
                        综合 {r.avg_rating}⭐ | 宠物友好 {r.avg_pet_rating}⭐
                      </div>
                    )}
                    <Link
                      to={`/restaurant/${r.id}`}
                      className="block mt-2 text-xs text-orange-500 hover:text-orange-600 font-medium"
                    >
                      查看详情 →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
