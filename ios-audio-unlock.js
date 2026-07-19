
(() => {
  'use strict';

  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (!isiOS) return;

  let mediaBridge = null;
  let bridgeStarted = false;

  function makeQuietWavUrl() {
    const sampleRate = 8000;
    const seconds = 1;
    const samples = sampleRate * seconds;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);

    const write = (offset, text) => {
      for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
    };

    write(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    write(8, 'WAVE');
    write(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    write(36, 'data');
    view.setUint32(40, samples * 2, true);

    // Very quiet, non-zero tone. This opens iOS's media-audio route
    // without producing an audible extra sound.
    for (let i = 0; i < samples; i++) {
      const value = Math.round(Math.sin(2 * Math.PI * 220 * i / sampleRate) * 2);
      view.setInt16(44 + i * 2, value, true);
    }

    return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
  }

  async function startMediaBridge() {
    if (bridgeStarted) return;
    bridgeStarted = true;

    mediaBridge = document.createElement('audio');
    mediaBridge.setAttribute('playsinline', '');
    mediaBridge.setAttribute('webkit-playsinline', '');
    mediaBridge.loop = true;
    mediaBridge.preload = 'auto';
    mediaBridge.volume = 1;
    mediaBridge.src = makeQuietWavUrl();
    mediaBridge.style.display = 'none';
    document.body.appendChild(mediaBridge);

    try {
      await mediaBridge.play();
      document.documentElement.classList.add('ios-audio-ready');
    } catch {
      bridgeStarted = false;
    }
  }

  // Capture phase ensures this runs inside the same direct user gesture,
  // before the Web Audio button handler creates/resumes its AudioContext.
  document.addEventListener('pointerdown', startMediaBridge, { capture: true, once: false });
  document.addEventListener('touchstart', startMediaBridge, { capture: true, once: false, passive: true });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && mediaBridge && mediaBridge.paused) {
      mediaBridge.play().catch(() => {});
    }
  });
})();
