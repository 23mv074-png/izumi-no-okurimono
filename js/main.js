(() => {
  const STORAGE_KEY = 'izumi-no-okurimono-stamps';
  const TOTAL = 5;

  const readStamps = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(saved)
        ? [...new Set(saved.map(Number).filter(n => n >= 1 && n <= TOTAL))]
        : [];
    } catch (_) {
      return [];
    }
  };

  const saveStamps = stamps => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stamps));
  };

  const params = new URLSearchParams(window.location.search);
  const stampFromQr = Number(params.get('stamp'));
  let collected = readStamps();

  if (Number.isInteger(stampFromQr) && stampFromQr >= 1 && stampFromQr <= TOTAL) {
    if (!collected.includes(stampFromQr)) {
      collected.push(stampFromQr);
      collected.sort((a, b) => a - b);
      saveStamps(collected);
    }

    // QR用の ?stamp=1 などをURL欄から消して通常表示に戻す。
    params.delete('stamp');
    const query = params.toString();
    const cleanUrl = window.location.pathname + (query ? `?${query}` : '') + window.location.hash;
    history.replaceState(null, '', cleanUrl);
  }

  document.querySelectorAll('.stamp-item[data-stamp]').forEach(item => {
    const id = Number(item.dataset.stamp);
    item.classList.toggle('is-collected', collected.includes(id));
  });

  const count = document.getElementById('topStampCount');
  if (count) count.textContent = String(collected.length);

  // 既存メニューがある場合の開閉。
  const toggle = document.querySelector('.menu-toggle');
  const overlay = document.querySelector('.menu-overlay');
  if (toggle && overlay) {
    const closeMenu = () => {
      toggle.classList.remove('is-open');
      overlay.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
    };
    toggle.addEventListener('click', () => {
      const open = !toggle.classList.contains('is-open');
      toggle.classList.toggle('is-open', open);
      overlay.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      overlay.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('menu-open', open);
    });
    overlay.addEventListener('click', e => {
      if (e.target === overlay || e.target.closest('a')) closeMenu();
    });
  }
})();
