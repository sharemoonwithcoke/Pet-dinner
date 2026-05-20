import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SearchFilter from '../components/SearchFilter';
import RestaurantCard from '../components/RestaurantCard';
import AddRestaurantModal from '../components/AddRestaurantModal';

const INITIAL_FILTERS = {
  search: '', city: '', cuisine: '', price_range: '',
  pet_size_limit: '', has_pet_menu: '', has_pet_bowls: '', has_pet_seats: '', sort: '',
};

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await axios.get('/api/restaurants', { params });
      setRestaurants(res.data);
    } catch {
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  useEffect(() => {
    axios.get('/api/analytics/overview').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const handleAddSuccess = () => {
    setShowAdd(false);
    fetchRestaurants();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">🐾</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          带上毛孩子，一起去觅食
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          发现最适合您和宠物的友好餐厅，让每一次用餐都成为美好回忆
        </p>

        {stats && (
          <div className="flex justify-center gap-8 mt-6">
            {[
              { value: stats.totalRestaurants, label: '家宠物友好餐厅', icon: '🏪' },
              { value: stats.totalCities, label: '个城市覆盖', icon: '🌆' },
              { value: stats.totalReviews, label: '条用户评价', icon: '💬' },
              { value: stats.avgPetRating, label: '平均宠物友好分', icon: '⭐' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-lg">{s.icon}</div>
                <div className="text-2xl font-bold text-orange-500">{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search and add */}
      <div className="mb-6 space-y-3">
        <SearchFilter filters={filters} onChange={setFilters} />
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {loading ? '搜索中...' : `找到 ${restaurants.length} 家餐厅`}
          </p>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <span>+</span> 添加餐厅
          </button>
        </div>
      </div>

      {/* Restaurant grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-48 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg">没有找到符合条件的餐厅</p>
          <p className="text-sm mt-2">试试调整筛选条件，或者成为第一个添加餐厅的用户！</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-4">添加餐厅</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
        </div>
      )}

      {showAdd && <AddRestaurantModal onClose={() => setShowAdd(false)} onSuccess={handleAddSuccess} />}
    </div>
  );
}
