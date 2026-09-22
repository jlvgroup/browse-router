import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import '../global.css';
import { subscribeNative, onIntent, dispatchIntent } from '../src/bridge/intent-receiver';
import { appendLog } from '../src/store/log';

function useIntentPipeline(): void {
  useEffect(() => {
    const unsubNative = subscribeNative();

    // expo-router surfaces incoming URLs via Linking — subscribe too.
    const sub = Linking.addEventListener('url', ({ url }) => {
      void dispatchIntent({ url, source: 'view' });
    });

    // Cold-start: check if the app was launched from a URL.
    Linking.getInitialURL().then((url) => {
      if (url) {
        void dispatchIntent({ url, source: 'view' });
      }
    }).catch(() => undefined);

    // Wire intent → log (Phase 1: log only; engine + chooser wiring is
    // follow-up work for Phase 2 once intent-receiver native module emits
    // through DeviceEventEmitter in real builds).
    const unsubHandler = onIntent(async (payload) => {
      appendLog({
        level: 'info',
        message: 'Intent received',
        context: { url: payload.url, source: payload.source },
      });
    });

    return () => {
      unsubNative();
      sub.remove();
      unsubHandler();
    };
  }, []);
}

export default function RootLayout() {
  useIntentPipeline();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="setup" options={{ headerShown: true, title: 'Setup' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
