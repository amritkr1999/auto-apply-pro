// EasyNaukri LinkedIn Hiring Post Harvester & 1-Click Save Button

const BACKEND_URL = 'http://localhost:8060';
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/gi;
const processedPosts = new Set();

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
      border: 1px solid ${isSuccess ? '#3b82f6' : '#ef4444'};
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

// 2. Parse LinkedIn Post Card
function parseLinkedInPost(postElement) {
  try {
    // Post Text
    const textElement = postElement.querySelector('.feed-shared-update-v2__commentary, .update-components-text, .feed-shared-inline-show-more-text');
    const fullText = textElement ? textElement.innerText.trim() : '';

    if (!fullText) return null;

    // Check for Email
    const emailMatches = fullText.match(EMAIL_REGEX);
    if (!emailMatches || emailMatches.length === 0) return null;

    const cleanEmail = emailMatches[0].toLowerCase();

    // Ignore generic/support emails
    if (cleanEmail.startsWith('support@') || cleanEmail.startsWith('info@') || cleanEmail.startsWith('noreply@')) {
      return null;
    }

    // Author Name
    const nameEl = postElement.querySelector('.update-components-actor__name, .feed-shared-actor__name, .update-components-actor__title span[dir="ltr"]');
    const authorName = nameEl ? nameEl.innerText.split('\n')[0].trim() : 'LinkedIn Recruiter';

    // Author Headline / Title
    const descEl = postElement.querySelector('.update-components-actor__description, .feed-shared-actor__description');
    const authorHeadline = descEl ? descEl.innerText.trim() : 'Recruiter';

    // Inferred Company Name
    let companyName = 'Unknown Company';
    if (authorHeadline.includes(' at ')) {
      companyName = authorHeadline.split(' at ')[1].split('.')[0].split('|')[0].trim();
    } else if (authorHeadline.includes('@')) {
      companyName = authorHeadline.split('@')[1].trim();
    } else {
      // Fallback domain extraction from email
      const domain = cleanEmail.split('@')[1];
      if (domain && !domain.includes('gmail') && !domain.includes('yahoo') && !domain.includes('outlook')) {
        companyName = domain.split('.')[0].toUpperCase();
      }
    }

    // Inferred Job Role / Title
    let jobTitle = 'Software Role';
    const lines = fullText.split('\n');
    for (let line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('hiring') || lower.includes('role:') || lower.includes('position:') || lower.includes('looking for')) {
        jobTitle = line.replace(/#/g, '').replace(/🚀|📌|📩|🔥|⚡/g, '').trim();
        if (jobTitle.length > 50) jobTitle = jobTitle.substring(0, 50);
        break;
      }
    }

    // Location
    let location = 'India / Remote';
    for (let line of lines) {
      if (line.toLowerCase().includes('location:')) {
        location = line.replace(/location:/i, '').trim();
        break;
      }
    }

    return {
      title: jobTitle,
      company: companyName,
      location: location,
      description: fullText.substring(0, 500),
      requirements: 'Extracted from LinkedIn Hiring Post',
      salary: 'Not Disclosed',
      sourceUrl: window.location.href,
      hrName: authorName,
      hrEmail: cleanEmail,
      hrTitle: authorHeadline,
      hrPhone: ''
    };
  } catch (err) {
    console.error('Error parsing LinkedIn post:', err);
    return null;
  }
}

// 3. Send Scraped Payload to Auto Apply Pro Backend
async function sendPayloadToBackend(item) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/jobs/scraper/client-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientNodeId: 'linkedin-node-' + Math.random().toString(36).substring(7),
        sourcePortal: 'LinkedIn Post Harvester',
        items: [item]
      })
    });

    if (res.ok) {
      const data = await res.json();
      showToast(`Saved ${item.hrName} (${item.hrEmail}) to HR Database!`, true);
      
      // Dispatch custom sync event
      window.dispatchEvent(new CustomEvent('harvester-sync-success', { detail: { added: 1 } }));
    }
  } catch (err) {
    console.error('Failed to sync LinkedIn post to backend:', err);
    showToast(`Failed to sync recruiter email. Ensure backend is running.`, false);
  }
}

// 4. Inject 1-Click "⚡ Save to EasyNaukri" Floating Button into LinkedIn Posts
function injectSaveButtons() {
  const posts = document.querySelectorAll('.feed-shared-update-v2, div[data-urn], .occludable-update');

  posts.forEach((post) => {
    const postData = parseLinkedInPost(post);
    if (!postData) return;

    const actionContainer = post.querySelector('.feed-shared-social-action-bar, .feed-shared-social-actions');
    if (!actionContainer) return;

    if (!post.querySelector('.easynaukri-save-btn')) {
      const btn = document.createElement('button');
      btn.className = 'easynaukri-save-btn';
      btn.style.cssText = `
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: #ffffff;
        border: none;
        padding: 6px 14px;
        margin-left: 8px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
        transition: all 0.2s ease;
      `;
      btn.innerHTML = `<span>⚡</span> <span>Save to EasyNaukri</span>`;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.innerText = '✓ Saved!';
        btn.style.background = '#10b981';
        sendPayloadToBackend(postData);
      });

      actionContainer.appendChild(btn);
    }

    // 5. Option A: Silent Background Auto-Harvest (if post has unique ID and not processed yet)
    const postId = post.getAttribute('data-urn') || postData.hrEmail;
    if (!processedPosts.has(postId)) {
      processedPosts.add(postId);
      console.log('Auto-harvested LinkedIn post from:', postData.hrName, postData.hrEmail);
      sendPayloadToBackend(postData);
    }
  });
}

// 6. Observe LinkedIn Feed Scroll & Mutations
const observer = new MutationObserver(() => {
  injectSaveButtons();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial run
setTimeout(() => {
  injectSaveButtons();
}, 2000);
