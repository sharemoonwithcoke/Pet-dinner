import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend,
} from 'recharts';

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fde68a', '#fed7aa', '#fef3c7'];
const priceMap = { 1: '¥经济', 2: '¥¥适中', 3: '¥¥¥较贵', 4: '¥¥¥¥高档' };
const facilityMap = { pet_menu: '宠物菜单', pet_seats: '宠物座椅', pet_bowls: '宠物水碗', pet_toys: '宠物玩具', pet_parking: '宠物停车' };

function StatCard({ icon, value, label, sub }) {
  return (
    <div className="card p-5 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-orange-500">{value ?? '—'}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [byCity, setByCity] = useState([]);
  const [byCuisine, setByCuisine] = useState([]);
  const [byPrice, setByPrice] = useState([]);
  const [byArea, setByArea] = useState([]);
  const [ratingDist, setRatingDist] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/analytics/overview'),
      axios.get('/api/analytics/by-city'),
      axios.get('/api/analytics/by-cuisine'),
      axios.get('/api/analytics/by-price'),
      axios.get('/api/analytics/by-pet-area'),
      axios.get('/api/analytics/rating-distribution'),
      axios.get('/api/analytics/top-restaurants'),
      axios.get('/api/analytics/facilities'),
      axios.get('/api/analytics/insights'),
    ]).then(([o, c, cu, p, a, r, t, f, i]) => {
      setOverview(o.data);
      setByCity(c.data);
      setByCuisine(cu.data);
      setByPrice(p.data.map(d => ({ ...d, name: priceMap[d.price_range] })));
      setByArea(a.data.map(d => ({
        ...d,
        name: d.pet_area === 'outdoor' ? '仅室外' : d.pet_area === 'indoor' ? '仅室内' : '室内外'
      })));
      setRatingDist(r.data);
      setTopRestaurants(t.data);
      setFacilities(f.data.map(d => ({ name: facilityMap[d.facility] || d.facility, count: d.count })));
      setInsights(i.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">
      <div className="text-4xl animate-bounce mb-4">📊</div>
      <p>数据分析加载中...</p>
    </div>
  );

  const facilityRadarData = facilities.map(f => ({
    facility: f.name,
    count: f.count,
    fullMark: overview?.totalRestaurants || 10,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">📊 数据分析仪表盘</h1>
        <p className="text-gray-500">基于平台数据的宠物友好餐厅市场洞察</p>
      </div>

      {/* Overview cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard icon="🏪" value={overview.totalRestaurants} label="宠物友好餐厅" />
          <StatCard icon="🌆" value={overview.totalCities} label="覆盖城市" />
          <StatCard icon="💬" value={overview.totalReviews} label="用户评价" />
          <StatCard icon="⭐" value={overview.avgRating} label="平均综合评分" sub="满分5分" />
          <StatCard icon="🐾" value={overview.avgPetRating} label="平均宠物友好分" sub="满分5分" />
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">💡 市场洞察与建议</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins, i) => (
              <div key={i} className="card p-5 border-l-4 border-l-orange-400">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{ins.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">{ins.title}</div>
                    <p className="text-sm text-gray-600 leading-relaxed">{ins.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City distribution bar chart */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4">各城市餐厅数量分布</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byCity} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="city" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v, n) => [v, n === 'restaurant_count' ? '餐厅数量' : '平均评分']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="restaurant_count" name="餐厅数量" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cuisine pie chart */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4">菜系类型分布</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={byCuisine}
                dataKey="count"
                nameKey="cuisine"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ cuisine, percent }) => `${cuisine} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {byCuisine.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [v, '餐厅数']} contentStyle={{ borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Price range analysis */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4">价格区间 vs 评分对比</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byPrice} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Bar dataKey="avg_rating" name="综合评分" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avg_pet_rating" name="宠物友好分" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Facility radar */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4">宠物友好设施覆盖分析</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={facilityRadarData}>
              <PolarGrid stroke="#f3f4f6" />
              <PolarAngleAxis dataKey="facility" tick={{ fontSize: 11 }} />
              <Radar name="设施数量" dataKey="count" stroke="#f97316" fill="#f97316" fillOpacity={0.4} />
              <Tooltip contentStyle={{ borderRadius: '8px' }} />
            </RadarChart>
          </ResponsiveContainer>
          {overview?.facilityCoverage && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: '宠物水碗', pct: overview.facilityCoverage.bowls_pct },
                { label: '宠物座椅', pct: overview.facilityCoverage.seats_pct },
                { label: '宠物菜单', pct: overview.facilityCoverage.menu_pct },
              ].map(f => (
                <div key={f.label} className="bg-orange-50 rounded-lg p-2">
                  <div className="text-orange-500 font-bold text-lg">{f.pct}%</div>
                  <div className="text-xs text-gray-500">{f.label}覆盖率</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rating distribution */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-4">评分分布</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(star => {
            const entry = ratingDist.find(r => r.rating === star);
            const count = entry?.count || 0;
            const total = ratingDist.reduce((s, r) => s + r.count, 0);
            const pct = total > 0 ? Math.round(count / total * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-8">{star}星</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-yellow-400 h-3 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">{count}条</span>
                <span className="text-sm text-gray-400 w-10">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top restaurants */}
      {topRestaurants.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4">🏆 宠物友好餐厅排行榜</h3>
          <div className="space-y-3">
            {topRestaurants.map((r, i) => (
              <div key={r.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  i === 0 ? 'bg-yellow-100 text-yellow-600' :
                  i === 1 ? 'bg-gray-100 text-gray-600' :
                  i === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-50 text-gray-400'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{r.name}</div>
                  <div className="text-xs text-gray-400">{r.city} · {r.cuisine}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-yellow-500">⭐ {r.avg_rating}</div>
                  <div className="text-xs text-purple-500">🐾 {r.avg_pet_rating}</div>
                </div>
                <div className="text-xs text-gray-400 w-14 text-right">{r.review_count}条评价</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pet area distribution */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-4">宠物区域类型分布</h3>
        <div className="flex gap-6 flex-wrap">
          {byArea.map((a, i) => (
            <div key={a.pet_area} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[i] }} />
              <span className="text-sm text-gray-700">{a.name}</span>
              <span className="text-sm font-bold text-gray-900">{a.count}家</span>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={byArea} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
              {byArea.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
