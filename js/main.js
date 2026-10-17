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
  let scannedStamp = null;
  let alreadyCollected = false;
  let justCompleted = false;

  if (params.has('stamp') && Number.isInteger(stampFromQr) && stampFromQr >= 1 && stampFromQr <= TOTAL) {
    scannedStamp = stampFromQr;
    alreadyCollected = collected.includes(stampFromQr);
    if (!collected.includes(stampFromQr)) {
      collected.push(stampFromQr);
      collected.sort((a, b) => a - b);
      saveStamps(collected);
      newlyAcquired = stampFromQr;
      justCompleted = collected.length === TOTAL;
    }

    params.delete('stamp');
    const query = params.toString();
    const cleanUrl =
      window.location.pathname + (query ? `?${query}` : '') + window.location.hash;
    history.replaceState(null, '', cleanUrl);
  }

  // QR読み込み直後は、台紙より先に獲得演出を表示する。
  const reveal = document.getElementById('memoryReveal');
  if (reveal && scannedStamp !== null) {
    const title = document.getElementById('revealTitle');
    const img = document.getElementById('revealImage');
    const progress = document.getElementById('revealProgress');
    const button = document.getElementById('revealContinue');
    title.textContent = alreadyCollected ? 'この思い出はもう見つけたよ' : '思い出をひとつ見つけたよ';
    img.src = `images/memory${scannedStamp}.jpg`;
    progress.textContent = `${collected.length} / ${TOTAL} の思い出を集めたよ`;
    reveal.hidden = false;
    document.body.classList.add('reveal-open');
    button.addEventListener('click', () => {
      reveal.hidden = true;
      document.body.classList.remove('reveal-open');
      if (justCompleted) {
        const completion = document.getElementById('completionReveal');
        if (completion) {
          completion.hidden = false;
          document.body.classList.add('reveal-open');
          document.getElementById('completionContinue')?.focus({ preventScroll: true });
        }
      } else {
        document.querySelector('.stamp-collection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    button.focus({ preventScroll: true });
  }

  const completionContinue = document.getElementById('completionContinue');
  completionContinue?.addEventListener('click', () => {
    document.getElementById('completionReveal').hidden = true;
    document.body.classList.remove('reveal-open');
    window.location.href = 'reward.html';
  });

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
              borderRadius: '3px',
              background: '#e9e6dd',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8497a0',
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
    message.textContent = `思い出${newlyAcquired}を見つけました！`;
  }

  // stamp.html のエピローグボタン
  const epilogueButton = document.getElementById('epilogueButton');
  if (epilogueButton) {
    const label = epilogueButton.querySelector('.epilogue-label');
    const remaining = TOTAL - collected.length;

    if (remaining === 0) {
      epilogueButton.classList.remove('is-locked');
      epilogueButton.setAttribute('aria-disabled', 'false');
      epilogueButton.href = 'reward.html';
      if (label) label.textContent = 'ごほうびを受け取る';
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
      localStorage.removeItem('izumi-no-okurimono-reward-v1');
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
