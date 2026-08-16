// EasyNaukri Harvester Background Service Worker

const BACKEND_URL = 'http://localhost:8060'; // Production API endpoint

// Setup periodic alarm for background harvester
chrome.runtime.onInstalled.addListener(() => {
  console.log('EasyNaukri Harvester Extension installed.');
  chrome.alarms.create('harvesterTaskAlarm', { periodInMinutes: 20 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'harvesterTaskAlarm') {
    runBackgroundHarvestingJob();
  }
});

async function ensureOffscreenDocument() {
  if (await chrome.offscreen.hasDocument()) {
    return;
  }
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['DOM_PARSING'],
    justification: 'Background silent DOM parsing for job harvester node.'
  });
}

async function runBackgroundHarvestingJob() {
  chrome.storage.local.get(['auto_harvester_enabled'], async (result) => {
    if (result.auto_harvester_enabled === false) {
      console.log('EasyNaukri Harvester is disabled by user setting.');
      return;
    }

    console.log('Running background job harvesting task...');
    try {
      // 1. Fetch target keywords from backend (90/10 weighted tasks)
      const tasksRes = await fetch(`${BACKEND_URL}/api/v1/jobs/scraper/client-tasks`);
      if (!tasksRes.ok) return;
      const tasks = await tasksRes.json();
      
      const targetRole = tasks && tasks.length > 0 ? tasks[0] : 'Full Stack Developer';

      // 2. Ensure offscreen document context is active
      await ensureOffscreenDocument();

      // 3. Delegate DOM parsing to offscreen document
      chrome.runtime.sendMessage({ type: 'EXECUTE_OFFSCREEN_HARVEST', keyword: targetRole }, async (response) => {
        if (response && response.success && response.items) {
          // 4. Sync payload to backend
          const syncRes = await fetch(`${BACKEND_URL}/api/v1/jobs/scraper/client-sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientNodeId: 'chrome-ext-offscreen-' + Math.random().toString(36).substring(7),
              sourcePortal: 'Offscreen Background Harvester',
              items: response.items
            })
          });

          if (syncRes.ok) {
            const syncData = await syncRes.json();
            console.log('Harvesting sync successful:', syncData);
          }
        }
      });
    } catch (err) {
      console.error('Error during background harvesting job:', err);
    }
  });
}
