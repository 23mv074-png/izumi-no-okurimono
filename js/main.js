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
  let newlyAcquired = null;

  if (Number.isInteger(stampFromQr) && stampFromQr >= 1 && stampFromQr <= TOTAL) {
    if (!collected.includes(stampFromQr)) {
      collected.push(stampFromQr);
      collected.sort((a, b) => a - b);
      saveStamps(collected);
      newlyAcquired = stampFromQr;
    }

    params.delete('stamp');
    const query = params.toString();
    const cleanUrl =
      window.location.pathname + (query ? `?${query}` : '') + window.location.hash;
    history.replaceState(null, '', cleanUrl);
  }

  // HOMEとstamp.htmlの両方に対応
  document.querySelectorAll('.stamp-item[data-stamp], .collection-item[data-stamp]').forEach(item => {
    const id = Number(item.dataset.stamp);
    const isCollected = collected.includes(id);
    item.classList.toggle('is-collected', isCollected);

    // stamp.html の表示
    if (item.classList.contains('collection-item')) {
      const circle = item.querySelector('.stamp-circle');
      const img = circle?.querySelector('img');
      const status = item.querySelector('.stamp-status');

      if (circle) {
        let placeholder = circle.querySelector('.stamp-placeholder');

        if (isCollected) {
          if (img) img.style.display = '';
          if (placeholder) placeholder.remove();
        } else {
          if (img) img.style.display = 'none';
          if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'stamp-placeholder';
            placeholder.innerHTML = '<span class="find-question">?</span><span class="find-text">Find it.</span>';
            Object.assign(placeholder.style, {
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#d9dddc',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxSizing: 'border-box'
            });
            const q = placeholder.querySelector('.find-question');
            const f = placeholder.querySelector('.find-text');
            Object.assign(q.style, {
              fontSize: '2.1rem',
              lineHeight: '1',
              fontFamily: 'serif',
              marginBottom: '6px'
            });
            Object.assign(f.style, {
              fontSize: '0.68rem',
              letterSpacing: '0.08em'
            });
            circle.appendChild(placeholder);
          }
        }
      }

      if (status) {
        status.textContent = isCollected ? 'みつけた！' : '';
      }
    }
  });

  // HOME / stamp.html のカウントを同じ値にする
  ['topStampCount', 'stampCount'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(collected.length);
  });

  const message = document.getElementById('acquireMessage');
  if (message && newlyAcquired) {
    message.textContent = `スタンプ${newlyAcquired}を取得しました！`;
  }

  // stamp.html のエピローグボタン
  const epilogueButton = document.getElementById('epilogueButton');
  if (epilogueButton) {
    const label = epilogueButton.querySelector('.epilogue-label');
    const remaining = TOTAL - collected.length;

    if (remaining === 0) {
      epilogueButton.classList.remove('is-locked');
      epilogueButton.setAttribute('aria-disabled', 'false');
      epilogueButton.href = 'epilogue.html';
      if (label) label.textContent = '物語のつづきを読む';
    } else {
      epilogueButton.classList.add('is-locked');
      epilogueButton.setAttribute('aria-disabled', 'true');
      epilogueButton.href = '#';
      if (label) label.textContent = `あと${remaining}つ集めよう`;
      epilogueButton.addEventListener('click', e => e.preventDefault());
    }
  }

  // stamp.html のテスト用リセット
  const resetButton = document.getElementById('resetStamps');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    });
  }

  // メニュー開閉
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
