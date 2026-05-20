import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StarDisplay } from './StarRating';

const PRICE = { 1: '¥', 2: '¥¥', 3: '¥¥¥', 4: '¥¥¥¥' };
const AREA = { outdoor: '室外', indoor: '室内', both: '室内外' };

export default function RestaurantCard({ restaurant, onPress }) {
  const {
    name, city, address, cuisine, price_range, pet_area,
    avg_rating, avg_pet_rating, review_count, pet_size_limit,
    has_pet_menu, has_pet_seats, has_pet_bowls, has_pet_toys, has_pet_parking,
  } = restaurant;

  const facilities = [
    has_pet_menu && '🍖菜单',
    has_pet_bowls && '🥣水碗',
    has_pet_seats && '🪑座椅',
    has_pet_toys && '🎾玩具',
    has_pet_parking && '🅿️停车',
  ].filter(Boolean);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.location} numberOfLines={1}>
            <Ionicons name="location-outline" size={11} color="#9ca3af" /> {city} · {address}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.price}>{PRICE[price_range]}</Text>
          <Text style={styles.cuisine}>{cuisine}</Text>
        </View>
      </View>

      {/* Ratings */}
      <View style={styles.ratings}>
        <View style={styles.ratingBlock}>
          <Text style={styles.ratingLabel}>综合</Text>
          <View style={styles.ratingRow}>
            <StarDisplay value={avg_rating} size={12} />
            <Text style={styles.ratingValue}>{avg_rating ?? '—'}</Text>
          </View>
        </View>
        <View style={styles.ratingBlock}>
          <Text style={styles.ratingLabel}>宠物友好</Text>
          <View style={styles.ratingRow}>
            <StarDisplay value={avg_pet_rating} size={12} color="#a78bfa" />
            <Text style={[styles.ratingValue, { color: '#7c3aed' }]}>{avg_pet_rating ?? '—'}</Text>
          </View>
        </View>
        <View style={{ flex: 1 }} />
        <Text style={styles.reviewCount}>{review_count ?? 0} 评</Text>
      </View>

      {/* Tags */}
      <View style={styles.tags}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>📍{AREA[pet_area] || pet_area}</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: pet_size_limit === 'all' ? '#dcfce7' : '#f3e8ff' }]}>
          <Text style={[styles.tagText, { color: pet_size_limit === 'all' ? '#15803d' : '#7c3aed' }]}>
            {pet_size_limit === 'all' ? '🐾 全体型' : '🐕 小型犬'}
          </Text>
        </View>
        {facilities.slice(0, 3).map((f) => (
          <View key={f} style={[styles.tag, { backgroundColor: '#fff7ed' }]}>
            <Text style={[styles.tagText, { color: '#c2410c' }]}>{f}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  headerLeft: { flex: 1, marginRight: 8 },
  headerRight: { alignItems: 'flex-end' },
  name: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 3 },
  location: { fontSize: 12, color: '#6b7280' },
  price: { fontSize: 18, fontWeight: '800', color: '#f97316' },
  cuisine: { fontSize: 11, color: '#9ca3af', marginTop: 1 },
  ratings: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  ratingBlock: { marginRight: 14 },
  ratingLabel: { fontSize: 10, color: '#9ca3af', marginBottom: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingValue: { fontSize: 12, fontWeight: '700', color: '#374151', marginLeft: 4 },
  reviewCount: { fontSize: 11, color: '#9ca3af' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  tagText: { fontSize: 11, color: '#1d4ed8', fontWeight: '600' },
});
