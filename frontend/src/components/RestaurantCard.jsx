import React from 'react';
import { Link } from 'react-router-dom';

const priceLabel = { 1: '¥', 2: '¥¥', 3: '¥¥¥', 4: '¥¥¥¥' };
const areaLabel = { outdoor: '室外', indoor: '室内', both: '室内外' };

function StarRating({ value, max = 5, size = 'sm' }) {
  const stars = Math.round(value || 0);
  return (
    <span className={`flex gap-0.5 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < stars ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  );
}

export default function RestaurantCard({ restaurant }) {
  const {
    id, name, city, address, cuisine, price_range, pet_area,
    avg_rating, avg_pet_rating, review_count,
    has_pet_menu, has_pet_seats, has_pet_bowls, has_pet_toys, has_pet_parking,
    pet_size_limit,
  } = restaurant;

  const facilities = [
    has_pet_menu && { icon: '🍖', label: '宠物菜单' },
    has_pet_seats && { icon: '🪑', label: '宠物座椅' },
    has_pet_bowls && { icon: '🥣', label: '宠物水碗' },
    has_pet_toys && { icon: '🎾', label: '宠物玩具' },
    has_pet_parking && { icon: '🅿️', label: '宠物停车' },
  ].filter(Boolean);

  return (
    <Link to={`/restaurant/${id}`} className="card hover:shadow-md transition-shadow block">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 border-b border-orange-100">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{city} · {address}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-orange-500 font-bold text-lg">{priceLabel[price_range]}</div>
            <div className="text-xs text-gray-400">{cuisine}</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Ratings */}
        <div className="flex gap-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">综合评分</div>
            <div className="flex items-center gap-1">
              <StarRating value={avg_rating} />
              <span className="text-sm font-medium text-gray-700">{avg_rating || '暂无'}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">宠物友好</div>
            <div className="flex items-center gap-1">
              <StarRating value={avg_pet_rating} />
              <span className="text-sm font-medium text-gray-700">{avg_pet_rating || '暂无'}</span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-gray-400">评价数</div>
            <div className="text-sm font-medium text-gray-700">{review_count || 0}</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="badge bg-blue-50 text-blue-700">
            📍 {areaLabel[pet_area] || pet_area}区域
          </span>
          {pet_size_limit !== 'all' && (
            <span className="badge bg-purple-50 text-purple-700">
              🐕 {pet_size_limit === 'small' ? '仅限小型犬' : pet_size_limit}
            </span>
          )}
          {pet_size_limit === 'all' && (
            <span className="badge bg-green-50 text-green-700">🐾 欢迎所有宠物</span>
          )}
        </div>

        {/* Facilities */}
        {facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {facilities.slice(0, 4).map(f => (
              <span key={f.label} className="badge bg-orange-50 text-orange-600">
                {f.icon} {f.label}
              </span>
            ))}
            {facilities.length > 4 && (
              <span className="badge bg-gray-50 text-gray-500">+{facilities.length - 4}项</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
