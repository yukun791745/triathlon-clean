import React, { useCallback } from 'react';
import { View, Text, ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchActivities } from '../api/getActivities';
import ActivityItem from '../components/ActivityItem';

export default function ActivitiesScreen({ route, navigation, site, userId }) {
  // Props override (if passed via navigation)
  const siteDomain = (route?.params?.site) || site;
  const user = (route?.params?.userId) || userId;

  const {
    data: activities,
    error,
    isFetching,
    isLoading,
    refetch,
  } = useQuery(['activities', siteDomain, user], () => fetchActivities(siteDomain, user, 30), {
    staleTime: 1000 * 30,
    retry: 1,
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>データ取得エラー: {String(error.message)}</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text>再試行</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const list = activities || [];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={list}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text>アクティビティが見つかりません</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ActivityItem
            item={item}
            onPress={() => navigation.navigate('ActivityDetail', { activity: item })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: 'red', marginBottom: 12 },
  retryButton: { padding: 8, backgroundColor: '#eee', borderRadius: 6 }
});
