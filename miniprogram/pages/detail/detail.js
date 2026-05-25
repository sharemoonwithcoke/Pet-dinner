const app = getApp();
const PRICE_MAP = { 1: '¥', 2: '¥¥', 3: '¥¥¥', 4: '¥¥¥¥' };
const AREA_MAP  = { outdoor: '仅室外', indoor: '仅室内', both: '室内外均可' };

function makeStars(val) {
  const n = Math.round(val || 0);
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

Page({
  data: {
    restaurant: null,
    reviews: [],
    facilities: [],
    loadError: false,
    priceMap: PRICE_MAP,
    areaMap: AREA_MAP,
    showReviewForm: false,
    submitting: false,
    reviewForm: { author: '', rating: 5, pet_rating: 5, content: '', pet_name: '', pet_type: '' },
  },

  onLoad({ id }) {
    this.restaurantId = id;
    this.load();
  },

  onPullDownRefresh() {
    this.load().finally(() => wx.stopPullDownRefresh());
  },

  async load() {
    try {
      const data = await app.request(`/api/restaurants/${this.restaurantId}`);
      const facilities = [
        data.has_pet_menu    && { icon: '🍖', label: '宠物菜单' },
        data.has_pet_seats   && { icon: '🪑', label: '宠物座椅' },
        data.has_pet_bowls   && { icon: '🥣', label: '宠物水碗' },
        data.has_pet_toys    && { icon: '🎾', label: '宠物玩具' },
        data.has_pet_parking && { icon: '🅿️', label: '宠物停车' },
      ].filter(Boolean);

      const reviews = (data.reviews || []).map(r => ({
        ...r, starStr: makeStars(r.rating), dateStr: formatDate(r.created_at),
      }));

      this.setData({
        restaurant: { ...data, starStr: makeStars(data.avg_rating), petStarStr: makeStars(data.avg_pet_rating) },
        reviews,
        facilities,
        loadError: false,
      });
      wx.setNavigationBarTitle({ title: data.name });
    } catch {
      this.setData({ loadError: true });
    }
  },

  openReviewForm() {
    this.setData({ showReviewForm: true });
  },

  closeReviewForm() {
    this.setData({ showReviewForm: false });
  },

  onFormInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`reviewForm.${key}`]: e.detail.value });
  },

  setRating(e) {
    this.setData({ 'reviewForm.rating': e.currentTarget.dataset.val });
  },

  setPetRating(e) {
    this.setData({ 'reviewForm.pet_rating': e.currentTarget.dataset.val });
  },

  async submitReview() {
    const { reviewForm, submitting } = this.data;
    if (submitting) return;
    if (!reviewForm.author.trim() || !reviewForm.content.trim()) {
      wx.showToast({ title: '请填写昵称和评价内容', icon: 'error' });
      return;
    }
    this.setData({ submitting: true });
    try {
      await app.request('/api/reviews', {
        method: 'POST',
        data: { ...reviewForm, restaurant_id: Number(this.restaurantId) },
      });
      wx.showToast({ title: '评价提交成功 🎉', icon: 'success' });
      this.setData({
        showReviewForm: false,
        submitting: false,
        reviewForm: { author: '', rating: 5, pet_rating: 5, content: '', pet_name: '', pet_type: '' },
      });
      this.load();
    } catch {
      this.setData({ submitting: false });
      wx.showToast({ title: '提交失败，请重试', icon: 'error' });
    }
  },
});
