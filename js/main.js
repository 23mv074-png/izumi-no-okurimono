document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "izumiCollectedStamps";

  const getStamps = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved.map(Number).filter(n => n >= 1 && n <= 5) : [];
    } catch {
      return [];
    }
  };

  const saveStamps = (stamps) => {
    const unique = [...new Set(stamps)].sort((a, b) => a - b);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    return unique;
  };

  // Hamburger menu
  const toggle = document.querySelector(".menu-toggle");
  const overlay = document.querySelector(".menu-overlay");

  const closeMenu = () => {
    if (!toggle || !overlay) return;
    toggle.classList.remove("is-open");
    overlay.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "メニューを開く");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  };

  if (toggle && overlay) {
    toggle.addEventListener("click", () => {
      const willOpen = !overlay.classList.contains("is-open");
      if (willOpen) {
        toggle.classList.add("is-open");
        overlay.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "メニューを閉じる");
        overlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("menu-open");
      } else {
        closeMenu();
      }
    });

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeMenu();
    });

    overlay.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });
  }

  // TOP stamp status
  const stamps = getStamps();
  const topCount = document.getElementById("topStampCount");
  if (topCount) topCount.textContent = stamps.length;

  document.querySelectorAll(".stamp-item").forEach((item, index) => {
    if (stamps.includes(index + 1)) {
      item.classList.add("is-collected");
    }
  });

  // stamp.html: acquire a stamp through ?stamp=1 ... ?stamp=5
  const params = new URLSearchParams(window.location.search);
  const stampNumber = Number(params.get("stamp"));
  let currentStamps = stamps;

  if (
    document.body.classList.contains("stamp-page") &&
    Number.isInteger(stampNumber) &&
    stampNumber >= 1 &&
    stampNumber <= 5
  ) {
    const alreadyHad = currentStamps.includes(stampNumber);
    currentStamps = saveStamps([...currentStamps, stampNumber]);

    const message = document.getElementById("acquireMessage");
    if (message) {
      message.textContent = alreadyHad
        ? `スタンプ${stampNumber}は取得済みです。`
        : `スタンプ${stampNumber}を取得しました！`;
      message.classList.add("show");
    }

    history.replaceState({}, "", "stamp.html");
  }

  const count = document.getElementById("stampCount");
  if (count) count.textContent = currentStamps.length;

  document.querySelectorAll("[data-stamp]").forEach(item => {
    const n = Number(item.dataset.stamp);
    if (currentStamps.includes(n)) {
      item.classList.add("is-collected");
      const status = item.querySelector(".stamp-status");
      if (status) status.textContent = "GET!";
    }
  });

  const epilogueButton = document.getElementById("epilogueButton");
  if (epilogueButton) {
    if (currentStamps.length === 5) {
      epilogueButton.classList.remove("is-locked");
      epilogueButton.href = "epilogue.html";
      epilogueButton.setAttribute("aria-disabled", "false");
      epilogueButton.querySelector(".epilogue-label").textContent = "エピローグを読む";
    } else {
      epilogueButton.addEventListener("click", (event) => event.preventDefault());
    }
  }

  // Development/testing reset button
  const resetButton = document.getElementById("resetStamps");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      if (window.confirm("取得したスタンプをすべてリセットしますか？")) {
        localStorage.removeItem(STORAGE_KEY);
        window.location.href = "stamp.html";
      }
    });
  }
});
