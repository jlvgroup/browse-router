import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#71717a',
        tabBarStyle: { backgroundColor: '#0a0a0a', borderTopColor: '#27272a' },
        headerStyle: { backgroundColor: '#0a0a0a' },
        headerTintColor: '#fafafa',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⌂</Text>,
        }}
      />
      <Tabs.Screen
        name="rules"
        options={{
          title: 'Rules',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>≡</Text>,
        }}
      />
      <Tabs.Screen
        name="browsers"
        options={{
          title: 'Browsers',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>◉</Text>,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>↻</Text>,
        }}
      />
    </Tabs>
  );
}
