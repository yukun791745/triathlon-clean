import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function ActivityItem({ item, onPress }) {
  const distanceKm = item.distance ? (item.distance / 1000).toFixed(2) : null;
  const movingTime = item.moving_time ? `${Math.floor(item.moving_time / 60)}m` : null;
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.name || item.type}</Text>
        <Text style={styles.meta}>
          {formatDate(item.start_date_local)} {distanceKm ? ` • ${distanceKm} km` : ''} {movingTime ? ` • ${movingTime}` : ''} {item.type ? ` • ${item.type}` : ''}
        </Text>
      </View>
      <Text style={styles.chev}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#666', marginTop: 4 },
  chev: { fontSize: 22, color: '#ccc', paddingLeft: 8 }
});
