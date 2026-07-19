
(() => {
  'use strict';

  const sourceButton = document.getElementById('playBtn');
  const formButton = document.getElementById('formPlayBtn');
  if (!sourceButton || !formButton) return;

  let held = false;

  function forward(type, originalEvent) {
    const init = {
      bubbles: true,
      cancelable: true,
      pointerId: originalEvent.pointerId ?? 1,
      pointerType: originalEvent.pointerType || 'touch',
      isPrimary: true
    };

    let event;
    try {
      event = new PointerEvent(type, init);
    } catch {
      event = new Event(type, { bubbles: true, cancelable: true });
    }
    sourceButton.dispatchEvent(event);
  }

  function start(event) {
    event.preventDefault();
    if (held) return;
    held = true;
    formButton.classList.add('playing');
    formButton.textContent = '■ Release bells';
    forward('pointerdown', event);
    try { formButton.setPointerCapture(event.pointerId); } catch {}
  }

  function stop(event) {
    if (!held) return;
    if (event) event.preventDefault();
    held = false;
    formButton.classList.remove('playing');
    formButton.textContent = '▶ Hold to hear this harmony';
    forward('pointerup', event || {});
  }

  formButton.addEventListener('pointerdown', start);
  formButton.addEventListener('pointerup', stop);
  formButton.addEventListener('pointercancel', stop);
  formButton.addEventListener('lostpointercapture', stop);

  // Keep the lower button synchronized when playback ends elsewhere.
  window.addEventListener('blur', () => stop());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });
})();
