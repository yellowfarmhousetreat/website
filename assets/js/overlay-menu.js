const initOverlayMenu = () => {
  const overlayWrapper = document.querySelector('.overlay-menu');
  const overlayMenu = document.getElementById('overlay-menu');
  const overlayOpenBtn = document.getElementById('overlay-menu-open');
  const overlayCloseBtn = document.getElementById('overlay-menu-close');
  const focusableSelector = 'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let currentFocusableItems = [];
  let overlayHideTimer = null;

  if (!overlayWrapper || !overlayMenu || !overlayOpenBtn || !overlayCloseBtn) {
    return;
  }

  overlayMenu.setAttribute('role', 'dialog');
  overlayMenu.setAttribute('aria-modal', 'false');
  overlayMenu.hidden = true;
  overlayMenu.classList.remove('is-open');

  const overlayTriggers = overlayWrapper.querySelectorAll('.overlay-accordion__trigger');
  const overlayPanels = overlayWrapper.querySelectorAll('.overlay-accordion__panel');

  const refreshFocusableItems = () => {
    currentFocusableItems = Array.from(overlayMenu.querySelectorAll(focusableSelector)).filter((el) => {
      if (el.hasAttribute('disabled')) return false;
      if (el.getAttribute('aria-hidden') === 'true') return false;
      const hasVisibleBox = el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
      return hasVisibleBox || el === document.activeElement;
    });
  };

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

  const openOverlayMenu = () => {
    overlayMenu.hidden = false;
    window.requestAnimationFrame(() => {
      overlayMenu.classList.add('is-open');
      refreshFocusableItems();
      if (currentFocusableItems.length === 0) {
        overlayCloseBtn.focus();
      } else {
        currentFocusableItems[0].focus();
      }
    });
  };

  const closeOverlayMenu = () => {
    overlayMenu.classList.remove('is-open');
    closeOverlayPanels();
    overlayHideTimer = window.setTimeout(() => {
      overlayMenu.hidden = true;
    }, 320);
  };

  const setOverlayState = (isOpen) => {
    window.clearTimeout(overlayHideTimer);
    overlayMenu.setAttribute('aria-modal', String(isOpen));
    overlayOpenBtn.classList.toggle('is-hidden', isOpen);
    overlayOpenBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('overlay-menu-open', isOpen);
    if (isOpen) {
      openOverlayMenu();
    } else {
      closeOverlayMenu();
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
    const isOpen = overlayMenu.classList.contains('is-open');
    if (!isOpen) {
      return;
    }

    if (event.key === 'Escape') {
      setOverlayState(false);
      overlayOpenBtn.focus();
      return;
    }

    if (event.key === 'Tab') {
      refreshFocusableItems();
      if (!currentFocusableItems.length) {
        event.preventDefault();
        overlayCloseBtn.focus();
        return;
      }

      const firstElement = currentFocusableItems[0];
      const lastElement = currentFocusableItems[currentFocusableItems.length - 1];
      const isShiftPressed = event.shiftKey;
      const activeElement = document.activeElement;
      const activeIndex = currentFocusableItems.indexOf(activeElement);

      if (activeIndex === -1) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      if (!isShiftPressed && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      } else if (isShiftPressed && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
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
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOverlayMenu);
} else {
  initOverlayMenu();
}
