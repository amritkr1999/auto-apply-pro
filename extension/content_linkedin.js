// EasyNaukri LinkedIn Hiring Post & Email Harvester Node

const BACKEND_URL = 'http://localhost:8060';
const processedPosts = new Set();
const getEmailRegex = () => /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/gi;

console.log('⚡ EasyNaukri LinkedIn Harvester Script active on:', window.location.href);

// 1. Toast Notification Helper
function showToast(message, isSuccess = true) {
  let toast = document.getElementById('easynaukri-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'easynaukri-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: ${isSuccess ? '#0f172a' : '#7f1d1d'};
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
      border: 1px solid ${isSuccess ? '#10b981' : '#ef4444'};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 4000);
}

// 2. Sticky Top Harvester Control Bar
function injectTopHarvesterBar() {
  if (!document.body) return;
  if (document.getElementById('easynaukri-top-bar')) return;

  const bar = document.createElement('div');
  bar.id = 'easynaukri-top-bar';
  bar.style.cssText = `
    position: fixed;
    top: 56px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999980;
    background: #0f172a;
    color: #ffffff;
    padding: 6px 16px;
    border-radius: 30px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.5);
    border: 1px solid #3b82f6;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  bar.innerHTML = `
    <div style="display:flex; align-items:center; gap:6px;">
      <span style="color:#10b981;">●</span>
      <span>EasyNaukri Harvester</span>
    </div>
    <button id="easynaukri-scan-all-btn" style="
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border: none;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 11px;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(59,130,246,0.4);
    ">⚡ Harvest Emails On Screen</button>
  `;

  document.body.appendChild(bar);

  document.getElementById('easynaukri-scan-all-btn')?.addEventListener('click', () => {
    const count = harvestAllVisibleEmails();
    if (count > 0) {
      showToast(`Discovered & saved ${count} recruiter contact email(s) on screen!`, true);
    } else {
      showToast(`Inspected page! Processed visible text for recruiter contacts.`, true);
    }
  });
}

// 3. Email Filter Sanitizer
function isValidEmail(email) {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  if (lower.startsWith('support@') || lower.startsWith('info@') || lower.startsWith('noreply@') || lower.startsWith('careers@')) {
    return false;
  }
  return lower.length > 5 && lower.includes('@') && lower.includes('.');
}

// 4. Find Element Containing Email Text
function findNodeContainingText(emailText) {
  const allElements = document.querySelectorAll('p, span, div, li, article');
  for (let i = allElements.length - 1; i >= 0; i--) {
    const el = allElements[i];
    if (el.children.length === 0 && el.innerText && el.innerText.toLowerCase().includes(emailText.toLowerCase())) {
      return el.parentElement || el;
    }
  }
  return null;
}

// 5. Dynamic Recruiter Details Extractor
function extractAuthorDetails(postContainer, email) {
  let name = '';
  let title = '';
  let company = '';

  if (postContainer) {
    // Author Name
    const nameEl = postContainer.querySelector(
      '.update-components-actor__name, .feed-shared-actor__name, span.update-components-actor__title span[dir="ltr"], .update-components-actor__title, a.app-aware-link span'
    );
    if (nameEl && nameEl.innerText) {
      name = nameEl.innerText.split('\n')[0].trim();
    }

    // Author Headline / Designation
    const descEl = postContainer.querySelector(
      '.update-components-actor__description, .feed-shared-actor__description, .update-components-actor__sub-description'
    );
    if (descEl && descEl.innerText) {
      title = descEl.innerText.trim();
    }
  }

  // Smart Fallbacks if DOM metadata missing
  if (!name || name.length < 2) {
    const prefix = email.split('@')[0];
    name = prefix.replace(/[._\d]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  if (!title || title.length < 2) {
    title = 'IT Recruiter / Talent Acquisition';
  }

  // Company Name Extraction
  if (title.toLowerCase().includes(' at ')) {
    company = title.split(/ at /i)[1].split('.')[0].split('|')[0].trim();
  } else if (email.includes('@')) {
    const domain = email.split('@')[1].toLowerCase();
    if (domain && !domain.includes('gmail') && !domain.includes('yahoo') && !domain.includes('outlook') && !domain.includes('hotmail')) {
      company = domain.split('.')[0].toUpperCase();
    } else {
      company = 'IT Staffing & Hiring Agency';
    }
  }

  return { name, title, company };
}

// 6. Send Scraped Item to Background Worker (CORS Safe)
function sendPayloadToBackend(item) {
  try {
    chrome.runtime.sendMessage(
      {
        type: 'SYNC_SCRAPED_PAYLOAD',
        sourcePortal: 'LinkedIn Search Harvester',
        item: item
      },
      (response) => {
        if (response && response.success) {
          showToast(`Saved ${item.hrName} (${item.hrEmail}) to HR Database!`, true);
          window.dispatchEvent(new CustomEvent('harvester-sync-success', { detail: { added: 1 } }));
        } else {
          showToast(`Extracted ${item.hrName} (${item.hrEmail})`, true);
        }
      }
    );
  } catch (err) {
    console.error('Error sending message to background script:', err);
  }
}

function extractExactPostPermalink(postContainer) {
  if (!postContainer) return window.location.href;

  // 1. Direct "lnkd.in" share link or activity permalink
  const lnkdInLink = postContainer.querySelector('a[href*="lnkd.in/"], a[href*="/feed/update/urn:li:activity:"]');
  if (lnkdInLink && lnkdInLink.href) {
    return lnkdInLink.href;
  }

  // 2. Embedded "View job" button link inside post card
  const viewJobLink = postContainer.querySelector('a[href*="/jobs/view/"]');
  if (viewJobLink && viewJobLink.href) {
    return viewJobLink.href;
  }

  // 3. Timestamp link under author name (e.g., "3d • 🌐")
  const timestampLink = postContainer.querySelector(
    '.update-components-actor__sub-description-link, a[data-control-name="actor_container"], .feed-shared-actor__sub-description a, a.app-aware-link[href*="activity"]'
  );
  if (timestampLink && timestampLink.href && timestampLink.href.includes('linkedin.com')) {
    return timestampLink.href;
  }

  // 4. Fallback to any post anchor tag
  const anyPostLink = postContainer.querySelector('a[href*="/feed/update/"], a[href*="/jobs/view/"], a[href*="linkedin.com/posts/"]');
  if (anyPostLink && anyPostLink.href) {
    return anyPostLink.href;
  }

  return window.location.href;
}

// 7. Direct Text-Body Email Harvester
function harvestAllVisibleEmails() {
  const bodyText = document.body ? document.body.innerText : '';
  const regex = getEmailRegex();
  const emailMatches = bodyText.match(regex);

  if (!emailMatches || emailMatches.length === 0) {
    return 0;
  }

  const uniqueEmails = Array.from(new Set(emailMatches.map(e => e.toLowerCase()))).filter(isValidEmail);
  let count = 0;

  uniqueEmails.forEach((email) => {
    if (processedPosts.has(email)) return;
    processedPosts.add(email);

    // Locate node containing email
    const emailNode = findNodeContainingText(email);
    const postContainer = emailNode ? emailNode.closest('.feed-shared-update-v2, li, article, div') || emailNode : null;
    const fullText = postContainer ? postContainer.innerText : bodyText;

    // Dynamic Author Extraction
    const authorDetails = extractAuthorDetails(postContainer, email);

    // Job Title Extraction
    let role = 'Java Full Stack Developer';
    const lines = fullText.split('\n');
    for (let line of lines) {
      const l = line.toLowerCase();
      if (l.includes('role:') || l.includes('position:') || l.includes('hiring') || l.includes('developer') || l.includes('engineer') || l.includes('java')) {
        role = line.replace(/#/g, '').replace(/🚀|📌|📩|🔥|⚡/g, '').trim();
        if (role.length > 55) role = role.substring(0, 55);
        break;
      }
    }

    // Direct Post Permalink Extraction (lnkd.in / activity link / view job link)
    const directPostUrl = extractExactPostPermalink(postContainer);

    const payload = {
      title: role,
      company: authorDetails.company,
      location: 'Remote / Hybrid',
      description: fullText.substring(0, 500),
      requirements: 'Java, Spring Boot, Microservices',
      salary: 'Not Disclosed',
      sourceUrl: directPostUrl,
      hrName: authorDetails.name,
      hrEmail: email,
      hrTitle: authorDetails.title
    };

    sendPayloadToBackend(payload);
    count++;

    // Inject inline button next to email node
    if (emailNode && !emailNode.querySelector('.easynaukri-save-btn')) {
      const btn = document.createElement('button');
      btn.className = 'easynaukri-save-btn';
      btn.style.cssText = `
        display: inline-flex !important;
        align-items: center !important;
        gap: 5px !important;
        width: auto !important;
        max-width: 220px !important;
        height: 26px !important;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        color: #ffffff !important;
        border: none !important;
        padding: 4px 10px !important;
        margin: 4px 8px !important;
        border-radius: 14px !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        cursor: pointer !important;
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4) !important;
        box-sizing: border-box !important;
        white-space: nowrap !important;
      `;
      btn.innerHTML = `<span>⚡</span> <span>Save HR Email</span>`;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.innerText = '✓ Saved!';
        btn.style.background = '#047857';
        sendPayloadToBackend(payload);
      });
      emailNode.appendChild(btn);
    }
  });

  return count;
}

// 8. Auto Run & Observer Setup
function initHarvester() {
  if (!document.body) return;
  injectTopHarvesterBar();

  const observer = new MutationObserver(() => {
    harvestAllVisibleEmails();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  setInterval(() => {
    harvestAllVisibleEmails();
  }, 1800);

  harvestAllVisibleEmails();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHarvester);
} else {
  initHarvester();
}
