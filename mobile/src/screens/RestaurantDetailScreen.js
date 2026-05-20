import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StarDisplay } from '../components/StarRating';
import ReviewModal from '../components/ReviewModal';
import { restaurantAPI } from '../api/client';

const PRICE = { 1: '¥', 2: '¥¥', 3: '¥¥¥', 4: '¥¥¥¥' };
const AREA = { outdoor: '仅室外', indoor: '仅室内', both: '室内外均可' };

function InfoRow({ icon, text }) {
  if (!text) return null;
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={14} color="#9ca3af" />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

export default function RestaurantDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const d = await restaurantAPI.getOne(id);
      setData(d);
      navigation.setOptions({ title: d.name });
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>餐厅不存在</Text>
      </View>
    );
  }

  const facilities = [
    data.has_pet_menu && { icon: '🍖', label: '宠物菜单' },
    data.has_pet_seats && { icon: '🪑', label: '宠物座椅' },
    data.has_pet_bowls && { icon: '🥣', label: '宠物水碗' },
    data.has_pet_toys && { icon: '🎾', label: '宠物玩具' },
    data.has_pet_parking && { icon: '🅿️', label: '宠物停车' },
  ].filter(Boolean);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#f97316" />}
      >
        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{data.name}</Text>
              <InfoRow icon="location-outline" text={`${data.city} · ${data.address}`} />
              <InfoRow icon="call-outline" text={data.phone} />
              <InfoRow icon="globe-outline" text={data.website} />
            </View>
            <View style={styles.priceBlock}>
              <Text style={styles.price}>{PRICE[data.price_range]}</Text>
              <Text style={styles.cuisine}>{data.cuisine}</Text>
            </View>
          </View>

          <View style={styles.ratingsGrid}>
            <View style={styles.ratingCell}>
              <Text style={styles.ratingCellLabel}>综合评分</Text>
              <StarDisplay value={data.avg_rating} size={16} />
              <Text style={styles.ratingCellValue}>
                {data.avg_rating ?? '暂无'} <Text style={styles.reviewCount}>({data.review_count}条)</Text>
              </Text>
            </View>
            <View style={[styles.ratingCell, { borderLeftWidth: 1, borderLeftColor: '#f3f4f6' }]}>
              <Text style={styles.ratingCellLabel}>宠物友好</Text>
              <StarDisplay value={data.avg_pet_rating} size={16} color="#a78bfa" />
              <Text style={[styles.ratingCellValue, { color: '#7c3aed' }]}>
                {data.avg_pet_rating ?? '暂无'}
              </Text>
            </View>
          </View>
        </View>

        {/* Pet policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🐾 宠物政策</Text>
          <View style={styles.policyGrid}>
            <View style={styles.policyItem}>
              <Text style={styles.policyLabel}>区域</Text>
              <Text style={styles.policyValue}>{AREA[data.pet_area] || data.pet_area}</Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.policyLabel}>体型限制</Text>
              <Text style={styles.policyValue}>
                {data.pet_size_limit === 'all' ? '欢迎所有体型' : '仅限小型宠物'}
              </Text>
            </View>
          </View>
          {data.pet_policy ? (
            <View style={styles.policyNote}>
              <Text style={styles.policyNoteText}>{data.pet_policy}</Text>
            </View>
          ) : null}
        </View>

        {/* Facilities */}
        {facilities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ 宠物友好设施</Text>
            <View style={styles.facilitiesGrid}>
              {facilities.map((f) => (
                <View key={f.label} style={styles.facilityItem}>
                  <Text style={styles.facilityIcon}>{f.icon}</Text>
                  <Text style={styles.facilityLabel}>{f.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💬 用户评价 ({data.reviews?.length ?? 0})</Text>
            <TouchableOpacity style={styles.writeReviewBtn} onPress={() => setShowReview(true)}>
              <Ionicons name="pencil" size={13} color="#f97316" />
              <Text style={styles.writeReviewText}>写评价</Text>
            </TouchableOpacity>
          </View>

          {data.reviews?.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Text style={styles.emptyText}>还没有评价，来写第一条吧！</Text>
              <TouchableOpacity style={styles.writeFirstBtn} onPress={() => setShowReview(true)}>
                <Text style={styles.writeFirstText}>✍️ 写第一条评价</Text>
              </TouchableOpacity>
            </View>
          ) : (
            data.reviews?.map((rv) => (
              <View key={rv.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{rv.author[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewAuthor}>{rv.author}</Text>
                    {rv.pet_name && (
                      <Text style={styles.petInfo}>🐾 {rv.pet_name} · {rv.pet_type}</Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <StarDisplay value={rv.rating} size={11} />
                      <Text style={styles.ratingNum}>{rv.rating}</Text>
                    </View>
                    <Text style={styles.petRating}>宠物友好 {rv.pet_rating}⭐</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(rv.created_at).toLocaleDateString('zh-CN')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reviewContent}>{rv.content}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <ReviewModal
        visible={showReview}
        restaurantId={data.id}
        restaurantName={data.name}
        onClose={() => setShowReview(false)}
        onSuccess={() => { setShowReview(false); load(true); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: '#6b7280' },
  heroCard: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  heroRow: { flexDirection: 'row', padding: 16, gap: 10 },
  name: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  infoText: { fontSize: 12, color: '#6b7280' },
  priceBlock: { alignItems: 'flex-end' },
  price: { fontSize: 24, fontWeight: '800', color: '#f97316' },
  cuisine: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  ratingsGrid: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  ratingCell: { flex: 1, padding: 14, gap: 4 },
  ratingCellLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '600' },
  ratingCellValue: { fontSize: 14, fontWeight: '700', color: '#374151', marginTop: 2 },
  reviewCount: { fontSize: 12, fontWeight: '400', color: '#9ca3af' },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f97316',
  },
  writeReviewText: { fontSize: 12, color: '#f97316', fontWeight: '600' },
  policyGrid: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  policyItem: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 10, padding: 10 },
  policyLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 3 },
  policyValue: { fontSize: 13, fontWeight: '600', color: '#374151' },
  policyNote: { backgroundColor: '#fff7ed', borderRadius: 10, padding: 10 },
  policyNoteText: { fontSize: 13, color: '#92400e', lineHeight: 19 },
  facilitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  facilityItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  facilityIcon: { fontSize: 16 },
  facilityLabel: { fontSize: 13, color: '#15803d', fontWeight: '600' },
  emptyReviews: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
  writeFirstBtn: { backgroundColor: '#f97316', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  writeFirstText: { color: '#fff', fontWeight: '700' },
  reviewCard: {
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#f97316' },
  reviewAuthor: { fontSize: 14, fontWeight: '700', color: '#111827' },
  petInfo: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  ratingNum: { fontSize: 11, color: '#6b7280' },
  petRating: { fontSize: 10, color: '#7c3aed', marginTop: 2 },
  reviewDate: { fontSize: 10, color: '#d1d5db', marginTop: 2 },
  reviewContent: { fontSize: 14, color: '#374151', lineHeight: 20 },
});
