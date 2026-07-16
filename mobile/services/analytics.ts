import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Retrieve values from Expo config extra variables or use sensible fallback
// Measurement Protocol URL: https://www.google-analytics.com/mp/collect?api_secret=API_SECRET&measurement_id=MEASUREMENT_ID
const MEASUREMENT_ID = Constants.expoConfig?.extra?.gaMeasurementId || 'G-XXXXXXXXXX';
const API_SECRET = Constants.expoConfig?.extra?.gaApiSecret || '';

const CLIENT_ID_KEY = 'analytics_client_id';
let cachedClientId: string | null = null;

// Helper to generate a basic UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Get or create client id
async function getClientId(): Promise<string> {
  if (cachedClientId) return cachedClientId;

  try {
    let id = await SecureStore.getItemAsync(CLIENT_ID_KEY);
    if (!id) {
      id = generateUUID();
      await SecureStore.setItemAsync(CLIENT_ID_KEY, id);
    }
    cachedClientId = id;
    return id;
  } catch (e) {
    // Return temporary session id if SecureStore fails
    const tempId = generateUUID();
    cachedClientId = tempId;
    return tempId;
  }
}

export const mobileAnalytics = {
  /**
   * Tracks a custom event using GA4 Measurement Protocol
   */
  async trackEvent(eventName: string, params: Record<string, any> = {}): Promise<void> {
    if (!MEASUREMENT_ID) {
      if (__DEV__) {
        console.log(`[Analytics] (Disabled) Event: ${eventName}`, params);
      }
      return;
    }

    try {
      const clientId = await getClientId();
      const url = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}${API_SECRET ? `&api_secret=${API_SECRET}` : ''}`;

      const payload = {
        client_id: clientId,
        events: [
          {
            name: eventName,
            params: {
              ...params,
              engagement_time_msec: '100', // Standard field
              session_id: clientId, // Use clientId as simple session identifier
            },
          },
        ],
      };

      if (__DEV__) {
        console.log(`[Analytics] Sending: ${eventName}`, payload);
      }

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      if (__DEV__) {
        console.error('[Analytics] Failed to track event', error);
      }
    }
  },

  /**
   * Tracks a screen view event
   */
  async trackScreenView(screenName: string): Promise<void> {
    await this.trackEvent('screen_view', {
      firebase_screen: screenName,
      firebase_screen_class: screenName,
    });
  },
};
