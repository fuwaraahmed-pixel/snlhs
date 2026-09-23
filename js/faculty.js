/**
 * Faculty Directory Hydration & Filtering Script
 * Shahera Nayeb Laboratory High School
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('facultyDirectoryContainer');
  const filterBtnsContainer = document.getElementById('facultyFilterButtons');

  if (!container) return;

  try {
    const res = await fetch('../data/teachers.json');
    const teachers = res.ok ? await res.json() : [];

    if (!teachers.length) {
      container.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">শিক্ষক মণ্ডলীর তালিকা লোড হচ্ছে...</p>';
      return;
    }

    renderFacultyGrid(teachers, container);
    setupFacultyFilters(teachers, container, filterBtnsContainer);
  } catch (err) {
    console.error('Error loading faculty data:', err);
    container.innerHTML = '<p class="text-error" style="grid-column: 1/-1; text-align: center;">শিক্ষকদের তথ্য লোড করতে সমস্যা হয়েছে।</p>';
  }
});

function renderFacultyGrid(teachers, container) {
  container.innerHTML = teachers.map(t => {
    const avatarSvg = `<svg viewBox="0 0 24 24" width="48" height="48" fill="var(--primary-600)"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
    const imageElement = t.image && !t.image.includes('placeholders')
      ? `<img src="../${t.image}" alt="${t.name}" class="teacher-img" loading="lazy">`
      : `<div class="teacher-avatar-fallback">${avatarSvg}</div>`;

    return `
      <div class="teacher-card" data-department="${t.department || 'অন্যান্য'}">
        <div class="teacher-avatar">
          ${imageElement}
        </div>
        <div class="teacher-info">
          <span class="badge badge-academic" style="margin-bottom: 6px;">${t.department || 'সাধারণ'}</span>
          <h3 style="font-size: var(--text-lg); color: var(--primary-900); font-weight: 700;">${t.name}</h3>
          <p style="font-size: var(--text-xs); color: var(--accent-gold); font-weight: 700; margin-bottom: var(--space-1);">${t.designation}</p>
          <p style="font-size: var(--text-xs); color: var(--neutral-600);">${t.qualification}</p>
        </div>
      </div>
    `;
  }).join('');
}

function setupFacultyFilters(teachers, container, filterBtnsContainer) {
  if (!filterBtnsContainer) return;

  const departments = ['সব বিভাগ', ...new Set(teachers.map(t => t.department).filter(Boolean))];

  filterBtnsContainer.innerHTML = departments.map((dept, index) => `
    <button class="notice-filter-btn ${index === 0 ? 'active' : ''}" data-dept="${dept}">
      ${dept}
    </button>
  `).join('');

  const btns = filterBtnsContainer.querySelectorAll('.notice-filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedDept = btn.dataset.dept;
      const filtered = selectedDept === 'সব বিভাগ'
        ? teachers
        : teachers.filter(t => t.department === selectedDept);

      renderFacultyGrid(filtered, container);
    });
  });
}
