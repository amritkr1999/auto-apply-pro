// EasyNaukri LinkedIn Job Post & HR Harvester Content Script

const BACKEND_URL = 'http://localhost:8060';
const processedPosts = new Set();
const getEmailRegex = () => /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/gi;

console.log('⚡ EasyNaukri LinkedIn Harvester Script active on:', window.location.href);

// 1. Toast Notification Helper
function showToast(message, isSuccess = true, actionUrl = null, actionText = '📋 View Harvested Vault') {
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
      border-radius: 14px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
      border: 1px solid ${isSuccess ? '#10b981' : '#ef4444'};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(toast);
  }

  let htmlContent = `<span>⚡</span> <span>${message}</span>`;
  if (actionUrl) {
    htmlContent += `
      <a href="${actionUrl}" target="_blank" style="
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        text-decoration: none;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        margin-left: 6px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 2px 6px rgba(16,185,129,0.4);
      ">${actionText} →</a>
    `;
  }

  toast.innerHTML = htmlContent;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 7000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getCleanRawText(container) {
  if (!container) return '';

  // Clone container and strip ONLY extension injected buttons/badges/modals
  const clone = container.cloneNode(true);
  const extElements = clone.querySelectorAll('.easynaukri-save-job-btn, .easynaukri-harvest-badge, #easynaukri-top-bar, #easynaukri-toast, #easynaukri-centered-modal');
  extElements.forEach(el => el.remove());

  let raw = (clone.innerText || '').trim();

  // Strip extension overlay residuals if any
  raw = raw.replace(/⚡\s*Harvested Post Content[\s\S]*?✕\s*Close Review/gi, '').trim();
  raw = raw.replace(/⚡\s*Harvest Job Post/gi, '').trim();
  raw = raw.replace(/✓\s*Harvested!/gi, '').trim();

  if (raw.length > 20) {
    return raw;
  }

  // Fallback: direct innerText of container minus extension text
  return (container.innerText || '').replace(/⚡\s*Harvest Job Post|✓\s*Harvested!/g, '').trim();
}

function getTruePostContainer(el) {
  if (!el) return null;
  let current = el;
  while (current && current !== document.body) {
    if (current.matches && (
      current.matches('.feed-shared-update-v2') ||
      current.matches('div[data-urn*="activity"]') ||
      current.matches('li.reusable-search__result-container') ||
      current.matches('.reusable-search__result-container') ||
      current.matches('.entity-result') ||
      current.matches('.job-card-container') ||
      current.matches('article')
    )) {
      return current;
    }
    current = current.parentElement;
  }
  return el;
}

// 1.1 On-Screen Centered Review Modal (stays on screen until manually closed by user)
function showCenteredHarvestModal(item) {
  if (!item) return;

  let existingModal = document.getElementById('easynaukri-centered-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const backdrop = document.createElement('div');
  backdrop.id = 'easynaukri-centered-modal';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(6px);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  const modalBox = document.createElement('div');
  modalBox.style.cssText = `
    background: #0f172a;
    color: #f8fafc;
    width: 100%;
    max-width: 580px;
    max-height: 85vh;
    border-radius: 16px;
    border: 1px solid #3b82f6;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(59, 130, 246, 0.3);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: easynaukriModalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  const hrEmailHtml = item.hrEmail ? `
    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 12px; margin-bottom: 12px;">
      <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">📧 Detected Email Address</div>
      <div style="display: flex; align-items: center; justify-content: space-between; background: #0f172a; border: 1px solid #334155; padding: 8px 12px; border-radius: 8px;">
        <div style="font-family: monospace; font-size: 14px; color: #4ade80; font-weight: 700; word-break: break-all;">${escapeHtml(item.hrEmail)}</div>
        <button id="modal-copy-email-btn" style="background: #3b82f6; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">📋 Copy Email</button>
      </div>
    </div>
  ` : '';

  const applyUrlHtml = item.applyUrl ? `
    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 10px; padding: 12px; margin-bottom: 12px;">
      <div style="font-size: 11px; font-weight: 700; color: #4ade80; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">📝 Application / Google Form Link</div>
      <a href="${escapeHtml(item.applyUrl)}" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 10px; border-radius: 8px; font-weight: 700; font-size: 13px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
        📝 Open Application Form ↗
      </a>
    </div>
  ` : '';

  const rawTextContent = item.description || item.rawText || 'No post content extracted.';

  modalBox.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: #1e293b; border-bottom: 1px solid #334155;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 20px;">⚡</span>
        <div>
          <div style="font-weight: 800; font-size: 15px; color: #38bdf8;">Harvested Post Content</div>
          <div style="font-size: 11px; color: #94a3b8;">${escapeHtml(item.hrName || item.company || 'LinkedIn Post')}</div>
        </div>
      </div>
      <button id="modal-close-x" style="background: transparent; border: none; color: #94a3b8; font-size: 22px; font-weight: bold; cursor: pointer; padding: 0 4px; line-height: 1;">✕</button>
    </div>

    <div style="padding: 20px; overflow-y: auto; flex: 1;">
      ${hrEmailHtml}
      ${applyUrlHtml}

      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 12px;">
        <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">📄 Full Post Text Block</div>
        <div style="max-height: 280px; overflow-y: auto; font-size: 13px; color: #f8fafc; line-height: 1.6; white-space: pre-wrap; background: #0f172a; padding: 14px; border-radius: 8px; border: 1px solid #334155; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;">${escapeHtml(rawTextContent)}</div>
      </div>

      ${item.sourceUrl ? `
        <div style="text-align: right; margin-top: 10px;">
          <a href="${escapeHtml(item.sourceUrl)}" target="_blank" style="font-size: 12px; color: #38bdf8; text-decoration: none; font-weight: 600;">🔗 Open Original LinkedIn Post ↗</a>
        </div>
      ` : ''}
    </div>

    <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 20px; background: #1e293b; border-top: 1px solid #334155;">
      <a href="http://localhost:5173/opportunities/harvester?tab=harvested" target="_blank" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);">📋 Open Harvested Vault ↗</a>
      <button id="modal-close-btn" style="background: #3b82f6; color: white; border: none; padding: 8px 20px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">✕ Close Review</button>
    </div>
  `;

  backdrop.appendChild(modalBox);
  document.body.appendChild(backdrop);

  const closeModal = () => {
    backdrop.style.opacity = '0';
    backdrop.style.transition = 'opacity 0.2s ease';
    setTimeout(() => backdrop.remove(), 200);
  };

  document.getElementById('modal-close-x')?.addEventListener('click', closeModal);
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);

  document.getElementById('modal-copy-email-btn')?.addEventListener('click', () => {
    if (item.hrEmail) {
      navigator.clipboard.writeText(item.hrEmail);
      const btn = document.getElementById('modal-copy-email-btn');
      if (btn) {
        btn.innerText = '✓ Copied!';
        btn.style.background = '#10b981';
        setTimeout(() => {
          btn.innerText = '📋 Copy Email';
          btn.style.background = '#3b82f6';
        }, 2000);
      }
    }
  });

  if (!document.getElementById('easynaukri-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'easynaukri-modal-styles';
    style.textContent = `
      @keyframes easynaukriModalPop {
        from { transform: scale(0.92); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}


let isAutoScrolling = false;
let autoScrollTimer = null;

function scrollActiveContainer(distance) {
  const scrollContainers = document.querySelectorAll(
    '.scaffold-layout__main, .search-results-container, .jobs-search-results-list, .scaffold-finite-scroll__content, main'
  );
  let scrolledContainer = false;
  scrollContainers.forEach(container => {
    if (container && container.scrollHeight > container.clientHeight) {
      container.scrollBy({ top: distance, behavior: 'smooth' });
      scrolledContainer = true;
    }
  });
  window.scrollBy({ top: distance, behavior: 'smooth' });
}

function toggleAutoScroll() {
  const btn = document.getElementById('easynaukri-autoscroll-btn');
  if (!isAutoScrolling) {
    isAutoScrolling = true;
    if (btn) {
      btn.innerHTML = '⏸ Pause Auto-Scroll';
      btn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    }
    showToast('⚡ Auto-Scroll Harvester active! Parsing jobs on screen...', true, 'http://localhost:5173/opportunities/harvester?tab=harvested', '📋 Open Harvested Vault');
    
    autoScrollTimer = setInterval(() => {
      const scrollDistance = Math.floor(Math.random() * 250) + 200;
      scrollActiveContainer(scrollDistance);

      harvestAllVisibleJobPosts();

      // Click any "See more" / "Load more jobs" buttons automatically
      const seeMoreBtns = document.querySelectorAll('.feed-shared-inline-show-more-text__button, button.see-more-jobs, .artdeco-button--muted');
      seeMoreBtns.forEach(b => {
        if (b && b.innerText && (b.innerText.toLowerCase().includes('see more') || b.innerText.toLowerCase().includes('load more'))) {
          b.click();
        }
      });
    }, 1400);
  } else {
    isAutoScrolling = false;
    if (autoScrollTimer) clearInterval(autoScrollTimer);
    if (btn) {
      btn.innerHTML = '▶ Start Auto-Scroll';
      btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    }
    showToast('Auto-Scroll Harvester paused.', true);
  }
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
      <span>EasyNaukri Job Harvester</span>
    </div>
    <button id="easynaukri-autoscroll-btn" style="
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 11px;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(16,185,129,0.4);
    ">▶ Start Auto-Scroll</button>
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
    ">⚡ Harvest Job Posts On Screen</button>
    <button id="easynaukri-review-latest-btn" style="
      background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
      color: white;
      border: none;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 11px;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(139,92,246,0.4);
    ">👁️ Review Harvested Job</button>
  `;

  document.body.appendChild(bar);

  document.getElementById('easynaukri-autoscroll-btn')?.addEventListener('click', toggleAutoScroll);

  document.getElementById('easynaukri-review-latest-btn')?.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['last_harvested_job'], (data) => {
        if (data.last_harvested_job) {
          showCenteredHarvestModal(data.last_harvested_job);
        } else {
          showToast('No job post harvested yet in current session.', false);
        }
      });
    }
  });

  document.getElementById('easynaukri-scan-all-btn')?.addEventListener('click', () => {
    // Clear processedPosts set on manual click so all visible posts are re-evaluated and synced
    processedPosts.clear();
    const count = harvestAllVisibleJobPosts();
    const targetVaultUrl = 'http://localhost:5173/opportunities/harvester?tab=harvested';
    if (count === 0) {
      showToast(`Inspected page! View your saved job posts in Harvested Vault.`, true, targetVaultUrl, '📋 View Harvested Vault');
    } else {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['last_harvested_job'], (data) => {
          if (data.last_harvested_job) {
            showCenteredHarvestModal(data.last_harvested_job);
          }
        });
      }
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

// 3.1 Extract Google Form / External Application Links
function extractApplyUrl(fullText, postContainer) {
  if (postContainer) {
    const links = Array.from(postContainer.querySelectorAll('a[href]'));
    for (let link of links) {
      const href = link.href || '';
      if (
        href.includes('forms.gle') ||
        href.includes('docs.google.com/forms') ||
        href.includes('typeform.com') ||
        href.includes('tally.so') ||
        href.includes('airtable.com') ||
        href.includes('forms.office.com') ||
        href.includes('greenhouse.io') ||
        href.includes('lever.co') ||
        href.includes('workday.com') ||
        href.includes('jobs.ashbyhq.com')
      ) {
        return href;
      }
    }
  }

  // Regex fallback in fullText
  const urlRegex = /(https?:\/\/(?:forms\.gle|docs\.google\.com\/forms|typeform\.com|tally\.so|airtable\.com|forms\.office\.com|greenhouse\.io|lever\.co|workday\.com)[^\s\)\>]+)/gi;
  const match = fullText ? fullText.match(urlRegex) : null;
  if (match && match.length > 0) {
    return match[0].replace(/[.,;:]+$/, '');
  }

  // Look for any lnkd.in link in text
  const lnkMatch = fullText ? fullText.match(/(https?:\/\/lnkd\.in\/[a-zA-Z0-9_-]+)/gi) : null;
  if (lnkMatch && lnkMatch.length > 0) {
    return lnkMatch[0];
  }

  return null;
}

// 3.2 Update Local Chrome Storage with Harvested Job Payload
function updateLocalHarvestedStorage(item) {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['harvested_jobs_history'], (data) => {
        let history = data.harvested_jobs_history || [];
        history = history.filter(h => h.sourceUrl !== item.sourceUrl && !(h.title === item.title && h.company === item.company));
        item.harvestedAt = new Date().toISOString();
        history.unshift(item);
        if (history.length > 15) history = history.slice(0, 15);

        chrome.storage.local.set({
          last_harvested_job: item,
          harvested_jobs_history: history
        }, () => {
          if (chrome.runtime.lastError) {
            console.warn('Chrome storage quota error handled:', chrome.runtime.lastError);
            // Clear history if quota was hit
            chrome.storage.local.set({ harvested_jobs_history: [item] });
          } else {
            console.log('⚡ Saved harvested job to chrome.storage.local:', item.title);
          }
        });
      });
    }
  } catch (e) {
    console.warn('Local storage update skipped:', e);
  }
}

// 3.3 Highlight Harvested Job Post Container visually on page
function highlightPostContainer(container, item) {
  if (!container) return;

  container.style.border = '2px solid #10b981';
  container.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.45)';
  container.style.borderRadius = '12px';
  container.style.transition = 'all 0.3s ease';
  container.style.position = 'relative';

  let badge = container.querySelector('.easynaukri-harvest-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.className = 'easynaukri-harvest-badge';
    badge.style.cssText = `
      position: absolute;
      top: 10px;
      right: 12px;
      z-index: 999;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);
      display: flex;
      align-items: center;
      gap: 6px;
    `;
    container.appendChild(badge);
  }

  let badgeDetails = `⚡ HARVESTED`;
  if (item && item.hrEmail) {
    badgeDetails += ` • 📧 Email Found`;
  }
  if (item && item.applyUrl) {
    badgeDetails += ` • 📝 Form Found`;
  }
  badge.innerHTML = badgeDetails;
}


// 4. Dynamic Author & Company Extractor
function extractAuthorDetails(postContainer, extractedEmail) {
  let name = '';
  let title = '';
  let company = '';

  if (postContainer) {
    // Author Name
    const nameEl = postContainer.querySelector(
      '.update-components-actor__name, .feed-shared-actor__name, span.update-components-actor__title span[dir="ltr"], .update-components-actor__title, a.app-aware-link span, .job-card-container__primary-description, .entity-result__title-text, .app-aware-link span[aria-hidden="true"]'
    );
    if (nameEl && nameEl.innerText) {
      name = nameEl.innerText.split('\n')[0].trim();
    }

    // Author Headline / Designation
    const descEl = postContainer.querySelector(
      '.update-components-actor__description, .feed-shared-actor__description, .update-components-actor__sub-description, .entity-result__primary-subtitle, .entity-result__summary'
    );
    if (descEl && descEl.innerText) {
      title = descEl.innerText.trim();
    }
  }

  // Check post body text for explicit "at [Company]" line e.g. "We're Hiring at Tech Rudraum Pvt. Ltd."
  const fullText = postContainer ? (postContainer.innerText || '') : '';
  const lines = fullText.split('\n').map(l => l.trim());

  for (let line of lines) {
    const l = line.toLowerCase();
    if (l.includes("hiring at ") || l.includes("hiring for ")) {
      const parts = line.split(/hiring at |hiring for /i);
      if (parts.length > 1 && parts[1].trim().length > 2) {
        let extractedComp = parts[1].replace(/#/g, '').replace(/🚀|📌|📩|🔥|⚡|📢|💼|🌟/gi, '').split('\n')[0].split('.')[0].split('|')[0].trim();
        if (extractedComp.length > 2 && extractedComp.length < 50) {
          company = extractedComp;
          break;
        }
      }
    }
  }

  // Check headline for "@Company" e.g. "Candidate Manager - L2 @TEKsystems"
  if (!company && title && title.includes('@')) {
    const parts = title.split('@');
    if (parts.length > 1 && parts[1].trim().length > 1) {
      company = parts[1].split('|')[0].split('-')[0].split('.')[0].trim();
    }
  }

  // Company Name Extraction from Headline
  if (!company && title && title.toLowerCase().includes(' at ')) {
    company = title.split(/ at /i)[1].split('.')[0].split('|')[0].split('-')[0].trim();
  } else if (!company && title && title.toLowerCase().includes(' @ ')) {
    company = title.split(/ @ /i)[1].split('.')[0].split('|')[0].trim();
  } else if (!company && extractedEmail && extractedEmail.includes('@')) {
    const domain = extractedEmail.split('@')[1].toLowerCase();
    if (domain && !domain.includes('gmail') && !domain.includes('yahoo') && !domain.includes('outlook') && !domain.includes('hotmail')) {
      company = domain.split('.')[0].toUpperCase();
    }
  }

  if (!company || company.length < 2) {
    company = 'Hiring Company';
  }

  if (!name || name.length < 2) {
    if (extractedEmail) {
      const prefix = extractedEmail.split('@')[0];
      name = prefix.replace(/[._\d]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    } else {
      name = 'Recruiter / Hiring Team';
    }
  }

  if (!title || title.length < 2) {
    title = 'Talent Acquisition / Hiring Team';
  }

  return { name, title, company };
}

function isExtensionValid() {
  try {
    return typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;
  } catch (e) {
    return false;
  }
}

// 5. Storage Queue Fallback (prevents Mixed Content TypeError on https page)
function queueInChromeStorage(item, postKey) {
  const targetVaultUrl = 'http://localhost:5173/opportunities/harvester?tab=raw';
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['pending_sync_queue'], (data) => {
        const queue = data.pending_sync_queue || [];
        queue.push({ item, sourcePortal: 'LinkedIn Search Harvester', postKey, timestamp: Date.now() });
        chrome.storage.local.set({ pending_sync_queue: queue }, () => {
          if (isExtensionValid()) {
            try { chrome.runtime.sendMessage({ type: 'DRAIN_QUEUE_NOW' }); } catch(e) {}
          }
        });
      });
    }
  } catch (e) {
    console.warn('Storage queue fallback skipped:', e);
  }
  if (postKey) processedPosts.add(postKey);
  showToast(`Saved raw post to Harvested Vault!`, true, targetVaultUrl, '📋 View Harvested Vault');
  window.dispatchEvent(new CustomEvent('harvester-sync-success', { detail: { added: 1 } }));
}

// 6. Send Scraped Item to Background Worker via chrome.runtime.sendMessage
function sendPayloadToBackend(item, postKey) {
  const targetVaultUrl = 'http://localhost:5173/opportunities/harvester?tab=raw';

  console.log('⚡ [EASYNAUKRI] Syncing harvested post payload:', item.title || item.rawText?.substring(0, 30));

  // 1. Send message to background service worker (which fetches http://localhost:8060 without mixed content restrictions)
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    try {
      chrome.runtime.sendMessage(
        {
          type: 'SYNC_SCRAPED_PAYLOAD',
          sourcePortal: 'LinkedIn Feed Harvester',
          item: item
        },
        (response) => {
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
            console.warn('⚡ [EASYNAUKRI] Runtime message warning, fallback to storage queue:', chrome.runtime.lastError.message);
            queueInChromeStorage(item, postKey);
          } else if (response && response.success) {
            console.log('⚡ [EASYNAUKRI] Background sync SUCCESS:', response);
            if (postKey) processedPosts.add(postKey);
            showToast(`Saved raw post to Harvested Vault!`, true, targetVaultUrl, '📋 View Harvested Vault');
            window.dispatchEvent(new CustomEvent('harvester-sync-success', { detail: { added: 1 } }));
          } else {
            queueInChromeStorage(item, postKey);
          }
        }
      );
      return;
    } catch (err) {
      console.warn('⚡ [EASYNAUKRI] sendMessage exception, fallback to storage queue:', err);
    }
  }

  // 2. Fallback to storage queue
  queueInChromeStorage(item, postKey);
}

// 7. Extract Exact Post Permalink
function extractExactPostPermalink(postContainer) {
  if (!postContainer) return window.location.href;

  const lnkdInLink = postContainer.querySelector('a[href*="lnkd.in/"], a[href*="/feed/update/urn:li:activity:"]');
  if (lnkdInLink && lnkdInLink.href) return lnkdInLink.href;

  const viewJobLink = postContainer.querySelector('a[href*="/jobs/view/"]');
  if (viewJobLink && viewJobLink.href) return viewJobLink.href;

  const timestampLink = postContainer.querySelector(
    '.update-components-actor__sub-description-link, a[data-control-name="actor_container"], .feed-shared-actor__sub-description a, a.app-aware-link[href*="activity"]'
  );
  if (timestampLink && timestampLink.href && timestampLink.href.includes('linkedin.com')) {
    return timestampLink.href;
  }

  const anyPostLink = postContainer.querySelector('a[href*="/feed/update/"], a[href*="/jobs/view/"], a[href*="linkedin.com/posts/"]');
  if (anyPostLink && anyPostLink.href) return anyPostLink.href;

  return window.location.href;
}

function extractJobTitle(fullText, postContainer) {
  const cardTitle = postContainer?.querySelector('.job-card-list__title, .jobs-unified-top-card__job-title, .jobs-details-top-card__job-title');
  if (cardTitle && cardTitle.innerText && cardTitle.innerText.trim().length > 3) {
    let t = cardTitle.innerText.split('\n')[0].replace(/#/g, '').replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
    if (t.length > 2 && t.length < 120) return t;
  }

  const candidateFilterTerms = [
    'opentowork', 'open to work', 'looking for my next challenge', 'seeking new opportunities',
    'seeking job', 'looking for a job', 'looking for a role', 'immediate joiner', 'available to join',
    'i\'m officially opentowork', 'iam opentowork', 'open for opportunities', 'looking for new opportunities'
  ];

  const lines = (fullText || '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const keywords = ['developer', 'engineer', 'architect', 'manager', 'lead', 'designer', 'analyst', 'specialist', 'consultant', 'executive', 'tester', 'administrator'];

  const cleanLine = (line) => {
    return line.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
               .replace(/#/g, '')
               .trim();
  };

  // High Priority: Lines containing "hiring", "role:", "position:", "job title:"
  for (let line of lines) {
    const l = line.toLowerCase();

    // Skip candidate / OpenToWork self-promotions
    if (candidateFilterTerms.some(term => l.includes(term))) continue;

    if (l.includes('hiring') || l.includes('role:') || l.includes('position:') || l.includes('job title:')) {
      let stripped = cleanLine(line);
      stripped = stripped.replace(/^(we're hiring|we are hiring|hiring|role|position|job title|hiring for)\s*[:|]?\s*/gi, '')
                         .replace(/^[|:,\-\s]+/, '')
                         .trim();

      if (stripped.includes('|')) {
        const segments = stripped.split('|').map(s => s.trim());
        for (let seg of segments) {
          const segClean = seg.replace(/^(we're hiring|we are hiring|hiring)\s*/gi, '').trim();
          const segLower = segClean.toLowerCase();
          if (!candidateFilterTerms.some(t => segLower.includes(t)) && keywords.some(k => segLower.includes(k))) {
            return segClean;
          }
        }
      }

      if (stripped.length > 2 && stripped.length < 100 && !candidateFilterTerms.some(t => stripped.toLowerCase().includes(t))) {
        return stripped;
      }
    }
  }

  // Medium Priority: Lines containing engineering/designation keywords
  for (let line of lines) {
    const l = line.toLowerCase();
    if (candidateFilterTerms.some(term => l.includes(term))) continue;

    if (keywords.some(k => l.includes(k))) {
      let stripped = cleanLine(line);
      stripped = stripped.replace(/^(we're hiring|we are hiring|hiring)\s*[:|]?\s*/gi, '')
                         .replace(/^[|:,\-\s]+/, '')
                         .trim();

      if (stripped.includes('|')) {
        const segments = stripped.split('|').map(s => s.trim());
        for (let seg of segments) {
          const segClean = seg.replace(/^(we're hiring|we are hiring|hiring)\s*/gi, '').trim();
          const segLower = segClean.toLowerCase();
          if (!candidateFilterTerms.some(t => segLower.includes(t)) && keywords.some(k => segLower.includes(k))) {
            return segClean;
          }
        }
      }

      if (stripped.length > 3 && stripped.length < 100) {
        return stripped;
      }
    }
  }

  return 'Software Engineer';
}

// 9. Extract Location from Post
function extractLocation(fullText, postContainer) {
  const locEl = postContainer?.querySelector('.job-card-container__metadata-item, .jobs-unified-top-card__bullet');
  if (locEl && locEl.innerText) return locEl.innerText.trim();

  const lower = fullText.toLowerCase();
  if (lower.includes('remote')) return 'Remote';
  if (lower.includes('hybrid')) return 'Hybrid';
  if (lower.includes('bengaluru') || lower.includes('bangalore')) return 'Bengaluru, India';
  if (lower.includes('mumbai')) return 'Mumbai, India';
  if (lower.includes('pune')) return 'Pune, India';
  if (lower.includes('hyderabad')) return 'Hyderabad, India';
  if (lower.includes('delhi') || lower.includes('noida') || lower.includes('gurugram') || lower.includes('gurgaon')) return 'NCR, India';

  return 'Remote / Hybrid';
}

// 10. Extract Salary from Post
function extractSalary(fullText) {
  const salaryRegex = /(?:₹|\$|€|£)\s*\d+(?:\.\d+)?\s*(?:-|to)?\s*(?:₹|\$|€|£)?\s*\d*(?:\.\d+)?\s*(?:lpa|k|lacs|lakhs|\/hr|\/yr|per annum)/gi;
  const match = fullText.match(salaryRegex);
  if (match && match.length > 0) {
    return match[0].trim();
  }
  if (fullText.toLowerCase().includes('lpa')) {
    const lpaLines = fullText.split('\n').filter(l => l.toLowerCase().includes('lpa'));
    if (lpaLines.length > 0) return lpaLines[0].substring(0, 30).trim();
  }
  return 'Not Disclosed';
}

// 11. Extract Requirements & Tech Stack
function extractRequirements(fullText) {
  const techKeywords = ['Java', 'Spring Boot', 'React', 'Node.js', 'TypeScript', 'Python', 'PostgreSQL', 'Docker', 'AWS', 'Kubernetes', 'Microservices', 'Kafka', 'SQL', 'Next.js', 'Angular', 'C++', 'Go', 'GraphQL'];
  const matched = techKeywords.filter(tech => fullText.toLowerCase().includes(tech.toLowerCase()));
  if (matched.length > 0) {
    return matched.join(', ');
  }
  return 'Java, Spring Boot, React, Microservices';
}

// 12. Parse Single Job Post Container
function parseAndHarvestPostContainer(container, bypassCache = false) {
  if (!container) return null;

  const rawText = getCleanRawText(container);
  if (rawText.length < 30) return null;

  const regex = getEmailRegex();
  const emailMatches = rawText.match(regex);
  const validEmails = emailMatches ? emailMatches.filter(isValidEmail) : [];
  const hrEmail = validEmails.length > 0 ? validEmails[0].toLowerCase() : null;

  const authorDetails = extractAuthorDetails(container, hrEmail);
  const title = extractJobTitle(rawText, container);
  const directPostUrl = extractExactPostPermalink(container);
  const applyUrl = extractApplyUrl(rawText, container);

  const postKey = `${(authorDetails.name || 'post').toLowerCase()}_${directPostUrl}`;
  if (!bypassCache && processedPosts.has(postKey)) return null;

  const payload = {
    title: title || (authorDetails.name ? `Post by ${authorDetails.name}` : 'LinkedIn Job Post'),
    company: authorDetails.company || authorDetails.name || 'LinkedIn Poster',
    location: '',
    description: rawText,
    requirements: '',
    salary: '',
    sourceUrl: directPostUrl,
    hrName: authorDetails.name || '',
    hrEmail: hrEmail || '',
    hrTitle: authorDetails.title || '',
    applyUrl: applyUrl || '',
    rawText: rawText,
    harvestedAt: new Date().toISOString()
  };

  return { payload, postKey, container };
}

// 13. Main Job Post Harvester Function with Parent-Only Filtering
function harvestAllVisibleJobPosts() {
  let rawElements = Array.from(document.querySelectorAll(
    '.feed-shared-update-v2, .job-card-container, .jobs-search-results-list__list-item, div[data-urn*="activity"], article, .reusable-search__result-container, .entity-result, li.reusable-search__result-container'
  ));

  // Universal Fallback: If no standard containers match, scan page elements for hiring text or email patterns
  if (rawElements.length === 0) {
    const candidates = Array.from(document.querySelectorAll('div, section, article, li'));
    rawElements = candidates.filter(el => {
      const text = el.innerText || '';
      if (text.length < 50 || text.length > 5000) return false;
      const lower = text.toLowerCase();
      const hasEmail = getEmailRegex().test(text);
      const hasHiringKeyword = lower.includes('hiring') || lower.includes('role:') || lower.includes('position:') || lower.includes('looking for') || lower.includes('developer') || lower.includes('engineer');
      return hasEmail || hasHiringKeyword;
    });
  }

  const allContainers = Array.from(new Set(rawElements));

  // Filter out nested child nodes (only keep top-level containers)
  const containers = allContainers.filter(c => !allContainers.some(parent => parent !== c && parent.contains(c)));

  let count = 0;

  containers.forEach(container => {
    const result = parseAndHarvestPostContainer(container);
    if (result) {
      const { payload, postKey, container: postEl } = result;

      updateLocalHarvestedStorage(payload);
      highlightPostContainer(postEl, payload);
      sendPayloadToBackend(payload, postKey);
      count++;

      injectInlineHarvestButton(postEl, payload, postKey);
    } else {
      const fullText = container.innerText || '';
      if (fullText.trim().length > 30) {
        const regex = getEmailRegex();
        const emailMatches = fullText.match(regex);
        const validEmails = emailMatches ? emailMatches.filter(isValidEmail) : [];
        const hrEmail = validEmails.length > 0 ? validEmails[0].toLowerCase() : null;
        const authorDetails = extractAuthorDetails(container, hrEmail);
        const title = extractJobTitle(fullText, container);
        const directPostUrl = extractExactPostPermalink(container);
        const applyUrl = extractApplyUrl(fullText, container);
        const postKey = `${title.toLowerCase()}_${authorDetails.company.toLowerCase()}_${directPostUrl}`;
        
        const payload = {
          title: title,
          company: authorDetails.company,
          location: extractLocation(fullText, container),
          description: fullText.substring(0, 2500),
          requirements: extractRequirements(fullText),
          salary: extractSalary(fullText),
          sourceUrl: directPostUrl,
          hrName: authorDetails.name,
          hrEmail: hrEmail,
          hrTitle: authorDetails.title,
          applyUrl: applyUrl,
          harvestedAt: new Date().toISOString()
        };
        injectInlineHarvestButton(container, payload, postKey);
      }
    }
  });

  return count;
}

// 14. Inject Inline "⚡ Harvest Job Post" Action Button
function injectInlineHarvestButton(postContainer, payload, postKey) {
  if (!postContainer || postContainer.querySelector('.easynaukri-save-job-btn')) return;

  const actionBar = postContainer.querySelector(
    '.feed-shared-social-action-bar, .feed-shared-footer, .job-card-container__action-container, .update-components-actor'
  ) || postContainer;

  const btn = document.createElement('button');
  btn.className = 'easynaukri-save-job-btn';
  btn.style.cssText = `
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    width: auto !important;
    height: 28px !important;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
    color: #ffffff !important;
    border: none !important;
    padding: 4px 12px !important;
    margin: 6px 10px !important;
    border-radius: 14px !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    cursor: pointer !important;
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4) !important;
    box-sizing: border-box !important;
    white-space: nowrap !important;
    z-index: 99;
  `;
  btn.innerHTML = `<span>⚡</span> <span>Harvest Job Post</span>`;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Target the specific post container closest to the clicked button
    const targetPostContainer = getTruePostContainer(btn) || postContainer;

    // Extract exact raw post text directly from the target post container
    const cleanRaw = getCleanRawText(targetPostContainer);
    const freshResult = parseAndHarvestPostContainer(targetPostContainer, true);
    let freshPayload = freshResult ? freshResult.payload : payload;
    const freshPostKey = freshResult ? freshResult.postKey : postKey;

    if (freshPayload) {
      if (!freshPayload.rawText || freshPayload.rawText.length < 10) {
        freshPayload.rawText = cleanRaw || (targetPostContainer.innerText || '').trim();
      }
      if (!freshPayload.description || freshPayload.description.length < 10) {
        freshPayload.description = freshPayload.rawText;
      }
    }

    btn.innerHTML = `<span>✓</span> <span>Harvested!</span>`;
    btn.style.background = '#047857';

    updateLocalHarvestedStorage(freshPayload);
    highlightPostContainer(targetPostContainer, freshPayload);
    sendPayloadToBackend(freshPayload, freshPostKey);
    showCenteredHarvestModal(freshPayload);

    try {
      targetPostContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {}
  });

  actionBar.appendChild(btn);
}

// 15. Debounced Observer & Initialization (Optimized to Eliminate CPU Lag)
let debounceHarvesterTimer = null;
function debouncedHarvestAll() {
  if (debounceHarvesterTimer) clearTimeout(debounceHarvesterTimer);
  debounceHarvesterTimer = setTimeout(() => {
    harvestAllVisibleJobPosts();
  }, 800);
}

function initHarvester() {
  if (!document.body) return;
  injectTopHarvesterBar();

  const observer = new MutationObserver(() => {
    debouncedHarvestAll();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  setInterval(() => {
    debouncedHarvestAll();
  }, 5000);

  harvestAllVisibleJobPosts();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHarvester);
} else {
  initHarvester();
}
