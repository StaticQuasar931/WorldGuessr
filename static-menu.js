const initStaticMenu = () => {
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






