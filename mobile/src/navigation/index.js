import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import CommunityScreen from '../screens/CommunityScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ORANGE = '#f97316';
const GRAY = '#9ca3af';

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: ORANGE,
        tabBarInactiveTintColor: GRAY,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f3f4f6',
          paddingBottom: Platform.OS === 'ios' ? 20 : 6,
          paddingTop: 6,
          height: Platform.OS === 'ios' ? 82 : 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            首页: focused ? 'home' : 'home-outline',
            地图: focused ? 'map' : 'map-outline',
            社区: focused ? 'chatbubbles' : 'chatbubbles-outline',
            分析: focused ? 'bar-chart' : 'bar-chart-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="首页" component={HomeScreen} />
      <Tab.Screen name="地图" component={MapScreen} />
      <Tab.Screen name="社区" component={CommunityScreen} />
      <Tab.Screen name="分析" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={HomeTabs} />
        <Stack.Screen
          name="RestaurantDetail"
          component={RestaurantDetailScreen}
          options={{ headerShown: true, title: '餐厅详情', headerTintColor: ORANGE }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
