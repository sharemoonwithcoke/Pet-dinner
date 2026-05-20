import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { StarPicker } from './StarRating';
import { reviewAPI } from '../api/client';

export default function ReviewModal({ visible, restaurantId, restaurantName, onClose, onSuccess }) {
  const [form, setForm] = useState({
    author: '', rating: 5, pet_rating: 5, content: '', pet_name: '', pet_type: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.author.trim() || !form.content.trim()) {
      Alert.alert('提示', '请填写昵称和评价内容');
      return;
    }
    setLoading(true);
    try {
      await reviewAPI.create({ ...form, restaurant_id: restaurantId });
      setForm({ author: '', rating: 5, pet_rating: 5, content: '', pet_name: '', pet_type: '' });
      onSuccess();
    } catch (e) {
      Alert.alert('错误', '提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>✍️ 写评价</Text>
            <Text style={styles.subtitle}>{restaurantName}</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>关闭</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <Text style={styles.label}>您的昵称 <Text style={{ color: '#ef4444' }}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={form.author}
              onChangeText={(v) => update('author', v)}
              placeholder="请输入昵称"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.ratingsRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>综合评分</Text>
              <StarPicker value={form.rating} onChange={(v) => update('rating', v)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>宠物友好</Text>
              <StarPicker value={form.pet_rating} onChange={(v) => update('pet_rating', v)} size={28} />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>评价内容 <Text style={{ color: '#ef4444' }}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.content}
              onChangeText={(v) => update('content', v)}
              placeholder="分享您和宠物的用餐体验..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <View style={styles.field}>
                <Text style={styles.label}>宠物名字</Text>
                <TextInput
                  style={styles.input}
                  value={form.pet_name}
                  onChangeText={(v) => update('pet_name', v)}
                  placeholder="豆豆"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.field}>
                <Text style={styles.label}>宠物类型</Text>
                <TextInput
                  style={styles.input}
                  value={form.pet_type}
                  onChangeText={(v) => update('pet_type', v)}
                  placeholder="金毛、柴犬..."
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            onPress={submit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>提交评价</Text>}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  title: { fontSize: 17, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  closeBtn: { fontSize: 15, color: '#f97316', fontWeight: '600' },
  body: { flex: 1, backgroundColor: '#fff', padding: 16 },
  field: { marginBottom: 14 },
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
  textarea: { height: 100, paddingTop: 10 },
  ratingsRow: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  submitBtn: {
    backgroundColor: '#f97316',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
