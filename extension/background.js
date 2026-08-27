// EasyNaukri Harvester Background Service Worker

const BACKEND_URLS = ['http://127.0.0.1:8060', 'http://localhost:8060'];

async function postToBackend(endpoint, payload) {
  let lastError = null;
  for (const baseUrl of BACKEND_URLS) {
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return res;
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Failed to connect to backend endpoints');
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('⚡ EasyNaukri Harvester Extension active.');
  chrome.alarms.create('drain_sync_queue', { periodInMinutes: 0.5 });
});

// Alarm Listener (persists across MV3 service worker sleeps)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'drain_sync_queue') {
    processPendingQueue();
  }
});

// Storage Change Listener (wakes up worker instantly when content script adds to queue)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.pending_sync_queue) {
    processPendingQueue();
  }
});

// Process pending items from chrome.storage.local queue
async function processPendingQueue() {
  try {
    const data = await chrome.storage.local.get(['pending_sync_queue']);
    const queue = data.pending_sync_queue || [];
    if (queue.length === 0) return;

    console.log(`⚡ Draining ${queue.length} pending items from storage queue...`);
    const remaining = [];

    for (const entry of queue) {
      try {
        const res = await postToBackend('/api/v1/jobs/scraper/client-sync', {
          clientNodeId: 'chrome-ext-storage-' + Math.random().toString(36).substring(7),
          sourcePortal: entry.sourcePortal || 'Storage Harvester Queue',
          items: [entry.item]
        });

        if (res && res.ok) {
          console.log('⚡ Background queue item synced successfully:', entry.item?.title || 'Raw Post');
        } else {
          remaining.push(entry);
        }
      } catch (e) {
        remaining.push(entry);
      }
    }

    const cappedRemaining = remaining.slice(-15);
    await chrome.storage.local.set({ pending_sync_queue: cappedRemaining }).catch(() => {});
  } catch (err) {
    console.error('Error draining pending queue:', err);
    try {
      await chrome.storage.local.set({ pending_sync_queue: [] });
    } catch (e) {}
  }
}

// Drain queue on startup
processPendingQueue();

// Listen for sync messages from content scripts (LinkedIn, Naukri, Indeed)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DRAIN_QUEUE_NOW') {
    processPendingQueue().then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === 'SYNC_SCRAPED_PAYLOAD') {
    (async () => {
      try {
        const item = message.item;
        console.log('⚡ [BACKGROUND] Received SYNC_SCRAPED_PAYLOAD for:', item?.title || 'Raw Post');

        const res = await postToBackend('/api/v1/jobs/scraper/client-sync', {
          clientNodeId: 'chrome-ext-node-' + Math.random().toString(36).substring(7),
          sourcePortal: message.sourcePortal || 'Background Harvester Node',
          items: [item]
        });

        if (res && res.ok) {
          const syncData = await res.json();
          console.log('⚡ [BACKGROUND] Backend sync successful:', syncData);
          sendResponse({ success: true, data: syncData });
        } else {
          console.warn('⚡ [BACKGROUND] Non-200 response from backend');
          sendResponse({ success: false, error: 'HTTP status non-200' });
        }
      } catch (err) {
        console.error('⚡ [BACKGROUND] Failed to sync item from background script:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep response channel open for async response
  }
});
