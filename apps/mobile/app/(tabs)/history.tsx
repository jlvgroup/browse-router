import { View, Text, ScrollView, Pressable } from "../../src/components/native";
import { useBrowsersStore } from '../../src/store/browsers';

export default function HistoryScreen() {
  const history = useBrowsersStore((s) => s.history);
  const clearHistory = useBrowsersStore((s) => s.clearHistory);

  return (
    <View className="flex-1 bg-bg">
      <ScrollView className="flex-1 p-4">
        <Text className="text-fg font-semibold mb-2">Recent URL decisions</Text>
        <Text className="text-muted text-xs mb-4">
          Last {history.length} of 50 most-recent.
        </Text>
        {history.length === 0 ? (
          <Text className="text-muted text-sm">No URLs routed yet.</Text>
        ) : (
          history.map((h, i) => (
            <View
              key={`${h.timestamp}-${i}`}
              className="bg-zinc-900 rounded-lg p-3 mb-2"
            >
              <Text className="text-fg text-xs" numberOfLines={2}>
                {h.rewritten}
              </Text>
              <View className="flex-row justify-between mt-2">
                <Text className="text-muted text-xs">→ {h.browser}</Text>
                <Text className="text-muted text-xs">
                  {new Date(h.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              {h.url !== h.rewritten && (
                <Text className="text-muted text-xs mt-1" numberOfLines={1}>
                  from {h.url}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
      {history.length > 0 && (
        <Pressable
          onPress={clearHistory}
          className="bg-zinc-800 mx-4 mb-4 rounded-lg py-3 items-center"
        >
          <Text className="text-muted">Clear history</Text>
        </Pressable>
      )}
    </View>
  );
}
