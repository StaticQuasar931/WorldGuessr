const disableAds = () => {
  // This build is intended to run without commercial ad integrations.
  // Keep the game and Google Street View available, but remove ad SDK hooks
  // and containers if a cached or embedded script tries to add them.
  const adScriptPattern = /adsense|adsbygoogle|doubleclick|googlesyndication|gamedistribution|playwire|crazygames|poki/i;
  const adNodePattern = /gdsdk__advertisement|playwire-ad-slot|topAdFixed|adsbygoogle|advertisement|ad-container/i;
  const isBlockedAdScript = node => node && node.tagName === 'SCRIPT' && adScriptPattern.test(node.src || node.getAttribute?.('src') || '');
  const originalAppendChild = Node.prototype.appendChild;
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.appendChild = function (node) {
    return isBlockedAdScript(node) ? node : originalAppendChild.call(this, node);
  };
  Node.prototype.insertBefore = function (node, reference) {
    return isBlockedAdScript(node) ? node : originalInsertBefore.call(this, node, reference);
  };
  const removeAds = (root = document) => {
    root.querySelectorAll('script[src], iframe, ins, [id], [class]').forEach(node => {
      const src = node.getAttribute('src') || '';
      const id = node.id || '';
      const className = typeof node.className === 'string' ? node.className : '';
      if (adScriptPattern.test(src) || adNodePattern.test(`${id} ${className}`)) node.remove();
    });
  };
  removeAds();
  window.adBreak = options => {
    if (options && typeof options.adBreakDone === 'function') setTimeout(() => options.adBreakDone({}), 0);
  };
  window.adConfig = () => {};
  window.requestGDInterstitial = callback => {
    if (typeof callback === 'function') setTimeout(callback, 0);
  };
  const observer = new MutationObserver(() => removeAds());
  observer.observe(document.documentElement, { childList: true, subtree: true });
};

const initStaticMenu = () => {
  disableAds();
  'use strict';
  const installSettingsFallback = () => {
    const openSettings = () => {
      let panel = document.getElementById('staticSettingsFallback');
      if (!panel) {
        panel = document.createElement('section');
        panel.id = 'staticSettingsFallback';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-labelledby', 'staticSettingsTitle');
        panel.innerHTML = '<div class="static-settings-card"><div class="static-settings-head"><h2 id="staticSettingsTitle">Settings</h2><button type="button" id="staticSettingsClose" aria-label="Close settings">×</button></div><label for="staticMusicVolume">Music volume <output id="staticMusicValue"></output></label><input id="staticMusicVolume" type="range" min="0" max="100" step="1"><label for="staticSfxVolume">Sound effects <output id="staticSfxValue"></output></label><input id="staticSfxVolume" type="range" min="0" max="100" step="1"><p class="static-settings-note">Your settings are saved on this device.</p></div>';
        document.body.appendChild(panel);
        const read = (key, fallback) => {
          const value = Number.parseFloat(localStorage.getItem(key));
          return Number.isFinite(value) ? Math.round(value * 100) : fallback;
        };
        const bind = (id, outputId, key) => {
          const input = panel.querySelector(`#${id}`);
          const output = panel.querySelector(`#${outputId}`);
          const update = () => {
            const percent = Number(input.value);
            output.value = `${percent}%`;
            localStorage.setItem(key, String(percent / 100));
            window.dispatchEvent(new CustomEvent('worldguessr-volume-change', { detail: { key, value: percent / 100 } }));
          };
          input.value = String(read(key, 50));
          input.addEventListener('input', update);
          update();
        };
        bind('staticMusicVolume', 'staticMusicValue', 'musicVolume');
        bind('staticSfxVolume', 'staticSfxValue', 'sfxVolume');
        panel.querySelector('#staticSettingsClose').addEventListener('click', () => { panel.hidden = true; });
        panel.addEventListener('click', event => { if (event.target === panel) panel.hidden = true; });
      }
      panel.hidden = false;
      panel.querySelector('#staticSettingsClose')?.focus();
    };
    document.addEventListener('click', event => {
      const settingsButton = event.target.closest?.('button[aria-label="Settings"]');
      if (!settingsButton) return;
      event.preventDefault();
      event.stopPropagation();
      openSettings();
    }, true);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') document.getElementById('staticSettingsFallback')?.setAttribute('hidden', '');
    });
  };
  installSettingsFallback();
  let menu = document.getElementById('staticMenu');
  if (!menu) {
    menu = document.createElement('aside');
    menu.id = 'staticMenu';
    menu.dataset.buildMarker = 'SQ931-WG-7K4F';
    menu.innerHTML = '<a id="staticGamesLink" target="_blank" rel="noopener noreferrer">More unblocked games by Static</a><button id="closeStaticMenu" type="button" aria-label="Hide menu">×</button>';
    document.body.appendChild(menu);
  }
  const close = menu.querySelector('#closeStaticMenu');
  const link = menu.querySelector('#staticGamesLink');
  if (!close || !link) return;

  const destination = 'https://sites.google.com/view/staticquasar931/gm3z';
  const params = new URLSearchParams({
    utm_source: 'worldguessr',
    utm_medium: 'static_menu',
    utm_campaign: 'static_games'
  });
  const target = new URL(destination);
  params.forEach((value, key) => target.searchParams.set(key, value));
  link.href = target.toString();

  let manuallyHiddenUntil = 0;
  const isAllowedScreen = () => {
    const loading = document.querySelector('.loading-overlay--visible');
    const mainMenu = document.querySelector('.home__content.cshown');
    const activeGame = document.querySelector('.gameUI:not(.hidden)');
    return !activeGame && Boolean(loading || mainMenu);
  };
  const syncVisibility = () => {
    menu.hidden = Date.now() < manuallyHiddenUntil || !isAllowedScreen();
  };
  new MutationObserver(syncVisibility).observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });
  syncVisibility();

  const hideTemporarily = (event) => {
    event.preventDefault();
    event.stopPropagation();
    manuallyHiddenUntil = Date.now() + 180000;
    menu.hidden = true;
    window.setTimeout(syncVisibility, 180000);
  };
  close.addEventListener('pointerdown', hideTemporarily);
  close.addEventListener('click', hideTemporarily);

  let keySequence = '';
  // Type Y, U, I to toggle the static menu without adding another control.
  document.addEventListener('keydown', (event) => {
    if (event.key.length !== 1) return;
    keySequence = (keySequence + event.key.toLowerCase()).slice(-3);
    if (keySequence === 'yui') {
      manuallyHiddenUntil = menu.hidden ? 0 : Date.now() + 86400000;
      syncVisibility();
      keySequence = '';
    }
  });
};

// Wait until Next has hydrated before adding the menu outside its app root.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStaticMenu, { once: true });
} else {
  initStaticMenu();
}






