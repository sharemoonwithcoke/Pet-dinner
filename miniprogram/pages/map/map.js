const app = getApp();
const PRICE_MAP = { 1: '¥', 2: '¥¥', 3: '¥¥¥', 4: '¥¥¥¥' };

// City centers (GCJ-02 coordinates used by Tencent Maps)
const CITY_CENTERS = {
  上海: { latitude: 31.2304, longitude: 121.4737 },
  北京: { latitude: 39.9042, longitude: 116.4074 },
  成都: { latitude: 30.6573, longitude: 104.0657 },
  广州: { latitude: 23.1291, longitude: 113.2644 },
  深圳: { latitude: 22.5371, longitude: 113.9346 },
  杭州: { latitude: 30.2741, longitude: 120.1551 },
};

Page({
  data: {
    restaurants: [],
    cities: [],
    markers: [],
    center: { latitude: 32.0, longitude: 114.0 },
    scale: 5,
    selectedCity: '',
    selected: null,
    selectedId: null,
    priceMap: PRICE_MAP,
  },

  onLoad() {
    app.request('/api/restaurants/meta/cities')
      .then(cities => this.setData({ cities }))
      .catch(() => {});
    this.loadRestaurants();
  },

  async loadRestaurants() {
    const { selectedCity } = this.data;
    const query = selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : '';
    const data = await app.request(`/api/restaurants${query}`).catch(() => []);
    const markers = data.map(r => ({
      id: r.id,
      latitude: r.latitude,
      longitude: r.longitude,
      title: r.name,
      label: { content: r.name, color: '#f97316', fontSize: 12, anchorX: 0, anchorY: -20, bgColor: '#fff7ed', padding: 4, borderRadius: 4 },
      width: 36,
      height: 36,
      callout: {
        content: `${r.name}\n${r.cuisine} ${PRICE_MAP[r.price_range]}`,
        display: 'BYCLICK',
        borderRadius: 8,
        padding: 10,
        bgColor: '#ffffff',
        color: '#111827',
        fontSize: 14,
      },
    }));
    this.setData({ restaurants: data, markers });
  },

  onCityTap(e) {
    const city = e.currentTarget.dataset.city;
    this.setData({ selectedCity: city, selected: null, selectedId: null });
    if (city && CITY_CENTERS[city]) {
      this.setData({ center: CITY_CENTERS[city], scale: 13 });
    } else {
      this.setData({ center: { latitude: 32.0, longitude: 114.0 }, scale: 5 });
    }
    this.loadRestaurants();
  },

  onMarkerTap(e) {
    const id = e.markerId;
    const restaurant = this.data.restaurants.find(r => r.id === id);
    if (restaurant) {
      this.setData({
        selected: restaurant,
        selectedId: id,
        center: { latitude: restaurant.latitude, longitude: restaurant.longitude },
        scale: 15,
      });
    }
  },

  onMiniCardTap(e) {
    const { id, lat, lng } = e.currentTarget.dataset;
    const restaurant = this.data.restaurants.find(r => r.id === id);
    this.setData({
      selected: restaurant || null,
      selectedId: id,
      center: { latitude: Number(lat), longitude: Number(lng) },
      scale: 15,
    });
  },

  onMapTap() {
    if (this.data.selected) this.setData({ selected: null });
  },

  clearSelected() {
    this.setData({ selected: null });
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` });
  },
});
