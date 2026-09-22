import { View, Text, ScrollView, Pressable } from "../src/components/native";
import { openDefaultBrowserSettings } from '../src/bridge/chooser';
import { Platform, NativeModules } from "react-native";

function detectManufacturer(): "vivo" | "samsung" | "generic" {
  if (Platform.OS !== "android") return "generic";
  // RN removed Platform.Brand; manufacturer is sometimes exposed via
  // NativeModules.PlatformConstants.MANUFACTURER. Fallback to generic.
  try {
    const constants = (NativeModules as unknown as Record<string, { MANUFACTURER?: string } | undefined>)
      .PlatformConstants;
    const m = (constants?.MANUFACTURER ?? "").toLowerCase();
    if (m.includes("vivo")) return "vivo";
    if (m.includes("samsung")) return "samsung";
  } catch {
    /* ignore */
  }
  return "generic";
}

export default function SetupScreen() {
  const isAndroid = Platform.OS === 'android';
  const mfg = detectManufacturer();
  const isVivo = mfg === "vivo";
  const isSamsung = mfg === "samsung";

  const openSettings = async () => {
    const r = await openDefaultBrowserSettings();
    if (!r.ok) {
      // Surface a non-blocking hint — user can navigate manually.
    }
  };

  return (
    <ScrollView className="flex-1 bg-bg p-4">
      <Text className="text-fg text-2xl font-bold mb-2">Set as default</Text>
      <Text className="text-muted text-sm mb-6">
        BrowseRouter needs to be your default browser to intercept links from
        other apps. Tap below to open the relevant settings screen.
      </Text>

      {!isAndroid && (
        <View className="bg-amber-950 border border-amber-800 rounded-lg p-3 mb-4">
          <Text className="text-amber-200 text-sm">
            This MVP is Android-only. iOS support is planned but not built yet.
          </Text>
        </View>
      )}

      <Pressable
        onPress={openSettings}
        disabled={!isAndroid}
        className="bg-accent rounded-lg py-3 items-center mb-6"
      >
        <Text className="text-white font-semibold">Open settings</Text>
      </Pressable>

      {isVivo && (
        <View className="bg-zinc-900 rounded-2xl p-4 mb-4">
          <Text className="text-fg font-semibold mb-2">VIVO X Fold 5</Text>
          <Text className="text-muted text-sm mb-1">
            1. Settings → Apps → Default apps
          </Text>
          <Text className="text-muted text-sm mb-1">2. Tap "Browser"</Text>
          <Text className="text-muted text-sm mb-1">
            3. Choose "BrowseRouter"
          </Text>
          <Text className="text-muted text-sm">
            4. If not listed, tap the menu (⋮) → Show system apps.
          </Text>
        </View>
      )}

      {isSamsung && (
        <View className="bg-zinc-900 rounded-2xl p-4 mb-4">
          <Text className="text-fg font-semibold mb-2">Samsung Flip 7</Text>
          <Text className="text-muted text-sm mb-1">
            1. Settings → Apps → Choose default apps
          </Text>
          <Text className="text-muted text-sm mb-1">2. Tap "Browser app"</Text>
          <Text className="text-muted text-sm mb-1">
            3. Choose "BrowseRouter"
          </Text>
          <Text className="text-muted text-sm">
            4. Cover-screen path: same — settings persist across postures.
          </Text>
        </View>
      )}

      {!isVivo && !isSamsung && isAndroid && (
        <View className="bg-zinc-900 rounded-2xl p-4 mb-4">
          <Text className="text-fg font-semibold mb-2">Generic Android</Text>
          <Text className="text-muted text-sm">
            Settings → Apps → Default apps → Browser app → BrowseRouter.
            Path varies slightly by OEM (Pixel / OnePlus / Xiaomi all differ).
          </Text>
        </View>
      )}

      <View className="bg-zinc-900 rounded-2xl p-4">
        <Text className="text-fg font-semibold mb-2">Share target</Text>
        <Text className="text-muted text-sm">
          BrowseRouter also accepts shared text from any app via the system
          share sheet. No setup needed — it appears automatically once
          installed.
        </Text>
      </View>
    </ScrollView>
  );
}
