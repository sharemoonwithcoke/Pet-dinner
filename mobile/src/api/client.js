import axios from 'axios';

// Change to your machine's local IP when testing on a real device
// e.g. 'http://192.168.1.100:3001'
// For Android emulator use: 'http://10.0.2.2:3001'
export const API_BASE = __DEV__
  ? 'http://localhost:3001'
  : 'https://your-production-api.com';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const restaurantAPI = {
  getAll: (params = {}) =>
    client.get('/api/restaurants', { params }).then((r) => r.data),
  getOne: (id) =>
    client.get(`/api/restaurants/${id}`).then((r) => r.data),
  create: (data) =>
    client.post('/api/restaurants', data).then((r) => r.data),
  getCities: () =>
    client.get('/api/restaurants/meta/cities').then((r) => r.data),
  getCuisines: () =>
    client.get('/api/restaurants/meta/cuisines').then((r) => r.data),
};

export const reviewAPI = {
  create: (data) =>
    client.post('/api/reviews', data).then((r) => r.data),
  getRecent: (limit = 30) =>
    client.get(`/api/reviews/recent?limit=${limit}`).then((r) => r.data),
};

export const analyticsAPI = {
  getOverview: () =>
    client.get('/api/analytics/overview').then((r) => r.data),
  getByCity: () =>
    client.get('/api/analytics/by-city').then((r) => r.data),
  getByCuisine: () =>
    client.get('/api/analytics/by-cuisine').then((r) => r.data),
  getByPrice: () =>
    client.get('/api/analytics/by-price').then((r) => r.data),
  getRatingDist: () =>
    client.get('/api/analytics/rating-distribution').then((r) => r.data),
  getTopRestaurants: () =>
    client.get('/api/analytics/top-restaurants').then((r) => r.data),
  getInsights: () =>
    client.get('/api/analytics/insights').then((r) => r.data),
  getTips: () =>
    client.get('/api/analytics/tips').then((r) => r.data),
};
