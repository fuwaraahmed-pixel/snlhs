/**
 * Notice Board & Download Center Filtering Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.notice-filter-btn');
  const noticeItems = document.querySelectorAll('.notice-item');
  const searchInput = document.getElementById('noticeSearchInput');

  function filterNotices() {
    const activeCategory = document.querySelector('.notice-filter-btn.active')?.dataset.category || 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

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
