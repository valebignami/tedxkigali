const toggle = document.querySelector<HTMLButtonElement>('#nav-toggle');
const nav = document.querySelector<HTMLElement>('#site-nav');

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav?.classList.toggle('hidden', open);
});
