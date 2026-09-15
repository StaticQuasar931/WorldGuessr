const disableAds = () => {
  // This build is intended to run without commercial ad integrations.
  // Keep the game and Google Street View available, but remove ad SDK hooks
  // and containers if a cached or embedded script tries to add them.
  const adScriptPattern = /adsense|adsbygoogle|doubleclick|googlesyndication|gamedistribution|playwire|crazygames|poki/i;
  const adNodePattern = /gdsdk__advertisement|playwire-ad-slot|topAdFixed|adsbygoogle|advertisement|ad-container/i;
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






