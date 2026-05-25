// Change to your backend URL
// Development: 'http://localhost:3001'
// Production:  'https://your-domain.com' (must be HTTPS + registered in WeChat console)
const BASE_URL = 'http://localhost:3001';

App({
  globalData: {
    BASE_URL,
  },

  request(path, options = {}) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}${path}`,
        header: { 'Content-Type': 'application/json' },
        ...options,
        success(res) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(new Error(res.data?.error || '请求失败'));
          }
        },
        fail(err) {
          reject(err);
        },
      });
    });
  },
});
