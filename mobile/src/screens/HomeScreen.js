import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, RefreshControl, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RestaurantCard from '../components/RestaurantCard';
import AddRestaurantModal from '../components/AddRestaurantModal';
import { restaurantAPI, analyticsAPI } from '../api/client';

const PRICE_OPTIONS = [
  { value: '', label: '全部' },
  { value: '1', label: '¥' },
  { value: '2', label: '¥¥' },
  { value: '3', label: '¥¥¥' },
  { value: '4', label: '¥¥¥¥' },
];

const SORT_OPTIONS = [
  { value: '', label: '综合' },
  { value: 'rating', label: '评分高' },
  { value: 'pet_rating', label: '宠物友好' },
  { value: 'price_asc', label: '价低先' },
];

function FilterChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sort, setSort] = useState('');
  const [petMenu, setPetMenu] = useState(false);
  const [cities, setCities] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchRestaurants = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (city) params.city = city;
      if (priceRange) params.price_range = priceRange;
      if (sort) params.sort = sort;
      if (petMenu) params.has_pet_menu = '1';
      const data = await restaurantAPI.getAll(params);
      setRestaurants(data);
    } catch {
      setRestaurants([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, city, priceRange, sort, petMenu]);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  useEffect(() => {
    restaurantAPI.getCities().then(setCities).catch(() => {});
    analyticsAPI.getOverview().then(setStats).catch(() => {});
  }, []);

  const handleAddSuccess = () => {
    setShowAdd(false);
    fetchRestaurants();
  };

  const Header = () => (
    <View>
      <LinearGradient colors={['#f97316', '#fb923c']} style={styles.hero}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.heroEmoji}>🐾</Text>
        <Text style={styles.heroTitle}>带上毛孩子一起觅食</Text>
        <Text style={styles.heroSub}>发现最适合您和宠物的友好餐厅</Text>

        {stats && (
          <View style={styles.statsRow}>
            {[
              { v: stats.totalRestaurants, l: '家餐厅' },
              { v: stats.totalCities, l: '个城市' },
              { v: stats.totalReviews, l: '条评价' },
            ].map((s) => (
              <View key={s.l} style={styles.statItem}>
                <Text style={styles.statValue}>{s.v}</Text>
                <Text style={styles.statLabel}>{s.l}</Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索餐厅名称、菜系、地址..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* City filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        <FilterChip label="全部城市" active={!city} onPress={() => setCity('')} />
        {cities.map((c) => (
          <FilterChip key={c} label={c} active={city === c} onPress={() => setCity(city === c ? '' : c)} />
        ))}
      </ScrollView>

      {/* Price + sort filters */}
      <View style={styles.filterSection}>
        <View>
          <Text style={styles.filterTitle}>价格区间</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {PRICE_OPTIONS.map((p) => (
              <FilterChip key={p.value} label={p.label} active={priceRange === p.value} onPress={() => setPriceRange(p.value)} />
            ))}
          </ScrollView>
        </View>
        <View style={{ marginTop: 10 }}>
          <Text style={styles.filterTitle}>排序方式</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {SORT_OPTIONS.map((s) => (
              <FilterChip key={s.value} label={s.label} active={sort === s.value} onPress={() => setSort(s.value)} />
            ))}
            <FilterChip label="🍖宠物菜单" active={petMenu} onPress={() => setPetMenu(!petMenu)} />
          </ScrollView>
        </View>
      </View>

      {/* Count + add button */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>找到 {restaurants.length} 家餐厅</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addBtnText}>添加餐厅</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() => navigation.navigate('RestaurantDetail', { id: item.id })}
            />
          )}
          ListHeaderComponent={<Header />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>没有找到餐厅</Text>
              <Text style={styles.emptySub}>试试调整筛选条件</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchRestaurants(true)} tintColor="#f97316" />}
        />
      )}

      <AddRestaurantModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={handleAddSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#9ca3af', fontSize: 14 },
  hero: { padding: 24, paddingTop: 20, alignItems: 'center' },
  heroEmoji: { fontSize: 48, marginBottom: 8 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 24, marginTop: 16 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  filterRow: { marginTop: 14, marginBottom: 2 },
  filterSection: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', marginTop: 8 },
  filterTitle: { fontSize: 12, color: '#9ca3af', fontWeight: '600', marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: { backgroundColor: '#fff7ed', borderColor: '#f97316' },
  chipText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  chipTextActive: { color: '#f97316', fontWeight: '700' },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  countText: { fontSize: 13, color: '#6b7280' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f97316',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9ca3af' },
});
