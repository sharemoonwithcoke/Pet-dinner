import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export function StarDisplay({ value, size = 14, color = '#facc15' }) {
  const filled = Math.round(value || 0);
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: size, color: i <= filled ? color : '#e5e7eb' }}>
          ★
        </Text>
      ))}
    </View>
  );
}

export function StarPicker({ value, onChange, size = 32 }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => onChange(i)}>
          <Text style={{ fontSize: size, color: i <= value ? '#facc15' : '#e5e7eb' }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
