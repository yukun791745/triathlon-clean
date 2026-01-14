import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomNav from '../src/rn_components/ui/BottomNav';
import HomeScreen from '../src/screens/HomeScreen';

const Tab = createBottomTabNavigator();

function Fallback() {
  return (
    <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
      <Text>Fallback</Text>
    </View>
  );
}

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <BottomNav {...props} />}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Training" component={Fallback} />
        <Tab.Screen name="Activities" component={Fallback} />
        <Tab.Screen name="Settings" component={Fallback} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
