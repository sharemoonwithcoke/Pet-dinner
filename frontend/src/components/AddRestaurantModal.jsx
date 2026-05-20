import React, { useState } from 'react';
import axios from 'axios';

const initialForm = {
  name: '', city: '', address: '', phone: '', website: '', cuisine: '',
  price_range: '2', latitude: '', longitude: '', pet_area: 'outdoor',
  pet_size_limit: 'all', has_pet_menu: false, has_pet_seats: false,
  has_pet_bowls: false, has_pet_toys: false, has_pet_parking: false,
  pet_policy: '',
};

export default function AddRestaurantModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/restaurants', {
        ...form,
        price_range: Number(form.price_range),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || '提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">🍽️ 添加宠物友好餐厅</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>餐厅名称 *</label>
              <input required value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} placeholder="例：汪星人花园餐厅" />
            </div>
            <div>
              <label className={labelClass}>城市 *</label>
              <input required value={form.city} onChange={e => update('city', e.target.value)} className={inputClass} placeholder="例：上海" />
            </div>
          </div>

          <div>
            <label className={labelClass}>详细地址 *</label>
            <input required value={form.address} onChange={e => update('address', e.target.value)} className={inputClass} placeholder="例：上海市静安区南京西路1号" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>联系电话</label>
              <input value={form.phone} onChange={e => update('phone', e.target.value)} className={inputClass} placeholder="021-12345678" />
            </div>
            <div>
              <label className={labelClass}>官方网站</label>
              <input value={form.website} onChange={e => update('website', e.target.value)} className={inputClass} placeholder="www.example.com" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>菜系类型 *</label>
              <input required value={form.cuisine} onChange={e => update('cuisine', e.target.value)} className={inputClass} placeholder="例：中式料理、西餐、咖啡" />
            </div>
            <div>
              <label className={labelClass}>价格区间 *</label>
              <select required value={form.price_range} onChange={e => update('price_range', e.target.value)} className={inputClass}>
                <option value="1">¥ 经济实惠 (人均50以下)</option>
                <option value="2">¥¥ 价格适中 (人均50-150)</option>
                <option value="3">¥¥¥ 价格较贵 (人均150-300)</option>
                <option value="4">¥¥¥¥ 高档餐厅 (人均300以上)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>纬度 * <span className="text-gray-400 text-xs">(如: 31.2304)</span></label>
              <input required type="number" step="any" value={form.latitude} onChange={e => update('latitude', e.target.value)} className={inputClass} placeholder="31.2304" />
            </div>
            <div>
              <label className={labelClass}>经度 * <span className="text-gray-400 text-xs">(如: 121.4737)</span></label>
              <input required type="number" step="any" value={form.longitude} onChange={e => update('longitude', e.target.value)} className={inputClass} placeholder="121.4737" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>宠物区域</label>
              <select value={form.pet_area} onChange={e => update('pet_area', e.target.value)} className={inputClass}>
                <option value="outdoor">仅室外</option>
                <option value="indoor">仅室内</option>
                <option value="both">室内外均可</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>宠物体型限制</label>
              <select value={form.pet_size_limit} onChange={e => update('pet_size_limit', e.target.value)} className={inputClass}>
                <option value="all">欢迎所有体型</option>
                <option value="small">仅限小型宠物</option>
              </select>
            </div>
          </div>

          {/* Facilities checkboxes */}
          <div>
            <label className={labelClass}>宠物友好设施</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { key: 'has_pet_menu', label: '🍖 宠物菜单' },
                { key: 'has_pet_seats', label: '🪑 宠物座椅' },
                { key: 'has_pet_bowls', label: '🥣 宠物水碗' },
                { key: 'has_pet_toys', label: '🎾 宠物玩具' },
                { key: 'has_pet_parking', label: '🅿️ 宠物停车' },
              ].map(f => (
                <label key={f.key} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={form[f.key]}
                    onChange={e => update(f.key, e.target.checked)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-sm text-gray-700">{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>宠物政策说明</label>
            <textarea
              value={form.pet_policy}
              onChange={e => update('pet_policy', e.target.value)}
              className={inputClass}
              rows={3}
              placeholder="请详细描述餐厅的宠物友好政策，如：宠物需要牵绳、需提前预约、允许的宠物类型等..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">取消</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? '提交中...' : '✅ 提交餐厅'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
