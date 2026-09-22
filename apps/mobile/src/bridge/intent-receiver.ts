import { DeviceEventEmitter, type EmitterSubscription } from 'react-native';

export interface IntentPayload {
  url: string;
  source: 'view' | 'send';
  textBody?: string;
}

/**
 * Cross-platform intent receiver.
 *
 * On Android, `expo-router` already routes incoming URLs to the app via its
 * built-in deep-link handler (declared via the `scheme` in app.json). For
 * the share-target (ACTION_SEND text/plain) path we add a small native module
 * that emits a JS event — see apps/mobile/plugins/intent-receiver/ in Phase 1.
 *
 * This module is the JS-side listener. It deduplicates events and surfaces
 * them as a typed payload to the rest of the app.
 */
export type IntentHandler = (payload: IntentPayload) => void | Promise<void>;

const handlers = new Set<IntentHandler>();
let lastUrl: string | null = null;
let lastTs = 0;

export function onIntent(handler: IntentHandler): () => void {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

export async function dispatchIntent(payload: IntentPayload): Promise<void> {
  // Dedupe within 500ms (Android sometimes fires twice on cold start)
  const now = Date.now();
  if (payload.url === lastUrl && now - lastTs < 500) {
    return;
  }
  lastUrl = payload.url;
  lastTs = now;
  for (const h of handlers) {
    try {
      await h(payload);
    } catch (err) {
      // Don't let one handler break others.
      console.warn('[intent-receiver] handler threw:', err);
    }
  }
}

/**
 * Subscribe to DeviceEventEmitter events emitted by the native module.
 * Returns an unsubscribe function.
 */
export function subscribeNative(): () => void {
  const sub: EmitterSubscription = DeviceEventEmitter.addListener(
    'BrowseRouterIntent',
    (raw: unknown) => {
      if (typeof raw === 'object' && raw !== null && 'url' in raw && typeof (raw as { url: unknown }).url === 'string') {
        const r = raw as { url: string; source?: 'view' | 'send'; textBody?: string };
        void dispatchIntent({
          url: r.url,
          source: r.source ?? 'view',
          textBody: r.textBody,
        });
      }
    },
  );
  return () => sub.remove();
}
