import { View, Text, ScrollView, Pressable } from "../../src/components/native";
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useRulesStore } from '../../src/store/rules';
import { useBrowsersStore } from '../../src/store/browsers';
import { usePosture } from '../../src/foldable/use-posture';
import { STARTER_CONFIG, DEFAULT_BROWSERS } from '@browse-router/shared';

export default function HomeScreen() {
  const router = useRouter();
  const posture = usePosture();
  const configSource = useRulesStore((s) => s.configSource);
  const config = useRulesStore((s) => s.config);
  const lastError = useRulesStore((s) => s.lastError);
  const setConfig = useRulesStore((s) => s.setConfig);
  const setConfigSource = useRulesStore((s) => s.setConfigSource);
  const history = useBrowsersStore((s) => s.history);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // First-run: seed starter config if nothing stored
    if (!configSource) {
      setConfigSource(STARTER_CONFIG);
    }
  }, [configSource, setConfigSource]);

  const isUnfolded = posture.posture === 'expanded';

  return (
    <ScrollView className="flex-1 bg-bg px-4 py-6">
      <Text className="text-3xl font-bold text-fg mb-1">BrowseRouter</Text>
      <Text className="text-sm text-muted mb-6">
        Posture: {posture.posture} · {posture.width}×{posture.height}
      </Text>

      <View className="bg-zinc-900 rounded-2xl p-4 mb-4">
        <Text className="text-fg font-semibold mb-2">Default browser</Text>
        <Text className="text-muted text-sm mb-3">
          {config?.defaultBrowser ?? 'not set'}
        </Text>
        <Pressable
          onPress={() => router.push('/setup')}
          className="bg-accent rounded-lg py-3 items-center"
        >
          <Text className="text-white font-semibold">Setup as default</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => setExpanded((e) => !e)}
        className="bg-zinc-900 rounded-2xl p-4 mb-4"
      >
        <Text className="text-fg font-semibold mb-1">
          {expanded ? '▼' : '▶'} Config status
        </Text>
        {expanded && (
          <View className="mt-2">
            <Text className="text-muted text-sm">
              {config ? '✓ Loaded' : '✗ Not loaded'}
              {lastError ? ` · error: ${lastError}` : ''}
            </Text>
            <Text className="text-muted text-sm mt-2">
              {config?.handlers?.length ?? 0} handlers ·{' '}
              {config?.rewrite?.length ?? 0} rewrite rules
            </Text>
          </View>
        )}
      </Pressable>

      {isUnfolded ? (
        <View className="flex-row gap-4">
          <View className="flex-1 bg-zinc-900 rounded-2xl p-4">
            <Text className="text-fg font-semibold mb-3">Quick actions</Text>
            <Link href="/rules" asChild>
              <Pressable className="bg-zinc-800 rounded-lg py-3 items-center mb-2">
                <Text className="text-fg">Edit rules</Text>
              </Pressable>
            </Link>
            <Link href="/browsers" asChild>
              <Pressable className="bg-zinc-800 rounded-lg py-3 items-center mb-2">
                <Text className="text-fg">Manage browsers</Text>
              </Pressable>
            </Link>
            <Link href="/history" asChild>
              <Pressable className="bg-zinc-800 rounded-lg py-3 items-center">
                <Text className="text-fg">View history</Text>
              </Pressable>
            </Link>
          </View>
          <View className="flex-1 bg-zinc-900 rounded-2xl p-4">
            <Text className="text-fg font-semibold mb-2">Recent</Text>
            {history.length === 0 ? (
              <Text className="text-muted text-sm">No URLs yet</Text>
            ) : (
              history.slice(0, 5).map((h, i) => (
                <Text key={i} className="text-muted text-xs mb-1" numberOfLines={1}>
                  {h.rewritten} → {h.browser}
                </Text>
              ))
            )}
          </View>
        </View>
      ) : (
        <>
          <Link href="/rules" asChild>
            <Pressable className="bg-zinc-900 rounded-2xl p-4 mb-3">
              <Text className="text-fg font-semibold">Edit rules →</Text>
            </Pressable>
          </Link>
          <Link href="/browsers" asChild>
            <Pressable className="bg-zinc-900 rounded-2xl p-4 mb-3">
              <Text className="text-fg font-semibold">Manage browsers →</Text>
            </Pressable>
          </Link>
          <Link href="/history" asChild>
            <Pressable className="bg-zinc-900 rounded-2xl p-4 mb-3">
              <Text className="text-fg font-semibold">View history →</Text>
            </Pressable>
          </Link>
        </>
      )}

      <Text className="text-muted text-xs mt-6 text-center">
        {DEFAULT_BROWSERS.length} known browsers · v0.0.1
      </Text>
    </ScrollView>
  );
}
