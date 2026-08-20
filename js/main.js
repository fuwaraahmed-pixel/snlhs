/**
 * Shahera Nayeb Laboratory School
 * Core Interactive Scripts (Mobile Nav, Sticky Header, Scroll Interactions)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const mobileToggleBtn = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('primaryNavMenu');

  if (mobileToggleBtn && navMenu) {
    mobileToggleBtn.addEventListener('click', () => {
      const isExpanded = mobileToggleBtn.getAttribute('aria-expanded') === 'true';
      mobileToggleBtn.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('is-active');
    });

    // Close mobile nav menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-active')) {
        navMenu.classList.remove('is-active');
        mobileToggleBtn.setAttribute('aria-expanded', 'false');
        mobileToggleBtn.focus();
      }
    });
  }

  // Active Link Highlight matching current path
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });

  // Sticky Header elevation shadow on scroll
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        siteHeader.style.boxShadow = 'var(--shadow-md)';
      } else {
        siteHeader.style.boxShadow = 'var(--shadow-sm)';
      }
    }, { passive: true });
  }
});
