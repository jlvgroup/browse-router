import { Linking, Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import type { BrowserId } from '@browse-router/shared';
import { appendLog } from '../store/log.js';

export interface LaunchResult {
  ok: boolean;
  error?: string;
}

/**
 * Forward a URL to a specific Android browser.
 *
 * Strategy:
 *  1. Try `expo-intent-launcher.startActivity` with an explicit VIEW intent
 *     targeted at the browser's package name. This is the cleanest path —
 *     Android resolves the intent without leaving our app.
 *  2. Fall back to `Linking.sendIntent` with `android.intent.action.VIEW`
 *     if the explicit intent is refused.
 *
 * NOTE: `expo-intent-launcher` must be installed. If not present we fall
 * back to `Linking.openURL` which routes through the system default.
 */
export async function launchInBrowser(
  url: string,
  packageName: BrowserId,
): Promise<LaunchResult> {
  if (Platform.OS !== 'android') {
    appendLog({ level: 'warn', message: 'launchInBrowser called on non-android', context: { platform: Platform.OS } });
    return { ok: false, error: 'Android only' };
  }

  appendLog({ level: 'info', message: 'launchInBrowser', context: { url, packageName } });

  try {
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      type: 'text/html',
      data: url,
      packageName: String(packageName),
      flags: 0x10000000, // FLAG_ACTIVITY_NEW_TASK
    });
    return { ok: true };
  } catch (err) {
    appendLog({
      level: 'warn',
      message: 'startActivityAsync failed, falling back',
      context: { url, packageName, error: err instanceof Error ? err.message : String(err) },
    });
  }

  // Fallback: let the system resolve.
  try {
    await Linking.openURL(url);
    return { ok: true };
  } catch (err) {
    appendLog({
      level: 'error',
      message: 'openURL fallback failed',
      context: { url, error: err instanceof Error ? err.message : String(err) },
    });
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Open the Android settings screen so the user can pick BrowseRouter as
 * the default browser. Each OEM has slightly different paths; we use
 * `Settings.ACTION_MANAGE_DEFAULT_APPS_SETTINGS` which exists on AOSP
 * and most OEMs.
 */
export async function openDefaultBrowserSettings(): Promise<LaunchResult> {
  if (Platform.OS !== 'android') {
    return { ok: false, error: 'Android only' };
  }
  try {
    await IntentLauncher.startActivityAsync(
      'android.settings.MANAGE_DEFAULT_APPS_SETTINGS',
    );
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
