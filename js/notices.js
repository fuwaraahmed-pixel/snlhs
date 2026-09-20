/**
 * Notice Board & Dynamic Google Sheet Sync
 * Shahera Nayeb Laboratory High School
 */

document.addEventListener('DOMContentLoaded', async () => {
  const filterBtns = document.querySelectorAll('.notice-filter-btn');
  const searchInput = document.getElementById('noticeSearchInput');
  const noticeContainer = document.getElementById('noticeListContainer');
  const homeNoticeContainer = document.getElementById('homeNoticeContainer');

  // Load notices from Google Sheet (or local fallback)
  if (typeof fetchNoticesFromGoogleSheet === 'function') {
    const notices = await fetchNoticesFromGoogleSheet();
    if (notices && notices.length > 0) {
      if (noticeContainer) renderFullNoticeList(notices, noticeContainer);
      if (homeNoticeContainer) renderHomeNoticePreview(notices, homeNoticeContainer);
    }
  }

  function renderFullNoticeList(items, container) {
    container.innerHTML = items.map(item => {
      const cat = (item.category || 'general').toLowerCase();
      const badgeClass = getBadgeClass(cat);
      const dateParts = parseNoticeDate(item.date);
      const downloadLink = item.downloadUrl || item.link || '#';

      return `
        <div class="notice-card notice-item" data-category="${cat}">
          <div class="notice-left">
            <div class="notice-date">
              <span>${dateParts.day}</span>
              <span style="font-size: 0.75rem;">${dateParts.month}</span>
            </div>
            <div>
              <span class="badge ${badgeClass}" style="margin-bottom: 4px;">${item.category || 'সাধারণ'}</span>
              <h2 class="notice-title" style="font-size: var(--text-lg);">${item.title}</h2>
              ${item.description ? `<p style="font-size: var(--text-sm); color: var(--neutral-600); margin-top: 4px;">${item.description}</p>` : ''}
            </div>
          </div>
          <a href="${downloadLink}" target="_blank" class="btn btn-outline btn-sm">ডাউনলোড / দেখুন</a>
        </div>
      `;
    }).join('');
  }

  function renderHomeNoticePreview(items, container) {
    const topNotices = items.slice(0, 3);
    container.innerHTML = topNotices.map(item => {
      const cat = (item.category || 'general').toLowerCase();
      const badgeClass = getBadgeClass(cat);
      const dateParts = parseNoticeDate(item.date);
      const downloadLink = item.downloadUrl || item.link || '#';

      return `
        <div class="notice-card">
          <div class="notice-left">
            <div class="notice-date">
              <span>${dateParts.day}</span>
              <span style="font-size: 0.75rem;">${dateParts.month}</span>
            </div>
            <div>
              <span class="badge ${badgeClass}" style="margin-bottom: 4px;">${item.category || 'সাধারণ'}</span>
              <h3 class="notice-title">${item.title}</h3>
            </div>
          </div>
          <a href="${downloadLink}" target="_blank" class="btn btn-outline btn-sm">ডাউনলোড / দেখুন</a>
        </div>
      `;
    }).join('');
  }

  function getBadgeClass(cat) {
    if (cat.includes('admission') || cat.includes('ভর্তি')) return 'badge-admission';
    if (cat.includes('exam') || cat.includes('পরীক্ষা')) return 'badge-exam';
    if (cat.includes('event') || cat.includes('ইভেন্ট')) return 'badge-event';
    return 'badge-academic';
  }

  function parseNoticeDate(dateStr) {
    if (!dateStr) return { day: '01', month: 'জানু' };
    const str = String(dateStr).trim();
    const parts = str.split(' ');
    if (parts.length >= 2) {
      return { day: parts[0], month: parts[1] };
    }
    return { day: str.substring(0, 2), month: str.substring(2) || 'আগস্ট' };
  }

  // Filter interactivity
  function filterNotices() {
    const activeCategory = document.querySelector('.notice-filter-btn.active')?.dataset.category || 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const noticeItems = document.querySelectorAll('.notice-item');

    noticeItems.forEach(item => {
      const itemCategory = item.dataset.category || '';
      const itemText = item.textContent.toLowerCase();

      const matchesCategory = activeCategory === 'all' || itemCategory === activeCategory;
      const matchesSearch = query === '' || itemText.includes(query);

      if (matchesCategory && matchesSearch) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterNotices();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterNotices);
  }
});
