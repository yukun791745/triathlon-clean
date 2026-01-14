import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Triathlon AI Coach</Text>
      <Text style={styles.note}>Welcome — this is a clean starter Home.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex:1, alignItems:'center', justifyContent:'center', padding:20 },
  title: { fontSize:20, fontWeight:'700', marginBottom:8 },
  note: { color:'#6B7280' },
});
