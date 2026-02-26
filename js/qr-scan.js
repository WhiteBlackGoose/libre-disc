// QR code scanner using device camera
// Uses BarcodeDetector (Chromium) with jsQR fallback (all browsers)

export function hasCameraSupport() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

let jsQRLoaded = null;
function loadJsQR() {
  if (jsQRLoaded) return jsQRLoaded;
  jsQRLoaded = new Promise((resolve, reject) => {
    if (typeof window.jsQR === 'function') { resolve(window.jsQR); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
    s.onload = () => resolve(window.jsQR);
    s.onerror = () => reject(new Error('Failed to load QR scanner library'));
    document.head.appendChild(s);
  });
  return jsQRLoaded;
}

function createDetector() {
  if (typeof BarcodeDetector !== 'undefined') {
    const bd = new BarcodeDetector({ formats: ['qr_code'] });
    return {
      detect: async (canvas, ctx) => {
        const codes = await bd.detect(canvas);
        return codes.length > 0 ? codes[0].rawValue : null;
      }
    };
  }
  return null;
}

function createJsQRDetector(jsQR) {
  return {
    detect: (canvas, ctx) => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, canvas.width, canvas.height);
      return result ? result.data : null;
    }
  };
}

/**
 * Opens a camera overlay and scans for QR codes.
 * Returns a promise that resolves with the decoded text or null if cancelled.
 */
export function scanQR() {
  return new Promise((resolve) => {
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

    // Start camera and QR detection in parallel
    const cameraP = navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
    });
    const detectorP = (async () => {
      const native = createDetector();
      if (native) return native;
      const jsQR = await loadJsQR();
      return createJsQRDetector(jsQR);
    })();

    Promise.all([cameraP, detectorP]).then(async ([s, detector]) => {
      stream = s;
      video.srcObject = s;
      await video.play();
      status.textContent = 'Point at a QR code…';

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      async function tick() {
        if (stopped) return;
        if (video.readyState >= video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          try {
            const value = await detector.detect(canvas, ctx);
            if (value) { cleanup(); resolve(value); return; }
          } catch { /* ignore detection errors */ }
        }
        animFrame = requestAnimationFrame(tick);
      }
      tick();
    }).catch((err) => {
      status.textContent = 'Camera access denied or unavailable.';
      console.warn('QR scan error:', err);
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
