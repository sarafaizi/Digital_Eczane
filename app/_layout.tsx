import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Colors from '@/constants/Colors';
import { AuthProvider } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const RootLayoutNav: React.FC = () => {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('med-channel', {
        name: 'Medication Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  }, []);

  if (!loaded) return null;

  return (
    <NotificationProvider>
      <ThemeProvider>
        <AuthProvider>

          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="time" options={{ headerShown: false }} />
          </Stack>

        </AuthProvider>
      </ThemeProvider>
    </NotificationProvider>
  );
};


export default RootLayoutNav;


/*
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Slot, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayoutNav() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
    if (error) throw error;
  }, [loaded, error]);

  
  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('med-channel', {
        name: 'Medication Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  }, []);


  if (!loaded) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <InnerNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

function InnerNavigator() {
  const router = useRouter();
  const { user, loading } = useAuth();


  useEffect(() => {
    if (!loading && !user) {
      router.replace('/'); // videolu ana sayfanızın yolu
    }
  }, [loading, user]);

  return <Slot />; // Slot, (tabs) içindeki navigator'unuz olacak
}*/