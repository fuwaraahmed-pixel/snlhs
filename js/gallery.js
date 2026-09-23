/**
 * Dynamic Gallery Hydration & Lightbox Interactivity
 * Shahera Nayeb Laboratory High School
 */

document.addEventListener('DOMContentLoaded', async () => {
  const dynamicContainer = document.getElementById('dynamicGalleryContainer');
  const galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  if (dynamicContainer) {
    try {
      const res = await fetch('../data/gallery.json');
      const galleryData = res.ok ? await res.json() : [];
      if (galleryData.length > 0) {
        renderGalleryItems(galleryData, dynamicContainer);
      }
    } catch (err) {
      console.error('Error fetching gallery JSON:', err);
    }
  }

  function renderGalleryItems(items, container) {
    const gallerySvg = `<svg viewBox="0 0 24 24" width="48" height="48" fill="var(--primary-600)"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`;

    container.innerHTML = items.map(item => {
      const imageTag = item.image && !item.image.includes('placeholders')
        ? `<img src="../${item.image}" alt="${item.alt || item.title}" loading="lazy">`
        : `<div class="gallery-placeholder-fallback">${gallerySvg}</div>`;

      return `
        <div class="gallery-card" data-category="${item.category}" data-title="${item.title}" data-caption="${item.alt || item.title}">
          <div class="gallery-img-wrapper">
            ${imageTag}
          </div>
          <div class="gallery-info">
            <span class="badge badge-event" style="margin-bottom: 4px;">${item.categoryBn || item.category}</span>
            <h3 class="gallery-title">${item.title}</h3>
          </div>
        </div>
      `;
    }).join('');

    // Re-attach lightbox click listeners after dynamic render
    attachLightboxListeners();
  }

  // Filter gallery items by category
  if (galleryFilterBtns.length > 0) {
    galleryFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        galleryFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.dataset.category || 'all';
        const items = document.querySelectorAll('.gallery-card');

        items.forEach(item => {
          if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // Attach Lightbox Listeners
  function attachLightboxListeners() {
    const items = document.querySelectorAll('.gallery-card');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const title = item.dataset.title || '';
        const caption = item.dataset.caption || title;
        const img = item.querySelector('img');

        if (lightboxModal && lightboxCaption) {
          lightboxCaption.textContent = caption;
          if (lightboxImg && img) {
            lightboxImg.src = img.src;
            lightboxImg.alt = caption;
            lightboxImg.style.display = 'block';
          } else if (lightboxImg) {
            lightboxImg.style.display = 'none';
          }
          lightboxModal.classList.add('is-active');
          lightboxModal.setAttribute('aria-hidden', 'false');
          if (lightboxClose) lightboxClose.focus();
        }
      });
    });
  }

  attachLightboxListeners();

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
