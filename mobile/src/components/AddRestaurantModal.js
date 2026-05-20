import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Switch, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { restaurantAPI } from '../api/client';

const INITIAL = {
  name: '', city: '', address: '', phone: '', cuisine: '',
  price_range: '2', latitude: '', longitude: '',
  pet_area: 'outdoor', pet_size_limit: 'all',
  has_pet_menu: false, has_pet_seats: false, has_pet_bowls: false,
  has_pet_toys: false, has_pet_parking: false, pet_policy: '',
};

function Field({ label, required, children }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}{required && <Text style={{ color: '#ef4444' }}> *</Text>}</Text>
      {children}
    </View>
  );
}

function Input({ ...props }) {
  return <TextInput style={styles.input} placeholderTextColor="#9ca3af" {...props} />;
}

export default function AddRestaurantModal({ visible, onClose, onSuccess }) {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.city || !form.address || !form.cuisine || !form.latitude || !form.longitude) {
      Alert.alert('提示', '请填写所有必填项（标 * 字段）');
      return;
    }
    setLoading(true);
    try {
      await restaurantAPI.create({
        ...form,
        price_range: Number(form.price_range),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        has_pet_menu: form.has_pet_menu ? 1 : 0,
        has_pet_seats: form.has_pet_seats ? 1 : 0,
        has_pet_bowls: form.has_pet_bowls ? 1 : 0,
        has_pet_toys: form.has_pet_toys ? 1 : 0,
        has_pet_parking: form.has_pet_parking ? 1 : 0,
      });
      setForm(INITIAL);
      onSuccess();
    } catch (e) {
      Alert.alert('错误', e.response?.data?.error || '提交失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const PriceOption = ({ value, label }) => (
    <TouchableOpacity
      style={[styles.optionBtn, form.price_range === value && styles.optionBtnActive]}
      onPress={() => update('price_range', value)}
    >
      <Text style={[styles.optionText, form.price_range === value && styles.optionTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const AreaOption = ({ value, label }) => (
    <TouchableOpacity
      style={[styles.optionBtn, form.pet_area === value && styles.optionBtnActive]}
      onPress={() => update('pet_area', value)}
    >
      <Text style={[styles.optionText, form.pet_area === value && styles.optionTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>🍽️ 添加宠物友好餐厅</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>关闭</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          <Field label="餐厅名称" required>
            <Input value={form.name} onChangeText={(v) => update('name', v)} placeholder="例：汪星人花园餐厅" />
          </Field>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Field label="城市" required>
                <Input value={form.city} onChangeText={(v) => update('city', v)} placeholder="上海" />
              </Field>
            </View>
            <View style={{ flex: 2 }}>
              <Field label="菜系" required>
                <Input value={form.cuisine} onChangeText={(v) => update('cuisine', v)} placeholder="中式料理、西餐..." />
              </Field>
            </View>
          </View>

          <Field label="详细地址" required>
            <Input value={form.address} onChangeText={(v) => update('address', v)} placeholder="静安区南京西路1号" />
          </Field>

          <Field label="联系电话">
            <Input value={form.phone} onChangeText={(v) => update('phone', v)} placeholder="021-12345678" keyboardType="phone-pad" />
          </Field>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Field label="纬度" required>
                <Input value={form.latitude} onChangeText={(v) => update('latitude', v)} placeholder="31.2304" keyboardType="decimal-pad" />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="经度" required>
                <Input value={form.longitude} onChangeText={(v) => update('longitude', v)} placeholder="121.4737" keyboardType="decimal-pad" />
              </Field>
            </View>
          </View>

          <Field label="价格区间">
            <View style={styles.optionRow}>
              <PriceOption value="1" label="¥" />
              <PriceOption value="2" label="¥¥" />
              <PriceOption value="3" label="¥¥¥" />
              <PriceOption value="4" label="¥¥¥¥" />
            </View>
          </Field>

          <Field label="宠物区域">
            <View style={styles.optionRow}>
              <AreaOption value="outdoor" label="仅室外" />
              <AreaOption value="indoor" label="仅室内" />
              <AreaOption value="both" label="室内外" />
            </View>
          </Field>

          <Field label="体型限制">
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[styles.optionBtn, form.pet_size_limit === 'all' && styles.optionBtnActive]}
                onPress={() => update('pet_size_limit', 'all')}
              >
                <Text style={[styles.optionText, form.pet_size_limit === 'all' && styles.optionTextActive]}>🐾 全体型</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionBtn, form.pet_size_limit === 'small' && styles.optionBtnActive]}
                onPress={() => update('pet_size_limit', 'small')}
              >
                <Text style={[styles.optionText, form.pet_size_limit === 'small' && styles.optionTextActive]}>🐕 仅小型</Text>
              </TouchableOpacity>
            </View>
          </Field>

          <Field label="宠物友好设施">
            {[
              { key: 'has_pet_menu', label: '🍖 宠物菜单' },
              { key: 'has_pet_bowls', label: '🥣 宠物水碗' },
              { key: 'has_pet_seats', label: '🪑 宠物座椅' },
              { key: 'has_pet_toys', label: '🎾 宠物玩具' },
              { key: 'has_pet_parking', label: '🅿️ 宠物停车' },
            ].map((f) => (
              <View key={f.key} style={styles.switchRow}>
                <Text style={styles.switchLabel}>{f.label}</Text>
                <Switch
                  value={form[f.key]}
                  onValueChange={(v) => update(f.key, v)}
                  trackColor={{ true: '#f97316' }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </Field>

          <Field label="宠物政策说明">
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.pet_policy}
              onChangeText={(v) => update('pet_policy', v)}
              placeholder="描述餐厅的宠物友好政策..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Field>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            onPress={submit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>✅ 提交餐厅</Text>}
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  title: { fontSize: 17, fontWeight: '700', color: '#111827' },
  closeBtn: { fontSize: 15, color: '#f97316', fontWeight: '600' },
  body: { flex: 1, backgroundColor: '#fff', padding: 16 },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  textarea: { height: 90, paddingTop: 10 },
  optionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  optionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  optionBtnActive: { backgroundColor: '#fff7ed', borderColor: '#f97316' },
  optionText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  optionTextActive: { color: '#f97316', fontWeight: '700' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  switchLabel: { fontSize: 14, color: '#374151' },
  submitBtn: {
    backgroundColor: '#f97316',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
