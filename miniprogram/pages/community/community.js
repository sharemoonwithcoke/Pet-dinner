const app = getApp();

const TIP_ICONS = { '礼仪': '🎩', '选择指南': '🔍', '安全须知': '⚠️', '准备清单': '📋', '行为训练': '🎓' };

function makeStars(val) {
  const n = Math.round(val || 0);
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

Page({
  data: {
    activeTab: 'reviews',
    reviews: [],
    tips: [],
    loading: true,
    expandedTips: {},
  },

  onLoad() {
    this.loadAll();
  },

  onPullDownRefresh() {
    this.loadAll().finally(() => wx.stopPullDownRefresh());
  },

  async loadAll() {
    this.setData({ loading: true });
    const [reviews, tips] = await Promise.all([
      app.request('/api/reviews/recent?limit=30').catch(() => []),
      app.request('/api/analytics/tips').catch(() => []),
    ]);
    this.setData({
      reviews: reviews.map(r => ({ ...r, starStr: makeStars(r.rating), dateStr: formatDate(r.created_at) })),
      tips: tips.map(t => ({ ...t, icon: TIP_ICONS[t.category] || '🐾' })),
      loading: false,
    });
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  toggleTip(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ [`expandedTips.${id}`]: !this.data.expandedTips[id] });
  },

  goRestaurant(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` });
  },
});
