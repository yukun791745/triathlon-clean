import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BottomNav(props: any) {
  const { state, descriptors, navigation } = props ?? {};
  if (!state || !Array.isArray(state.routes)) return <View style={styles.nav} />;

  const ICON_MAP: Record<string, string> = {
    home: 'home',
    training: 'dumbbell',
    activities: 'run',
    settings: 'cog',
  };

  const LABEL_MAP: Record<string, string> = {
    home: 'ホーム',
    training: 'トレーニング',
    activities: 'アクティビティ',
    settings: '設定',
  };

  return (
    <View style={styles.nav}>
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        const nameKey = (route.name ?? '').toString().toLowerCase();
        const label = LABEL_MAP[nameKey] ?? route.name;
        const iconName = ICON_MAP[nameKey] ?? 'circle';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.item}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrap, focused ? styles.iconWrapActive : null]}>
              <MaterialCommunityIcons
                name={iconName as any}
                size={focused ? 26 : 22}
                color={focused ? '#5B21B6' : '#6B7280'}
              />
            </View>
            <Text style={[styles.label, focused ? styles.labelActive : null]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    height: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 18 : 10,
    paddingTop: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 0.5,
    borderTopColor: '#E6E9F2',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { height: -4, width: 0 },
      },
      android: { elevation: 8 },
    }),
  },
  item: { flex: 1, alignItems: 'center' },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconWrapActive: { backgroundColor: '#EEF2FF' },
  label: { fontSize: 11, color: '#6B7280' },
  labelActive: { color: '#0F172A', fontWeight: '600' },
});
