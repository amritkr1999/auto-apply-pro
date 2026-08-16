// EasyNaukri Extension Offscreen Harvester DOM Parser

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/gi;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXECUTE_OFFSCREEN_HARVEST') {
    (async () => {
      try {
        const keyword = message.keyword || 'Full Stack Developer';
        console.log('Offscreen harvester parsing task keyword:', keyword);

        // Perform silent DOM/API fetch simulation in offscreen context
        const items = [
          {
            title: `${keyword} (Autonomous Offscreen Node)`,
            company: 'TechCorp Solutions',
            location: 'Bengaluru / Remote',
            description: `Hiring ${keyword} for building high-scale distributed backend systems.`,
            requirements: 'Java 17, Spring Boot, React, PostgreSQL',
            salary: '₹18 - ₹25 LPA',
            sourceUrl: 'https://www.naukri.com/job-listings-autonomous',
            hrName: 'Akanksha Puri',
            hrEmail: 'akanksha.puri@sourcefuse.com',
            hrTitle: 'Senior Talent Partner'
          }
        ];

        sendResponse({ success: true, items });
      } catch (err) {
        console.error('Error in offscreen harvester:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep channel open for async response
  }
});
