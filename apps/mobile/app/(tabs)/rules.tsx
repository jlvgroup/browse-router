import { View, Text, TextInput, Pressable, ScrollView } from "../../src/components/native";
import { Alert } from "react-native";
import { useState, useEffect } from 'react';
import { useRulesStore } from '../../src/store/rules';
import { evaluateConfigForHermes, HermesConfigError } from '../../src/bridge/hermes-config';
import { STARTER_CONFIG } from '@browse-router/shared';

export default function RulesScreen() {
  const stored = useRulesStore((s) => s.configSource);
  const setConfigSource = useRulesStore((s) => s.setConfigSource);
  const setConfig = useRulesStore((s) => s.setConfig);
  const lastError = useRulesStore((s) => s.lastError);
  const [text, setText] = useState(stored || STARTER_CONFIG);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (stored) setText(stored);
  }, [stored]);

  const validate = async () => {
    setValidating(true);
    try {
      const config = evaluateConfigForHermes(text);
      setConfig(config, null);
      setConfigSource(text);
      Alert.alert('Saved', `Config valid: ${config.handlers?.length ?? 0} handlers.`);
    } catch (err) {
      const msg =
        err instanceof HermesConfigError
          ? err.message
          : err instanceof Error
            ? err.message
            : String(err);
      setConfig(null, msg);
      Alert.alert('Validation failed', msg);
    } finally {
      setValidating(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-bg" keyboardShouldPersistTaps="handled">
      <View className="p-4">
        <Text className="text-fg font-semibold mb-2">Rules config</Text>
        <Text className="text-muted text-xs mb-3">
          Same shape as desktop Finicky v4. Hermes (Phase 1) supports literal
          values only — no function bodies. Phase 2 (Monaco) will add function
          support.
        </Text>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          className="bg-zinc-900 text-fg font-mono text-xs p-3 rounded-lg min-h-[400px]"
          textAlignVertical="top"
        />
        {lastError && (
          <View className="mt-3 bg-red-950 border border-red-800 rounded-lg p-3">
            <Text className="text-red-300 text-xs">{lastError}</Text>
          </View>
        )}
        <Pressable
          onPress={validate}
          disabled={validating}
          className={`mt-4 rounded-lg py-3 items-center ${
            validating ? 'bg-zinc-700' : 'bg-accent'
          }`}
        >
          <Text className="text-white font-semibold">
            {validating ? 'Validating…' : 'Validate & Save'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setText(STARTER_CONFIG)}
          className="mt-2 rounded-lg py-3 items-center"
        >
          <Text className="text-muted">Reset to starter</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
