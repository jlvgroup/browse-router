import { View, Text, ScrollView, Pressable } from "../../src/components/native";
import { DEFAULT_BROWSERS, type Browser } from '@browse-router/shared';
import { useBrowsersStore } from '../../src/store/browsers';

export default function BrowsersScreen() {
  const defaultBrowser = useBrowsersStore((s) => s.defaultBrowser);
  const setDefaultBrowser = useBrowsersStore((s) => s.setDefaultBrowser);

  return (
    <ScrollView className="flex-1 bg-bg p-4">
      <Text className="text-fg font-semibold mb-2">Default browser</Text>
      <Text className="text-muted text-xs mb-4">
        Used when no handler matches. Tap to select.
      </Text>

      <View className="bg-zinc-900 rounded-2xl overflow-hidden mb-4">
        {DEFAULT_BROWSERS.map((browser: Browser, idx: number) => {
          const isDefault = browser.id === defaultBrowser;
          const isLast = idx === DEFAULT_BROWSERS.length - 1;
          return (
            <Pressable
              key={browser.id}
              onPress={() => setDefaultBrowser(browser.id)}
              className={`p-4 flex-row items-center ${
                isDefault ? 'bg-accent/20' : ''
              } ${!isLast ? 'border-b border-zinc-800' : ''}`}
            >
              <View className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center mr-3">
                <Text className="text-fg font-bold">
                  {browser.monogram ?? browser.name[0]}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-fg font-semibold">{browser.name}</Text>
                <Text className="text-muted text-xs">{browser.packageName}</Text>
              </View>
              {isDefault && <Text className="text-accent text-xs">DEFAULT</Text>}
            </Pressable>
          );
        })}
      </View>

      <Text className="text-muted text-xs">
        Note: only browsers installed on this device will actually receive
        routed URLs. The list above is the known catalog; the app currently
        uses the default package name regardless of install state.
      </Text>
    </ScrollView>
  );
}
