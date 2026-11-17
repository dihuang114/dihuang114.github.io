/* Keep one fallback family until both complete font files are available. */
(function () {
  'use strict';
  if (!document.fonts || !document.fonts.load) return;
  var waiting = true;
  var timeout = setTimeout(function () { waiting = false; }, 8000);
  Promise.all([
    document.fonts.load('400 20px "DH Writing Serif"'),
    document.fonts.load('700 20px "DH Writing Serif"')
  ]).then(function (weights) {
    if (waiting && weights.every(function (faces) {
      return faces.length > 0 && faces.every(function (face) { return face.status === 'loaded'; });
    })) document.documentElement.classList.add('writing-font-ready');
    clearTimeout(timeout);
  }).catch(function () {
    clearTimeout(timeout);
    // Failed fonts leave readable system text for the entire page visit.
  });
})();
