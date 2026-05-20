import React, { useState, useEffect } from 'react';
import axios from 'axios';

const prices = [
  { value: '', label: '全部价位' },
  { value: '1', label: '¥ 经济' },
  { value: '2', label: '¥¥ 适中' },
  { value: '3', label: '¥¥¥ 较贵' },
  { value: '4', label: '¥¥¥¥ 高档' },
];

const petSizes = [
  { value: '', label: '全部体型' },
  { value: 'small', label: '小型宠物' },
  { value: 'all', label: '所有体型' },
];

const sortOptions = [
  { value: '', label: '综合排序' },
  { value: 'rating', label: '评分最高' },
  { value: 'pet_rating', label: '宠物友好' },
  { value: 'price_asc', label: '价格从低' },
  { value: 'price_desc', label: '价格从高' },
];

export default function SearchFilter({ filters, onChange }) {
  const [cities, setCities] = useState([]);
  const [cuisines, setCuisines] = useState([]);

  useEffect(() => {
    axios.get('/api/restaurants/meta/cities').then(r => setCities(r.data)).catch(() => {});
    axios.get('/api/restaurants/meta/cuisines').then(r => setCuisines(r.data)).catch(() => {});
  }, []);

  const update = (key, value) => onChange({ ...filters, [key]: value });
  const toggle = (key) => onChange({ ...filters, [key]: filters[key] ? '' : '1' });
  const reset = () => onChange({ search: '', city: '', cuisine: '', price_range: '', pet_size_limit: '', has_pet_menu: '', has_pet_bowls: '', sort: '' });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="搜索餐厅名称、地址、菜系..."
          value={filters.search || ''}
          onChange={e => update('search', e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <select
          value={filters.city || ''}
          onChange={e => update('city', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="">全部城市</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filters.cuisine || ''}
          onChange={e => update('cuisine', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="">全部菜系</option>
          {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filters.price_range || ''}
          onChange={e => update('price_range', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          {prices.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        <select
          value={filters.pet_size_limit || ''}
          onChange={e => update('pet_size_limit', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          {petSizes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        <select
          value={filters.sort || ''}
          onChange={e => update('sort', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          {sortOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Facility toggles */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">设施筛选：</span>
        {[
          { key: 'has_pet_menu', label: '🍖 宠物菜单' },
          { key: 'has_pet_bowls', label: '🥣 宠物水碗' },
          { key: 'has_pet_seats', label: '🪑 宠物座椅' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => toggle(f.key)}
            className={`badge cursor-pointer transition-colors ${
              filters[f.key] ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button onClick={reset} className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline">
          重置筛选
        </button>
      </div>
    </div>
  );
}
