document.addEventListener('DOMContentLoaded', () => {
  const overlayWrapper = document.querySelector('.overlay-menu');
  const overlayMenu = document.getElementById('overlay-menu');
  const overlayOpenBtn = document.getElementById('overlay-menu-open');
  const overlayCloseBtn = document.getElementById('overlay-menu-close');

  if (!overlayWrapper || !overlayMenu || !overlayOpenBtn || !overlayCloseBtn) {
    return;
  }

  const overlayTriggers = overlayWrapper.querySelectorAll('.overlay-accordion__trigger');
  const overlayPanels = overlayWrapper.querySelectorAll('.overlay-accordion__panel');

  const closeOverlayPanels = () => {
    overlayPanels.forEach(panel => panel.classList.remove('is-open'));
    overlayTriggers.forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));
  };

  const highlightTarget = (targetEl) => {
    if (!targetEl) return;
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    targetEl.classList.add('menu-section-highlight');
    setTimeout(() => targetEl.classList.remove('menu-section-highlight'), 1200);
  };

  const tryScrollNavigation = (link) => {
    const targetId = link.getAttribute('data-scroll-target');
    if (!targetId) return false;
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return false;
    highlightTarget(targetEl);
    return true;
  };

  const setOverlayState = (isOpen) => {
    overlayMenu.classList.toggle('is-open', isOpen);
    overlayMenu.setAttribute('aria-hidden', String(!isOpen));
    overlayOpenBtn.classList.toggle('is-hidden', isOpen);
    overlayOpenBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('overlay-menu-open', isOpen);
    if (isOpen) {
      overlayCloseBtn.focus();
    } else {
      closeOverlayPanels();
    }
  };

  overlayOpenBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    setOverlayState(true);
  });

  overlayCloseBtn.addEventListener('click', () => {
    setOverlayState(false);
    overlayOpenBtn.focus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlayMenu.classList.contains('is-open')) {
      setOverlayState(false);
      overlayOpenBtn.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!overlayMenu.classList.contains('is-open')) return;
    const isClickInside = overlayMenu.contains(event.target);
    const isToggle = overlayOpenBtn.contains(event.target);
    if (!isClickInside && !isToggle) {
      setOverlayState(false);
    }
  });

  overlayTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.getAttribute('aria-controls');
      const targetPanel = document.getElementById(targetId);
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      closeOverlayPanels();

      if (!isOpen && targetPanel) {
        trigger.setAttribute('aria-expanded', 'true');
        targetPanel.classList.add('is-open');
      }
    });
  });

  const overlayLinks = overlayWrapper.querySelectorAll('.overlay-accordion__panel a[href]');
  overlayLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      const isSamePageHandled = tryScrollNavigation(link);
      const href = link.getAttribute('href') || '';
      const isMenuPage = document.body.dataset.page === 'menu';

      if (isSamePageHandled) {
        event.preventDefault();
        setOverlayState(false);
        return;
      }

      if (isMenuPage && href.startsWith('menu.html#')) {
        const fragment = href.split('#')[1];
        const targetEl = fragment ? document.getElementById(fragment) : null;
        if (targetEl) {
          event.preventDefault();
          highlightTarget(targetEl);
          setOverlayState(false);
          return;
        }
      }

      if (href.startsWith('#')) {
        const targetEl = document.getElementById(href.slice(1));
        if (targetEl) {
          event.preventDefault();
          highlightTarget(targetEl);
        }
      }

      setOverlayState(false);
    });
  });
});
