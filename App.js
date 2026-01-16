import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ActivitiesScreen from './screens/ActivitiesScreen';

// ----- CONFIG: 書き換えてください -----
const SITE = 'https://storied-donut-fd8311.netlify.app'; // あなたの Netlify site
const DEFAULT_USER_ID = '34646703'; // 置き換え：テストしたい athlete.id
// --------------------------------------

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Activities"
            options={{ title: 'Activities' }}
          >
            {props => <ActivitiesScreen {...props} site={SITE} userId={DEFAULT_USER_ID} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
