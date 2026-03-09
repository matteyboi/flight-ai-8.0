import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="lessons"
        options={{
          title: 'Lessons',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />, 
        }}
      />
      <Tabs.Screen
        name="stages"
        options={{
          title: 'Stages',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="flag.fill" color={color} />, 
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />, 
        }}
      />
      <Tabs.Screen
        name="procedures"
        options={{
          title: 'Procedures',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />, 
        }}
      />
      <Tabs.Screen
        name="profiles"
        options={{
          title: 'Profiles',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle.fill" color={color} />, 
        }}
      />
    </Tabs>
  );
}
