import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { restaurantAPI } from '../api/client';

const PRICE = { 1: '¥', 2: '¥¥', 3: '¥¥¥', 4: '¥¥¥¥' };

// City center coordinates for quick navigation
const CITY_CENTERS = {
  上海: { latitude: 31.2304, longitude: 121.4737, latitudeDelta: 0.2, longitudeDelta: 0.2 },
  北京: { latitude: 39.9042, longitude: 116.4074, latitudeDelta: 0.2, longitudeDelta: 0.2 },
  成都: { latitude: 30.6573, longitude: 104.0657, latitudeDelta: 0.15, longitudeDelta: 0.15 },
  广州: { latitude: 23.1291, longitude: 113.2644, latitudeDelta: 0.15, longitudeDelta: 0.15 },
  深圳: { latitude: 22.5371, longitude: 113.9346, latitudeDelta: 0.15, longitudeDelta: 0.15 },
  杭州: { latitude: 30.2741, longitude: 120.1551, latitudeDelta: 0.15, longitudeDelta: 0.15 },
};

export default function MapScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const params = selectedCity ? { city: selectedCity } : {};
    restaurantAPI.getAll(params)
      .then(setRestaurants)
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, [selectedCity]);

  const jumpToCity = (city) => {
    setSelectedCity(city === selectedCity ? '' : city);
    const region = CITY_CENTERS[city];
    if (region && mapRef.current) {
      mapRef.current.animateToRegion(region, 500);
    }
  };

  const focusRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 400);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ 地图探索</Text>
        <Text style={styles.headerCount}>{restaurants.length} 家餐厅</Text>
      </View>

      {/* City filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.cityBar}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
      >
        {Object.keys(CITY_CENTERS).map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.cityChip, selectedCity === c && styles.cityChipActive]}
            onPress={() => jumpToCity(c)}
          >
            <Text style={[styles.cityChipText, selectedCity === c && styles.cityChipTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingMap}>
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={Platform.OS === 'android' ? 'google' : PROVIDER_DEFAULT}
            initialRegion={{
              latitude: 32.0,
              longitude: 114.0,
              latitudeDelta: 15,
              longitudeDelta: 15,
            }}
          >
            {restaurants.map((r) => (
              <Marker
                key={r.id}
                coordinate={{ latitude: r.latitude, longitude: r.longitude }}
                onPress={() => setSelectedRestaurant(r)}
              >
                <View style={[
                  styles.markerContainer,
                  selectedRestaurant?.id === r.id && styles.markerContainerSelected,
                ]}>
                  <Text style={styles.markerEmoji}>🐾</Text>
                </View>
                <Callout onPress={() => navigation.navigate('RestaurantDetail', { id: r.id })}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutName}>{r.name}</Text>
                    <Text style={styles.calloutInfo}>{r.cuisine} · {PRICE[r.price_range]}</Text>
                    {r.avg_rating && (
                      <Text style={styles.calloutRating}>⭐ {r.avg_rating} · 🐾 {r.avg_pet_rating}</Text>
                    )}
                    <Text style={styles.calloutLink}>点击查看详情 →</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        )}
      </View>

      {/* Bottom list */}
      <View style={styles.bottomList}>
        <Text style={styles.bottomListTitle}>附近餐厅</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 16 }}>
          {restaurants.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.miniCard, selectedRestaurant?.id === r.id && styles.miniCardSelected]}
              onPress={() => focusRestaurant(r)}
            >
              <Text style={styles.miniCardName} numberOfLines={1}>{r.name}</Text>
              <Text style={styles.miniCardInfo}>{r.city} · {r.cuisine}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={styles.miniCardPrice}>{PRICE[r.price_range]}</Text>
                {r.avg_rating && (
                  <Text style={styles.miniCardRating}>⭐ {r.avg_rating}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.miniCardBtn}
                onPress={() => navigation.navigate('RestaurantDetail', { id: r.id })}
              >
                <Text style={styles.miniCardBtnText}>查看详情</Text>
                <Ionicons name="chevron-forward" size={11} color="#f97316" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  headerCount: { fontSize: 13, color: '#9ca3af' },
  cityBar: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cityChipActive: { backgroundColor: '#fff7ed', borderColor: '#f97316' },
  cityChipText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  cityChipTextActive: { color: '#f97316', fontWeight: '700' },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  loadingMap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  markerContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: '#f97316',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  markerContainerSelected: {
    backgroundColor: '#fff7ed',
    borderColor: '#c2410c',
    transform: [{ scale: 1.2 }],
  },
  markerEmoji: { fontSize: 18 },
  callout: { padding: 8, minWidth: 160 },
  calloutName: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 3 },
  calloutInfo: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  calloutRating: { fontSize: 12, color: '#f59e0b', marginBottom: 4 },
  calloutLink: { fontSize: 12, color: '#f97316', fontWeight: '600' },
  bottomList: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    maxHeight: 170,
  },
  bottomListTitle: { fontSize: 13, fontWeight: '700', color: '#374151', paddingHorizontal: 16, marginBottom: 10 },
  miniCard: {
    width: 150,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginLeft: 16,
  },
  miniCardSelected: { borderColor: '#f97316', backgroundColor: '#fff7ed' },
  miniCardName: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 },
  miniCardInfo: { fontSize: 11, color: '#9ca3af' },
  miniCardPrice: { fontSize: 13, fontWeight: '700', color: '#f97316' },
  miniCardRating: { fontSize: 11, color: '#6b7280' },
  miniCardBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 6, gap: 2 },
  miniCardBtnText: { fontSize: 11, color: '#f97316', fontWeight: '600' },
});
