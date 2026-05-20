import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StarDisplay } from '../components/StarRating';
import { reviewAPI, analyticsAPI } from '../api/client';

const TIP_ICONS = {
  礼仪: '🎩', 选择指南: '🔍', 安全须知: '⚠️', 准备清单: '📋',
};

function ReviewItem({ item, onRestaurantPress }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.author[0]}</Text>
        </View>
        <View style={{ flex: 1, gap: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.author}>{item.author}</Text>
            {item.pet_name && (
              <Text style={styles.petTag}>🐾 {item.pet_name}</Text>
            )}
          </View>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('zh-CN')}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <StarDisplay value={item.rating} size={11} />
            <Text style={styles.ratingNum}>{item.rating}</Text>
          </View>
          <Text style={styles.petRating}>🐾 {item.pet_rating}</Text>
        </View>
      </View>

      <Text style={styles.content}>{item.content}</Text>

      <TouchableOpacity style={styles.restaurantTag} onPress={() => onRestaurantPress(item.restaurant_id)}>
        <Ionicons name="restaurant-outline" size={12} color="#f97316" />
        <Text style={styles.restaurantTagText}>{item.restaurant_name}</Text>
        <Text style={styles.restaurantCity}>{item.city}</Text>
      </TouchableOpacity>
    </View>
  );
}

function TipItem({ tip }) {
  const [expanded, setExpanded] = useState(false);
  const icon = TIP_ICONS[tip.category] || '🐾';

  return (
    <TouchableOpacity style={styles.tipCard} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
      <View style={styles.tipHeader}>
        <Text style={styles.tipIcon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>{tip.title}</Text>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{tip.category}</Text>
          </View>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#9ca3af"
        />
      </View>
      {expanded && (
        <Text style={styles.tipContent}>{tip.content}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function CommunityScreen({ navigation }) {
  const [tab, setTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [r, t] = await Promise.all([
        reviewAPI.getRecent(30),
        analyticsAPI.getTips(),
      ]);
      setReviews(r);
      setTips(t);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🐾 宠物主人社区</Text>
        <Text style={styles.headerSub}>分享您和毛孩子的用餐故事</Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'reviews' && styles.tabActive]}
          onPress={() => setTab('reviews')}
        >
          <Text style={[styles.tabText, tab === 'reviews' && styles.tabTextActive]}>
            💬 最新动态 {reviews.length > 0 && `(${reviews.length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'tips' && styles.tabActive]}
          onPress={() => setTab('tips')}
        >
          <Text style={[styles.tabText, tab === 'tips' && styles.tabTextActive]}>
            📖 外出指南 {tips.length > 0 && `(${tips.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : tab === 'reviews' ? (
        <FlatList
          data={reviews}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ReviewItem
              item={item}
              onRestaurantPress={(id) => navigation.navigate('RestaurantDetail', { id })}
            />
          )}
          contentContainerStyle={{ padding: 12, gap: 10 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#f97316" />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>💬</Text>
              <Text style={styles.emptyText}>还没有评价，去餐厅页写一条吧！</Text>
            </View>
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 12, gap: 10 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#f97316" />
          }
        >
          {tips.map((tip) => <TipItem key={tip.id} tip={tip} />)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  headerSub: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#f97316' },
  tabText: { fontSize: 13, color: '#9ca3af', fontWeight: '600' },
  tabTextActive: { color: '#f97316' },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 17, fontWeight: '800', color: '#f97316' },
  author: { fontSize: 14, fontWeight: '700', color: '#111827' },
  petTag: { fontSize: 11, color: '#9ca3af', backgroundColor: '#f3f4f6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  date: { fontSize: 11, color: '#d1d5db' },
  ratingNum: { fontSize: 11, color: '#6b7280' },
  petRating: { fontSize: 11, color: '#7c3aed' },
  content: { fontSize: 14, color: '#374151', lineHeight: 21, marginBottom: 10 },
  restaurantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff7ed',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  restaurantTagText: { fontSize: 12, color: '#f97316', fontWeight: '600' },
  restaurantCity: { fontSize: 11, color: '#9ca3af' },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipIcon: { fontSize: 28 },
  tipTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  categoryTag: { backgroundColor: '#fff7ed', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  categoryText: { fontSize: 11, color: '#f97316', fontWeight: '600' },
  tipContent: { fontSize: 14, color: '#374151', lineHeight: 22, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
});
