(() => {
  'use strict';
  const STAMPS = 'izumi-no-okurimono-stamps';
  const REWARD = 'izumi-no-okurimono-reward-v1';
  const $ = id => document.getElementById(id);
  let stamps = [];
  try { const parsed = JSON.parse(localStorage.getItem(STAMPS) || '[]'); if (Array.isArray(parsed)) stamps = [...new Set(parsed.map(Number).filter(n => Number.isInteger(n) && n >= 1 && n <= 5))]; } catch (_) {}
  const show = id => { ['locked','draw','reveal','result'].forEach(k => $(k).hidden = k !== id); };
  if (stamps.length !== 5) { show('locked'); return; }
  const saved = Number(localStorage.getItem(REWARD));
  const result = n => {
    $('wallpaper').src = `images/wallpaper${n}.png`;
    $('saveLink').href = `images/wallpaper${n}.png`;
    $('saveLink').setAttribute('download', `izumi-wallpaper-${n}.png`);
    show('result');
  };
  if (Number.isInteger(saved) && saved >= 1 && saved <= 3) { result(saved); return; }
  show('draw');
  $('drawButton').addEventListener('click', () => {
    $('drawButton').disabled = true;
    const bytes = new Uint32Array(1);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
    else bytes[0] = Math.floor(Math.random() * 0x100000000);
    const chosen = (bytes[0] % 3) + 1;
    localStorage.setItem(REWARD, String(chosen));
    show('reveal');
    window.setTimeout(() => result(chosen), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 300 : 2400);
  }, { once:true });
})();