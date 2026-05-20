import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Stars({ value }) {
  return (
    <span className="flex">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-sm ${i <= Math.round(value || 0) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </span>
  );
}

export default function Community() {
  const [reviews, setReviews] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');

  useEffect(() => {
    Promise.all([
      axios.get('/api/reviews/recent?limit=30'),
      axios.get('/api/analytics/tips'),
    ]).then(([r1, r2]) => {
      setReviews(r1.data);
      setTips(r2.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const tabs = [
    { key: 'reviews', label: '最新动态', icon: '💬', count: reviews.length },
    { key: 'tips', label: '外出指南', icon: '📖', count: tips.length },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🐾 宠物主人社区</h1>
        <p className="text-gray-500">分享您和毛孩子的用餐故事，发现更多宠物友好好去处</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon} {t.label}
            <span className="bg-orange-100 text-orange-600 text-xs px-1.5 rounded-full">{t.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card h-32 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : activeTab === 'reviews' ? (
        <div className="space-y-4">
          {reviews.map(rv => (
            <div key={rv.id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center text-xl font-bold text-orange-700 shrink-0">
                  {rv.author[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <span className="font-semibold text-gray-900">{rv.author}</span>
                      {rv.pet_name && (
                        <span className="ml-2 text-sm text-gray-400">和 🐾 {rv.pet_name}({rv.pet_type})</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex gap-1 items-center justify-end">
                        <Stars value={rv.rating} />
                        <span className="text-xs text-gray-400">综合{rv.rating}分</span>
                      </div>
                      <div className="text-xs text-gray-400">宠物友好 {rv.pet_rating}⭐</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700 leading-relaxed">{rv.content}</div>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      to={`/restaurant/${rv.restaurant_id}`}
                      className="text-xs text-orange-500 hover:text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-md"
                    >
                      🍽️ {rv.restaurant_name}
                    </Link>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{rv.city}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">
                      {new Date(rv.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">💬</div>
              <p>还没有社区评价，去写第一条吧！</p>
              <Link to="/" className="btn-primary mt-4 inline-block">浏览餐厅</Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {tips.map(tip => (
            <div key={tip.id} className="card p-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">
                  {tip.category === '礼仪' ? '🎩' : tip.category === '选择指南' ? '🔍' : tip.category === '安全须知' ? '⚠️' : tip.category === '准备清单' ? '📋' : '🐾'}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-900">{tip.title}</h3>
                    <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{tip.category}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{tip.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
