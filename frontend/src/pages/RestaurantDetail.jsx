import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReviewModal from '../components/ReviewModal';

const priceLabel = { 1: '¥', 2: '¥¥', 3: '¥¥¥', 4: '¥¥¥¥' };
const areaLabel = { outdoor: '仅室外', indoor: '仅室内', both: '室内外均可' };

function Stars({ value }) {
  return (
    <span className="flex">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(value || 0) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  );
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  const load = () => {
    setLoading(true);
    axios.get(`/api/restaurants/${id}`)
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-400">
      <div className="text-4xl mb-4 animate-bounce">🐾</div>
      <p>加载中...</p>
    </div>
  );

  if (!data) return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-400">
      <p>餐厅不存在</p>
      <Link to="/" className="btn-primary mt-4 inline-block">返回首页</Link>
    </div>
  );

  const facilities = [
    data.has_pet_menu && { icon: '🍖', label: '宠物菜单', desc: '提供专为宠物设计的菜品' },
    data.has_pet_seats && { icon: '🪑', label: '宠物座椅', desc: '配备宠物专用椅' },
    data.has_pet_bowls && { icon: '🥣', label: '宠物水碗', desc: '免费提供宠物水碗' },
    data.has_pet_toys && { icon: '🎾', label: '宠物玩具', desc: '提供宠物玩具娱乐' },
    data.has_pet_parking && { icon: '🅿️', label: '宠物停车', desc: '宠物友好停车区' },
  ].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-orange-500 flex items-center gap-1 mb-6">
        ← 返回餐厅列表
      </Link>

      <div className="card mb-6">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 border-b border-orange-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
              <p className="text-gray-500 mt-1">📍 {data.city} · {data.address}</p>
              {data.phone && <p className="text-gray-500 text-sm mt-1">📞 {data.phone}</p>}
              {data.website && <p className="text-gray-500 text-sm mt-1">🌐 {data.website}</p>}
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-orange-500">{priceLabel[data.price_range]}</div>
              <div className="text-gray-500 text-sm">{data.cuisine}</div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">评分</h3>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-gray-400 mb-1">综合评分</div>
                <div className="flex items-center gap-2">
                  <Stars value={data.avg_rating} />
                  <span className="font-bold text-gray-900">{data.avg_rating || '—'}</span>
                  <span className="text-xs text-gray-400">({data.review_count}条评价)</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">宠物友好评分</div>
                <div className="flex items-center gap-2">
                  <Stars value={data.avg_pet_rating} />
                  <span className="font-bold text-gray-900">{data.avg_pet_rating || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">宠物政策</h3>
            <div className="text-sm space-y-1 text-gray-600">
              <p>📍 区域：{areaLabel[data.pet_area] || data.pet_area}</p>
              <p>🐾 体型：{data.pet_size_limit === 'all' ? '欢迎所有体型' : '仅限小型宠物'}</p>
            </div>
            {data.pet_policy && (
              <p className="text-xs text-gray-500 bg-orange-50 rounded-lg p-3 mt-2">{data.pet_policy}</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">宠物友好设施</h3>
            {facilities.length > 0 ? (
              <div className="space-y-2">
                {facilities.map(f => (
                  <div key={f.label} className="flex items-center gap-2 text-sm">
                    <span>{f.icon}</span>
                    <span className="text-green-600 font-medium">{f.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">暂无特别设施记录</p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">用户评价 ({data.reviews?.length || 0})</h2>
          <button onClick={() => setShowReview(true)} className="btn-primary">✍️ 写评价</button>
        </div>

        {data.reviews?.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <p>还没有评价，成为第一个评价的用户吧！</p>
            <button onClick={() => setShowReview(true)} className="btn-primary mt-4">写第一条评价</button>
          </div>
        ) : (
          data.reviews?.map(rv => (
            <div key={rv.id} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg font-bold text-orange-600">
                    {rv.author[0]}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{rv.author}</div>
                    {rv.pet_name && (
                      <div className="text-xs text-gray-400">🐾 {rv.pet_name} · {rv.pet_type}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Stars value={rv.rating} />
                    <span className="text-sm text-gray-500">({rv.rating})</span>
                  </div>
                  <div className="text-xs text-gray-400">宠物友好 {rv.pet_rating}⭐</div>
                  <div className="text-xs text-gray-300">{new Date(rv.created_at).toLocaleDateString('zh-CN')}</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{rv.content}</p>
            </div>
          ))
        )}
      </div>

      {showReview && (
        <ReviewModal
          restaurantId={data.id}
          restaurantName={data.name}
          onClose={() => setShowReview(false)}
          onSuccess={() => { setShowReview(false); load(); }}
        />
      )}
    </div>
  );
}
