import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// Removed duplicate import of 'react-native-reanimated'. Should only be in App.js.


import React, { useState, createContext, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { View, Text, StyleSheet, useColorScheme, Platform } from 'react-native';
let storage: {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
} | null = null;
if (Platform.OS === 'web') {
  storage = {
    getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
    setItem: (key: string, value: string) => Promise.resolve(window.localStorage.setItem(key, value)),
  };
} else {
  try {
    storage = require('@react-native-async-storage/async-storage');
  } catch (e) {
    storage = {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
    };
  }
}
import { studentInfo } from '../screens/studentModel';
export const unstable_settings = {
  anchor: '(tabs)',
};

export const StageContext = createContext<[number, Dispatch<SetStateAction<number>>, number, Dispatch<SetStateAction<number>>]>([1, () => {}, 0, () => {}]);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [currentStage, setCurrentStage] = useState(1);
  const [completedLessons, setCompletedLessons] = useState(0);
  const totalLessons = 65; // Update with actual total lesson count

  // Load progress from storage
  useEffect(() => {
    if (storage) {
      storage.getItem('progress').then(data => {
        if (data) {
          const { stage, lessons } = JSON.parse(data);
          setCurrentStage(stage);
          setCompletedLessons(lessons);
        }
      });
    }
  }, []);

  // Save progress to storage
  useEffect(() => {
    if (storage) {
      storage.setItem('progress', JSON.stringify({ stage: currentStage, lessons: completedLessons }));
    }
  }, [currentStage, completedLessons]);

  // Simple header component
  const Header = () => (
    <View style={headerStyles.headerBox}>
      <Text style={headerStyles.headerName}>{studentInfo.name}</Text>
      <Text style={headerStyles.headerLicense}>License: {studentInfo.license}</Text>
      <Text style={headerStyles.headerStage}>Current Stage: {currentStage}</Text>
      {/* Progress Bar */}
      <View style={headerStyles.progressBarBg}>
        <View style={[headerStyles.progressBarFill, { width: `${Math.round((completedLessons / totalLessons) * 100)}%` }]} />
      </View>
      <Text style={headerStyles.progressText}>{Math.round((completedLessons / totalLessons) * 100)}% Complete</Text>
    </View>
  );

  return (
    <StageContext.Provider value={[currentStage, setCurrentStage, completedLessons, setCompletedLessons]}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Header />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </StageContext.Provider>
  );
}

const headerStyles = StyleSheet.create({
  headerBox: { padding: 16, backgroundColor: '#f0f0f0', borderBottomWidth: 1, borderColor: '#ddd' },
  headerName: { fontSize: 20, fontWeight: 'bold' },
  headerLicense: { fontSize: 16, marginTop: 4 },
  headerStage: { fontSize: 16, marginTop: 2 },
  progressBarBg: { height: 10, backgroundColor: '#ddd', borderRadius: 5, marginTop: 8, width: '100%' },
  progressBarFill: { height: 10, backgroundColor: '#4caf50', borderRadius: 5 },
  progressText: { fontSize: 14, marginTop: 4, color: '#555' },
});
