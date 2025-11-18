/* perf.js - lightweight performance enhancements */
(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded', function() {
    // Lazy-load all images/iframes without explicit loading attr
    document.querySelectorAll('img:not([loading])').forEach(function(img){
      img.setAttribute('loading','lazy');
      if(!img.getAttribute('decoding')) img.setAttribute('decoding','async');
    });
    document.querySelectorAll('iframe:not([loading])').forEach(function(f){
      f.setAttribute('loading','lazy');
    });
    // Remove width/height auto layout shifts by setting natural dimensions if missing
    document.querySelectorAll('img').forEach(function(img){
      if(!img.hasAttribute('width') && img.naturalWidth) img.setAttribute('width', img.naturalWidth);
      if(!img.hasAttribute('height') && img.naturalHeight) img.setAttribute('height', img.naturalHeight);
    });
  });
})();
