const app = getApp();

const COLORS = ['#f97316','#fb923c','#fcd34d','#86efac','#93c5fd','#c4b5fd'];

Page({
  data: {
    loading: true,
    overview: null,
    statCards: [],
    cityChart: [],
    ratingDist: [],
    cuisineChart: [],
    facilityItems: [],
    topRestaurants: [],
    insights: [],
  },

  onLoad() { this.loadAll(); },
  onPullDownRefresh() { this.loadAll().finally(() => wx.stopPullDownRefresh()); },

  async loadAll() {
    this.setData({ loading: true });
    const [overview, byCity, byCuisine, ratingDist, topRestaurants, insights] = await Promise.all([
      app.request('/api/analytics/overview').catch(() => null),
      app.request('/api/analytics/by-city').catch(() => []),
      app.request('/api/analytics/by-cuisine').catch(() => []),
      app.request('/api/analytics/rating-distribution').catch(() => []),
      app.request('/api/analytics/top-restaurants').catch(() => []),
      app.request('/api/analytics/insights').catch(() => []),
    ]);

    const statCards = overview ? [
      { icon: '🏪', value: overview.totalRestaurants, label: '宠物友好餐厅', color: '#f97316' },
      { icon: '🌆', value: overview.totalCities,       label: '覆盖城市',     color: '#3b82f6' },
      { icon: '💬', value: overview.totalReviews,      label: '用户评价',     color: '#8b5cf6' },
      { icon: '⭐', value: overview.avgRating,         label: '平均评分',     color: '#f59e0b' },
    ] : [];

    // City chart — percentage of max
    const maxCity = Math.max(...byCity.map(c => c.restaurant_count), 1);
    const cityChart = byCity.map(c => ({ ...c, pct: Math.round(c.restaurant_count / maxCity * 100) }));

    // Rating dist — percentage of total
    const totalRatings = ratingDist.reduce((s, r) => s + r.count, 0) || 1;
    const ratingDistProcessed = [5,4,3,2,1].map(star => {
      const found = ratingDist.find(r => r.rating === star) || { count: 0 };
      return { rating: star, count: found.count, pct: Math.round(found.count / totalRatings * 100) };
    });

    // Cuisine chart
    const maxCuisine = Math.max(...byCuisine.map(c => c.count), 1);
    const cuisineChart = byCuisine.map((c, i) => ({
      ...c, pct: Math.round(c.count / maxCuisine * 100), color: COLORS[i % COLORS.length],
    }));

    // Facility items
    const facilityItems = overview ? [
      { label: '宠物水碗', pct: overview.facilityCoverage.bowls_pct },
      { label: '宠物座椅', pct: overview.facilityCoverage.seats_pct },
      { label: '宠物菜单', pct: overview.facilityCoverage.menu_pct },
      { label: '宠物玩具', pct: overview.facilityCoverage.toys_pct },
      { label: '宠物停车', pct: overview.facilityCoverage.parking_pct },
    ] : [];

    // Top restaurants rank badge class
    const top = topRestaurants.map((r, i) => ({
      ...r,
      rankClass: i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '',
    }));

    this.setData({
      loading: false, overview, statCards, cityChart,
      ratingDist: ratingDistProcessed, cuisineChart, facilityItems,
      topRestaurants: top, insights,
    });
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` });
  },
});
