// EasyNaukri Extension Popup Controller - Raw Text Harvester View

document.addEventListener('DOMContentLoaded', () => {
  const tabLatest = document.getElementById('tab-latest');
  const tabHistory = document.getElementById('tab-history');
  const latestView = document.getElementById('latest-view');
  const historyView = document.getElementById('history-view');
  const cardContainer = document.getElementById('harvested-card-container');
  const historyContainer = document.getElementById('history-list-container');

  // Tab switching logic
  tabLatest?.addEventListener('click', () => {
    tabLatest.classList.add('active');
    tabHistory.classList.remove('active');
    latestView.style.display = 'block';
    historyView.style.display = 'none';
  });

  tabHistory?.addEventListener('click', () => {
    tabHistory.classList.add('active');
    tabLatest.classList.remove('active');
    latestView.style.display = 'none';
    historyView.style.display = 'block';
    renderHistoryList();
  });

  // Load and render harvested job data
  function loadHarvestedData() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['last_harvested_job', 'harvested_jobs_history'], (data) => {
        const lastJob = data.last_harvested_job;
        const history = data.harvested_jobs_history || [];
        renderJobCard(lastJob || (history.length > 0 ? history[0] : null));
      });
    } else {
      renderJobCard(null);
    }
  }

  // Render main job card with raw post text (zero dummy data)
  function renderJobCard(job) {
    if (!cardContainer) return;

    if (!job) {
      cardContainer.innerHTML = `
        <div class="empty-state">
          <div style="font-size: 32px; margin-bottom: 8px;">⚡</div>
          <div style="font-weight: 700; color: #f8fafc; margin-bottom: 4px;">No Job Harvested Yet</div>
          <div style="font-size: 11px;">Surf LinkedIn and click <b>"⚡ Harvest Job Post"</b> on any post to capture the post text block instantly!</div>
        </div>
      `;
      return;
    }

    const hrEmailHtml = job.hrEmail ? `
      <div class="section-box">
        <div class="section-title">📧 Detected Email Address</div>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:4px;">
          <div class="hr-email">📧 ${escapeHtml(job.hrEmail)}</div>
          <button id="btn-copy-email" class="meta-chip" style="cursor:pointer; background:#1e293b; color:#38bdf8; border-color:#3b82f6;">📋 Copy</button>
        </div>
      </div>
    ` : '';

    const applyUrlHtml = job.applyUrl ? `
      <a href="${escapeHtml(job.applyUrl)}" target="_blank" class="action-btn" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); margin-bottom: 6px;">
        📝 Open Application / Google Form ↗
      </a>
    ` : '';

    const rawTextContent = job.description || job.rawText || 'No text extracted';

    cardContainer.innerHTML = `
      <div class="card">
        <div class="job-title">${escapeHtml(job.title || 'LinkedIn Job Post')}</div>
        <div class="company-name">👤 ${escapeHtml(job.hrName || job.company || 'Poster')}</div>

        ${applyUrlHtml}
        ${hrEmailHtml}

        <div class="section-box">
          <div class="section-title">📄 Full Post Text Block</div>
          <div class="desc-box" style="max-height: 180px;">${escapeHtml(rawTextContent)}</div>
        </div>

        ${job.sourceUrl ? `
          <div style="text-align: right;">
            <a href="${escapeHtml(job.sourceUrl)}" target="_blank" style="display:inline-block; font-size:11px; color:#38bdf8; text-decoration:none; margin-top:4px;">
              🔗 View Original Post on LinkedIn ↗
            </a>
          </div>
        ` : ''}
      </div>
    `;

    document.getElementById('btn-copy-email')?.addEventListener('click', () => {
      if (job.hrEmail) {
        navigator.clipboard.writeText(job.hrEmail);
        const btn = document.getElementById('btn-copy-email');
        if (btn) {
          btn.innerText = '✓ Copied!';
          setTimeout(() => btn.innerText = '📋 Copy', 2000);
        }
      }
    });
  }

  // Render history list
  function renderHistoryList() {
    if (!historyContainer) return;

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['harvested_jobs_history'], (data) => {
        const history = data.harvested_jobs_history || [];
        if (history.length === 0) {
          historyContainer.innerHTML = `
            <div class="empty-state" style="padding: 12px;">
              <div style="font-size: 11px;">No previous harvested posts in vault history.</div>
            </div>
          `;
          return;
        }

        historyContainer.innerHTML = history.map((item, idx) => `
          <div class="history-item" data-idx="${idx}">
            <div style="font-weight: 700; color: #f8fafc; font-size: 12px;">${escapeHtml(item.title || 'Job Post')}</div>
            <div style="font-size: 11px; color: #38bdf8;">👤 ${escapeHtml(item.hrName || item.company || 'Poster')}</div>
            <div style="display:flex; justify-content:space-between; margin-top: 4px; font-size: 10px; color: #94a3b8;">
              <span>${item.hrEmail ? '📧 ' + escapeHtml(item.hrEmail) : 'No HR Email'}</span>
              <span>${item.applyUrl ? '📝 Form Link' : ''}</span>
            </div>
          </div>
        `).join('');

        historyContainer.querySelectorAll('.history-item').forEach(el => {
          el.addEventListener('click', () => {
            const idx = parseInt(el.getAttribute('data-idx'));
            if (history[idx]) {
              renderJobCard(history[idx]);
              tabLatest.click();
            }
          });
        });
      });
    }
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

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && (changes.last_harvested_job || changes.harvested_jobs_history)) {
        loadHarvestedData();
      }
    });
  }

  loadHarvestedData();
});
