(() => {
  'use strict';
  const menu = document.getElementById('staticMenu');
  const close = document.getElementById('closeStaticMenu');
  const link = document.getElementById('staticGamesLink');
  if (!menu || !close || !link) return;

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
})();





