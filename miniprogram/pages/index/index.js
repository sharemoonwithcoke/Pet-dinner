const app = getApp();

const PRICE_MAP  = { 1: '¥', 2: '¥¥', 3: '¥¥¥', 4: '¥¥¥¥' };
const AREA_MAP   = { outdoor: '📍仅室外', indoor: '📍仅室内', both: '📍室内外' };
const PRICE_OPT  = [
  { label: '全部价位', value: '' },
  { label: '¥ 经济',  value: '1' },
  { label: '¥¥ 适中', value: '2' },
  { label: '¥¥¥ 较贵',value: '3' },
  { label: '¥¥¥¥ 高档',value: '4' },
];

function makeStars(val, char = '★') {
  const n = Math.round(val || 0);
  return char.repeat(n) + '☆'.repeat(5 - n);
}

function decorateRestaurant(r) {
  return {
    ...r,
    starStr:    makeStars(r.avg_rating),
    petStarStr: makeStars(r.avg_pet_rating),
  };
}

Page({
  data: {
    restaurants: [],
    cities: [],
    stats: null,
    loading: true,
    filters: { search: '', city: '', price_range: '', pet_size_limit: '', has_pet_menu: false, has_pet_bowls: false },
    priceOptions: PRICE_OPT,
    priceMap:  PRICE_MAP,
    areaMap:   AREA_MAP,
  },

  onLoad() {
    this.loadMeta();
    this.loadRestaurants();
    app.request('/api/analytics/overview')
      .then(stats => this.setData({ stats }))
      .catch(() => {});
  },

  onPullDownRefresh() {
    this.loadRestaurants().finally(() => wx.stopPullDownRefresh());
  },

  loadMeta() {
    app.request('/api/restaurants/meta/cities')
      .then(cities => this.setData({ cities }))
      .catch(() => {});
  },

  async loadRestaurants() {
    this.setData({ loading: true });
    const { filters } = this.data;
    const params = new URLSearchParams();
    if (filters.search)        params.append('search', filters.search);
    if (filters.city)          params.append('city', filters.city);
    if (filters.price_range)   params.append('price_range', filters.price_range);
    if (filters.pet_size_limit)params.append('pet_size_limit', filters.pet_size_limit);
    if (filters.has_pet_menu)  params.append('has_pet_menu', '1');
    if (filters.has_pet_bowls) params.append('has_pet_bowls', '1');

    const query = params.toString();
    return app.request(`/api/restaurants${query ? '?' + query : ''}`)
      .then(data => {
        this.setData({ restaurants: data.map(decorateRestaurant), loading: false });
      })
      .catch(() => {
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败，请检查网络', icon: 'error' });
      });
  },

  onSearch(e) {
    this.setData({ 'filters.search': e.detail.value });
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => this.loadRestaurants(), 400);
  },

  clearSearch() {
    this.setData({ 'filters.search': '' });
    this.loadRestaurants();
  },

  onCityTap(e) {
    this.setData({ 'filters.city': e.currentTarget.dataset.city });
    this.loadRestaurants();
  },

  onPriceTap(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ 'filters.price_range': value === this.data.filters.price_range ? '' : value });
    this.loadRestaurants();
  },

  onSizeTap(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ 'filters.pet_size_limit': value === this.data.filters.pet_size_limit ? '' : value });
    this.loadRestaurants();
  },

  toggleFacility(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`filters.${key}`]: !this.data.filters[key] });
    this.loadRestaurants();
  },

  onCardTap(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` });
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/add-restaurant/add-restaurant' });
  },
});
