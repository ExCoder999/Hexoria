import 'react-native-gesture-handler';
import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from '@/navigation/RootNavigator';
import { Colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = React.useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, assets, warm stores here
        await Promise.all([]);
      } catch (e) {
        console.warn('App preparation error:', e);
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <View style={styles.root} onLayout={onLayoutRootView}>
          <StatusBar style="light" backgroundColor={Colors.bg.base} />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg.base,
  },
});
