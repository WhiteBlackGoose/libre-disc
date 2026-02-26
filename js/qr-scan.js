// QR code scanner using device camera + BarcodeDetector API
// Falls back to manual URL paste if BarcodeDetector is unavailable

export function hasCameraSupport() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

export function hasBarcodeDetector() {
  return typeof BarcodeDetector !== 'undefined';
}

/**
 * Opens a camera overlay and scans for QR codes.
 * Returns a promise that resolves with the decoded text or null if cancelled.
 */
export function scanQR() {
  return new Promise((resolve) => {
    // Build overlay UI
    const overlay = document.createElement('div');
    overlay.className = 'qr-scan-overlay';
    overlay.innerHTML = `
      <div class="qr-scan-box">
        <div class="qr-scan-header">
          <span class="qr-scan-title">Scan QR Code</span>
          <button class="qr-scan-close">✕</button>
        </div>
        <div class="qr-scan-video-wrap">
          <video class="qr-scan-video" autoplay playsinline muted></video>
          <div class="qr-scan-crosshair"></div>
        </div>
        <div class="qr-scan-status">Starting camera…</div>
      </div>`;
    document.body.appendChild(overlay);

    const video = overlay.querySelector('video');
    const status = overlay.querySelector('.qr-scan-status');
    const closeBtn = overlay.querySelector('.qr-scan-close');
    let stream = null;
    let animFrame = null;
    let stopped = false;

    function cleanup() {
      stopped = true;
      if (animFrame) cancelAnimationFrame(animFrame);
      if (stream) stream.getTracks().forEach(t => t.stop());
      overlay.remove();
    }

    closeBtn.addEventListener('click', () => { cleanup(); resolve(null); });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { cleanup(); resolve(null); }
    });

    // Start camera
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
    }).then(async (s) => {
      stream = s;
      video.srcObject = s;
      await video.play();
      status.textContent = 'Point at a QR code…';

      if (!hasBarcodeDetector()) {
        status.textContent = 'BarcodeDetector not supported. Please paste the URL manually.';
        return;
      }

      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      async function tick() {
        if (stopped) return;
        if (video.readyState >= video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          try {
            const codes = await detector.detect(canvas);
            if (codes.length > 0) {
              cleanup();
              resolve(codes[0].rawValue);
              return;
            }
          } catch { /* ignore detection errors */ }
        }
        animFrame = requestAnimationFrame(tick);
      }
      tick();
    }).catch((err) => {
      status.textContent = 'Camera access denied or unavailable.';
      console.warn('QR scan camera error:', err);
    });
  });
}

/**
 * Parse a results URL to extract code and name.
 * Accepts full URL or just the code string.
 */
export function parseResultUrl(text) {
  text = text.trim();
  try {
    const url = new URL(text);
    const code = url.searchParams.get('r') || '';
    const name = url.searchParams.get('name') || '';
    return { code, name };
  } catch {
    // Not a URL — treat as raw code
    return { code: text, name: '' };
  }
}
