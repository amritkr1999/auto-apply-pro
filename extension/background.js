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

// Listen for sync messages from content scripts (LinkedIn, Naukri, Indeed)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SYNC_SCRAPED_PAYLOAD') {
    (async () => {
      try {
        const item = message.item;
        const res = await fetch(`${BACKEND_URL}/api/v1/jobs/scraper/client-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientNodeId: 'chrome-ext-node-' + Math.random().toString(36).substring(7),
            sourcePortal: message.sourcePortal || 'Background Harvester Node',
            items: [item]
          })
        });

        if (res.ok) {
          const syncData = await res.json();
          console.log('Background sync successful:', syncData);
          sendResponse({ success: true, data: syncData });
        } else {
          sendResponse({ success: false, error: 'HTTP status ' + res.status });
        }
      } catch (err) {
        console.error('Failed to sync item from background script:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep response channel open for async response
  }
});

async function runBackgroundHarvestingJob() {
  chrome.storage.local.get(['auto_harvester_enabled'], async (result) => {
    if (result.auto_harvester_enabled === false) {
      console.log('EasyNaukri Harvester is disabled by user setting.');
      return;
    }

    console.log('Running background job harvesting task...');
    try {
      let targetRole = 'Full Stack Developer';
      try {
        const tasksRes = await fetch(`${BACKEND_URL}/api/v1/jobs/scraper/client-tasks`);
        if (tasksRes.ok) {
          const tasks = await tasksRes.json();
          if (tasks && tasks.length > 0) targetRole = tasks[0];
        }
      } catch (fetchErr) {
        console.warn('Could not fetch remote tasks, using default role:', targetRole);
      }

      const sampleHarvestedItems = [
        {
          title: `${targetRole}`,
          company: 'Acme Global Technologies',
          location: 'Bengaluru / Remote',
          description: `Hiring ${targetRole} for building high scale web services.`,
          requirements: 'Java, Spring Boot, React, Postgres',
          salary: '₹15 - ₹22 LPA',
          sourceUrl: 'https://www.naukri.com/job-listings-sample',
          hrName: 'Deepak Sharma',
          hrEmail: `deepak.sharma@acmeglobal.com`,
          hrTitle: 'Talent Acquisition Manager'
        }
      ];

      await fetch(`${BACKEND_URL}/api/v1/jobs/scraper/client-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientNodeId: 'chrome-ext-node-' + Math.random().toString(36).substring(7),
          sourcePortal: 'Background Harvester Alarm Task',
          items: sampleHarvestedItems
        })
      });
    } catch (err) {
      console.error('Error during background harvesting job:', err);
    }
  });
}
