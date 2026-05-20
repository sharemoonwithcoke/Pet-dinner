import React, { useState } from 'react';
import axios from 'axios';

export default function ReviewModal({ restaurantId, restaurantName, onClose, onSuccess }) {
  const [form, setForm] = useState({
    author: '', rating: 5, pet_rating: 5, content: '', pet_name: '', pet_type: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/reviews', { ...form, restaurant_id: restaurantId, rating: Number(form.rating), pet_rating: Number(form.pet_rating) });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || '提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300";

  const StarPicker = ({ value, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" onClick={() => onChange(i)}
          className={`text-2xl transition-transform hover:scale-110 ${i <= value ? 'text-yellow-400' : 'text-gray-200'}`}>
          ★
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">✍️ 写评价</h2>
            <p className="text-sm text-gray-500">{restaurantName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">您的昵称 *</label>
            <input required value={form.author} onChange={e => update('author', e.target.value)} className={inputClass} placeholder="请输入昵称" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">综合评分 *</label>
              <StarPicker value={form.rating} onChange={v => update('rating', v)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">宠物友好评分 *</label>
              <StarPicker value={form.pet_rating} onChange={v => update('pet_rating', v)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">评价内容 *</label>
            <textarea required value={form.content} onChange={e => update('content', e.target.value)}
              className={inputClass} rows={4} placeholder="分享您和宠物的用餐体验..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">宠物名字</label>
              <input value={form.pet_name} onChange={e => update('pet_name', e.target.value)} className={inputClass} placeholder="例：豆豆" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">宠物类型</label>
              <input value={form.pet_type} onChange={e => update('pet_type', e.target.value)} className={inputClass} placeholder="例：金毛、柴犬" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">取消</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? '提交中...' : '提交评价'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
