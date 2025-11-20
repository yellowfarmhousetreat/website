// Simple Overlay Menu Implementation
// Adapted from Test_Menu template to work with current HTML structure

(function () {
  // Open Sidebar
  function openNav() {
    const sidebar = document.querySelector('#overlay-menu');
    const openBtn = document.querySelector('.openbtn');
    const main = document.querySelector('#main');
    const closeNav = document.querySelector('#overlay-menu-close');
    
    if (sidebar) sidebar.style.cssText = "width: 30%;";
    if (openBtn) openBtn.style.cssText = "opacity: 0;";
    if (main) main.style.cssText = "margin-left: 0;";
    if (closeNav) closeNav.style.cssText = "opacity: 1; transition: 0.5s;";
  }

  // Close Sidebar
  function recolheBarraLateral() {
    const sidebar = document.querySelector('#overlay-menu');
    const main = document.querySelector('#main');
    const openBtn = document.querySelector('.openbtn');
    const closeNav = document.querySelector('#overlay-menu-close');
    
    if (sidebar) sidebar.style.cssText = "width: 0;";
    if (main) main.style.cssText = "margin-left: 0;";
    if (openBtn) openBtn.style.cssText = "opacity: 1;";
    if (closeNav) closeNav.style.cssText = "opacity: 0; transition: 0.5s;";
  }

  // Initialize event listeners when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    // Open button
    const openBtn = document.querySelector('#overlay-menu-open');
    if (openBtn) {
      openBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openNav();
      });
    }
    
    // Close button
    const closeBtn = document.querySelector('#overlay-menu-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        recolheBarraLateral();
      });
    }
    
    console.log('Overlay menu initialized');
  });
})();
