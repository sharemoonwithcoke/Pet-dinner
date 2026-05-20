import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  Dimensions, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { analyticsAPI } from '../api/client';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - 48;

const CHART_CONFIG = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
  labelColor: () => '#6b7280',
  style: { borderRadius: 12 },
  propsForDotProps: { r: 5, stroke: '#f97316', fill: '#fff' },
};

const COLORS = ['#f97316', '#fb923c', '#fcd34d', '#86efac', '#93c5fd', '#c4b5fd'];
const PRICE_MAP = { 1: '¥经济', 2: '¥¥适中', 3: '¥¥¥较贵', 4: '¥¥¥¥高档' };

function StatCard({ icon, value, label, color = '#f97316' }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export default function AnalyticsScreen() {
  const [overview, setOverview] = useState(null);
  const [byCity, setByCity] = useState([]);
  const [byCuisine, setByCuisine] = useState([]);
  const [byPrice, setByPrice] = useState([]);
  const [ratingDist, setRatingDist] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [o, c, cu, p, r, t, i] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getByCity(),
        analyticsAPI.getByCuisine(),
        analyticsAPI.getByPrice(),
        analyticsAPI.getRatingDist(),
        analyticsAPI.getTopRestaurants(),
        analyticsAPI.getInsights(),
      ]);
      setOverview(o);
      setByCity(c);
      setByCuisine(cu);
      setByPrice(p);
      setRatingDist(r);
      setTopRestaurants(t);
      setInsights(i);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>数据分析加载中...</Text>
      </View>
    );
  }

  const cityChartData = {
    labels: byCity.slice(0, 6).map((c) => c.city),
    datasets: [{ data: byCity.slice(0, 6).map((c) => c.restaurant_count) }],
  };

  const cuisinePieData = byCuisine.map((c, i) => ({
    name: c.cuisine,
    count: c.count,
    color: COLORS[i % COLORS.length],
    legendFontColor: '#6b7280',
    legendFontSize: 12,
  }));

  const priceChartData = byPrice.length > 0 ? {
    labels: byPrice.map((p) => PRICE_MAP[p.price_range] || `¥${p.price_range}`),
    datasets: [{ data: byPrice.map((p) => p.avg_rating || 0) }],
  } : null;

  const totalReviews = ratingDist.reduce((s, r) => s + r.count, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#f97316" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📊 数据分析仪表盘</Text>
          <Text style={styles.headerSub}>宠物友好餐厅市场洞察</Text>
        </View>

        {/* Overview stats */}
        {overview && (
          <View style={styles.statsGrid}>
            <StatCard icon="🏪" value={overview.totalRestaurants} label="餐厅总数" />
            <StatCard icon="🌆" value={overview.totalCities} label="覆盖城市" color="#3b82f6" />
            <StatCard icon="💬" value={overview.totalReviews} label="用户评价" color="#8b5cf6" />
            <StatCard icon="⭐" value={overview.avgRating} label="平均评分" color="#f59e0b" />
          </View>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="💡 市场洞察与建议" />
            {insights.map((ins, i) => (
              <View key={i} style={styles.insightCard}>
                <Text style={styles.insightIcon}>{ins.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.insightTitle}>{ins.title}</Text>
                  <Text style={styles.insightContent}>{ins.content}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* City bar chart */}
        {cityChartData.labels.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="各城市餐厅数量" />
            <BarChart
              data={cityChartData}
              width={CHART_W}
              height={200}
              chartConfig={CHART_CONFIG}
              style={styles.chart}
              showValuesOnTopOfBars
              fromZero
            />
          </View>
        )}

        {/* Cuisine pie chart */}
        {cuisinePieData.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="菜系类型分布" />
            <PieChart
              data={cuisinePieData}
              width={CHART_W}
              height={180}
              chartConfig={CHART_CONFIG}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="10"
              absolute
            />
          </View>
        )}

        {/* Price vs rating */}
        {priceChartData && (
          <View style={styles.section}>
            <SectionTitle title="价格区间平均评分" />
            <BarChart
              data={priceChartData}
              width={CHART_W}
              height={200}
              chartConfig={{ ...CHART_CONFIG, color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})` }}
              style={styles.chart}
              showValuesOnTopOfBars
              fromZero
              yAxisSuffix="分"
            />
          </View>
        )}

        {/* Rating distribution */}
        {ratingDist.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="评分分布" />
            {[5, 4, 3, 2, 1].map((star) => {
              const entry = ratingDist.find((r) => r.rating === star);
              const count = entry?.count || 0;
              const pct = totalReviews > 0 ? count / totalReviews : 0;
              return (
                <View key={star} style={styles.ratingRow}>
                  <Text style={styles.starLabel}>{star}星</Text>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${Math.round(pct * 100)}%` }]} />
                  </View>
                  <Text style={styles.ratingCount}>{count}条</Text>
                  <Text style={styles.ratingPct}>{Math.round(pct * 100)}%</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Top restaurants */}
        {topRestaurants.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="🏆 宠物友好餐厅排行" />
            {topRestaurants.map((r, i) => (
              <View key={r.id} style={styles.rankRow}>
                <View style={[
                  styles.rankBadge,
                  i === 0 && { backgroundColor: '#fef9c3' },
                  i === 1 && { backgroundColor: '#f3f4f6' },
                  i === 2 && { backgroundColor: '#fff7ed' },
                ]}>
                  <Text style={styles.rankNum}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rankName}>{r.name}</Text>
                  <Text style={styles.rankInfo}>{r.city} · {r.cuisine}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.rankRating}>⭐ {r.avg_rating}</Text>
                  <Text style={styles.rankPetRating}>🐾 {r.avg_pet_rating}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Facility coverage */}
        {overview?.facilityCoverage && (
          <View style={styles.section}>
            <SectionTitle title="设施覆盖率" />
            <View style={styles.facilityGrid}>
              {[
                { label: '宠物水碗', pct: overview.facilityCoverage.bowls_pct },
                { label: '宠物座椅', pct: overview.facilityCoverage.seats_pct },
                { label: '宠物菜单', pct: overview.facilityCoverage.menu_pct },
                { label: '宠物玩具', pct: overview.facilityCoverage.toys_pct },
                { label: '宠物停车', pct: overview.facilityCoverage.parking_pct },
              ].map((f) => (
                <View key={f.label} style={styles.facilityItem}>
                  <Text style={styles.facilityPct}>{f.pct}%</Text>
                  <View style={styles.facilityBarBg}>
                    <View style={[styles.facilityBarFill, { height: `${f.pct}%` }]} />
                  </View>
                  <Text style={styles.facilityLabel}>{f.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#9ca3af', fontSize: 14 },
  header: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  headerSub: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 12 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 26, fontWeight: '800', color: '#f97316' },
  statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 3 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 14 },
  chart: { borderRadius: 12, marginLeft: -10 },
  insightCard: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
  insightIcon: { fontSize: 22 },
  insightTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  insightContent: { fontSize: 13, color: '#374151', lineHeight: 19 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  starLabel: { fontSize: 13, color: '#374151', width: 28 },
  barBg: { flex: 1, height: 10, backgroundColor: '#f3f4f6', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#fbbf24', borderRadius: 5 },
  ratingCount: { fontSize: 11, color: '#9ca3af', width: 32, textAlign: 'right' },
  ratingPct: { fontSize: 11, color: '#9ca3af', width: 30, textAlign: 'right' },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  rankBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  rankNum: { fontSize: 14, fontWeight: '800', color: '#374151' },
  rankName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  rankInfo: { fontSize: 12, color: '#9ca3af', marginTop: 1 },
  rankRating: { fontSize: 13, color: '#f59e0b', fontWeight: '700' },
  rankPetRating: { fontSize: 11, color: '#7c3aed', marginTop: 2 },
  facilityGrid: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120 },
  facilityItem: { alignItems: 'center', gap: 6, flex: 1 },
  facilityPct: { fontSize: 13, fontWeight: '800', color: '#f97316' },
  facilityBarBg: { width: 24, flex: 1, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  facilityBarFill: { backgroundColor: '#f97316', borderRadius: 4, width: '100%' },
  facilityLabel: { fontSize: 10, color: '#9ca3af', textAlign: 'center' },
});
