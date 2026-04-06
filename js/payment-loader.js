(function () {
  if (window.PaymentBuffer) return;

  var overlay = null;
  var textEl = null;
  var activeCount = 0;
  var autoHideTimer = null;

  function injectStyles() {
    if (document.getElementById('payment-buffer-style')) return;

    var style = document.createElement('style');
    style.id = 'payment-buffer-style';
    style.textContent = [
      '.payment-buffer{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(7,26,40,.42);backdrop-filter:blur(3px);z-index:99999;opacity:0;visibility:hidden;transition:opacity .2s ease,visibility .2s ease;}',
      '.payment-buffer.open{opacity:1;visibility:visible;}',
      '.payment-buffer-card{background:#ffffff;border-radius:16px;padding:20px 22px;min-width:240px;max-width:86vw;box-shadow:0 18px 48px rgba(0,0,0,.2);display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;}',
      '.payment-buffer-spinner{width:34px;height:34px;border:3px solid #d8e7f1;border-top-color:#0a5c8a;border-radius:50%;animation:payment-buffer-spin .75s linear infinite;}',
      '.payment-buffer-text{margin:0;color:#163042;font-family:inherit;font-size:.92rem;font-weight:600;line-height:1.35;}',
      '.payment-buffer-lock{overflow:hidden !important;}',
      '@keyframes payment-buffer-spin{to{transform:rotate(360deg);}}'
    ].join('');

    document.head.appendChild(style);
  }

  function ensureOverlay() {
    injectStyles();
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.className = 'payment-buffer';
    overlay.innerHTML = [
      '<div class="payment-buffer-card" role="status" aria-live="polite" aria-busy="true">',
      '<div class="payment-buffer-spinner"></div>',
      '<p class="payment-buffer-text">Processing your request...</p>',
      '</div>'
    ].join('');

    textEl = overlay.querySelector('.payment-buffer-text');
    document.body.appendChild(overlay);
  }

  function show(message) {
    ensureOverlay();

    if (message && textEl) {
      textEl.textContent = message;
    }

    activeCount += 1;
    overlay.classList.add('open');
    document.body.classList.add('payment-buffer-lock');
  }

  function hide() {
    if (activeCount > 0) {
      activeCount -= 1;
    }

    if (activeCount > 0 || !overlay) {
      return;
    }

    overlay.classList.remove('open');
    document.body.classList.remove('payment-buffer-lock');
  }

  async function withBuffer(task, options) {
    var opts = options || {};
    var message = opts.message || 'Processing your payment...';
    var minDuration = typeof opts.minDuration === 'number' ? opts.minDuration : 1200;
    var startedAt = Date.now();

    show(message);
    try {
      return await task();
    } finally {
      var elapsed = Date.now() - startedAt;
      var remaining = minDuration - elapsed;
      if (remaining > 0) {
        await new Promise(function (resolve) {
          setTimeout(resolve, remaining);
        });
      }
      hide();
    }
  }

  function setupAutoDemo() {
    document.addEventListener('click', function (event) {
      var trigger = event.target && event.target.closest
        ? event.target.closest('button,a,[role="button"]')
        : null;

      if (!trigger || trigger.dataset.buffer === 'off' || trigger.disabled || activeCount > 0) {
        return;
      }

      var text = ((trigger.textContent || '') + ' ' + (trigger.getAttribute('aria-label') || '')).toLowerCase();
      if (!/(pay|payment|checkout|place order|proceed)/.test(text)) {
        return;
      }

      show('Please wait, processing...');
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
      autoHideTimer = setTimeout(function () {
        hide();
        autoHideTimer = null;
      }, 900);
    }, true);
  }

  window.PaymentBuffer = {
    show: show,
    hide: hide,
    withBuffer: withBuffer,
    isActive: function () {
      return activeCount > 0;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAutoDemo);
  } else {
    setupAutoDemo();
  }
})();
