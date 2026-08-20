/**
 * Gallery Lightbox Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  const galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-card');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  // Filter gallery items by category
  galleryFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      galleryFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.category || 'all';

      galleryItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Open Lightbox Modal
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const title = item.dataset.title || '';
      const caption = item.dataset.caption || title;

      if (lightboxModal && lightboxCaption) {
        lightboxCaption.textContent = caption;
        lightboxModal.classList.add('is-active');
        lightboxModal.setAttribute('aria-hidden', 'false');
        if (lightboxClose) lightboxClose.focus();
      }
    });
  });

  // Close Lightbox Modal
  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove('is-active');
      lightboxModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('is-active')) {
      closeLightbox();
    }
  });
});
