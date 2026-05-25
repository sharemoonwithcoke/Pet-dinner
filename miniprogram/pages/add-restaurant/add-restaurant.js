const app = getApp();

Page({
  data: {
    form: {
      name: '', city: '', address: '', phone: '', website: '', cuisine: '',
      price_range: '2', latitude: '', longitude: '',
      pet_area: 'outdoor', pet_size_limit: 'all',
      has_pet_menu: false, has_pet_seats: false, has_pet_bowls: false,
      has_pet_toys: false, has_pet_parking: false,
      pet_policy: '',
    },
    submitting: false,
    priceOptions: [
      { value: '1', label: '¥ 经济' },
      { value: '2', label: '¥¥ 适中' },
      { value: '3', label: '¥¥¥ 较贵' },
      { value: '4', label: '¥¥¥¥ 高档' },
    ],
    areaOptions: [
      { value: 'outdoor', label: '仅室外' },
      { value: 'indoor',  label: '仅室内' },
      { value: 'both',    label: '室内外均可' },
    ],
    facilityFields: [
      { key: 'has_pet_menu',    label: '🍖 宠物菜单' },
      { key: 'has_pet_seats',   label: '🪑 宠物座椅' },
      { key: 'has_pet_bowls',   label: '🥣 宠物水碗' },
      { key: 'has_pet_toys',    label: '🎾 宠物玩具' },
      { key: 'has_pet_parking', label: '🅿️ 宠物停车' },
    ],
  },

  set(e) {
    this.setData({ [`form.${e.currentTarget.dataset.key}`]: e.detail.value });
  },

  setOption(e) {
    this.setData({ [`form.${e.currentTarget.dataset.key}`]: e.currentTarget.dataset.value });
  },

  onSwitch(e) {
    this.setData({ [`form.${e.currentTarget.dataset.key}`]: e.detail.value });
  },

  async submit() {
    if (this.data.submitting) return;
    const f = this.data.form;
    if (!f.name || !f.city || !f.address || !f.cuisine || !f.latitude || !f.longitude) {
      wx.showToast({ title: '请填写所有必填项', icon: 'error' });
      return;
    }
    this.setData({ submitting: true });
    try {
      await app.request('/api/restaurants', {
        method: 'POST',
        data: {
          ...f,
          price_range: Number(f.price_range),
          latitude: Number(f.latitude),
          longitude: Number(f.longitude),
          has_pet_menu:    f.has_pet_menu    ? 1 : 0,
          has_pet_seats:   f.has_pet_seats   ? 1 : 0,
          has_pet_bowls:   f.has_pet_bowls   ? 1 : 0,
          has_pet_toys:    f.has_pet_toys    ? 1 : 0,
          has_pet_parking: f.has_pet_parking ? 1 : 0,
        },
      });
      wx.showToast({ title: '餐厅添加成功 🎉', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      wx.showToast({ title: err.message || '提交失败，请重试', icon: 'error' });
      this.setData({ submitting: false });
    }
  },
});
