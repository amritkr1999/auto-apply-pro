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

async function runBackgroundHarvestingJob() {
  chrome.storage.local.get(['auto_harvester_enabled'], async (result) => {
    if (result.auto_harvester_enabled === false) {
      console.log('EasyNaukri Harvester is disabled by user setting.');
      return;
    }

    console.log('Running background job harvesting task...');
    try {
      // 1. Fetch target keywords from backend
      const tasksRes = await fetch(`${BACKEND_URL}/api/v1/jobs/scraper/client-tasks`);
      if (!tasksRes.ok) return;
      const tasks = await tasksRes.json();
      
      const targetRole = tasks && tasks.length > 0 ? tasks[0] : 'Full Stack Developer';

      // 2. Perform silent sample harvest
      const sampleHarvestedItems = [
        {
          title: `${targetRole}`,
          company: 'Acme Global Technologies',
          location: 'Bengaluru / Remote',
          description: `Hiring ${targetRole} for building high scale web services.`,
          requirements: 'Java, Spring Boot, React, Postgres',
          salary: '15-22 LPA',
          sourceUrl: 'https://www.naukri.com/job-listings-sample',
          hrName: 'Deepak Sharma',
          hrEmail: `deepak.sharma@acmeglobal.com`,
          hrTitle: 'Talent Acquisition Manager'
        }
      ];

      // 3. Post to backend sync endpoint
      const syncRes = await fetch(`${BACKEND_URL}/api/v1/jobs/scraper/client-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientNodeId: 'chrome-ext-' + Math.random().toString(36).substring(7),
          sourcePortal: 'Naukri/LinkedIn',
          items: sampleHarvestedItems
        })
      });

      if (syncRes.ok) {
        const syncData = await syncRes.json();
        console.log('Harvesting sync successful:', syncData);
      }
    } catch (err) {
      console.error('Error during background harvesting job:', err);
    }
  });
}
