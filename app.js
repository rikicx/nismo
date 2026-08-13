const loader = document.querySelector('.loader');
const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const hideLoader = () => {
  window.setTimeout(() => loader?.classList.add('is-hidden'), reducedMotion ? 0 : 1550);
};

if (document.readyState === 'complete') {
  hideLoader();
} else {
  window.addEventListener('load', hideLoader, { once: true });
}

const setHeaderState = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 20);
};

setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

const closeMenu = () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Abrir menu');
  mobileMenu?.setAttribute('aria-hidden', 'true');
  mobileMenu?.classList.remove('is-open');
  document.body.classList.remove('menu-open');
};

menuButton?.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(willOpen));
  menuButton.setAttribute('aria-label', willOpen ? 'Fechar menu' : 'Abrir menu');
  mobileMenu?.setAttribute('aria-hidden', String(!willOpen));
  mobileMenu?.classList.toggle('is-open', willOpen);
  document.body.classList.toggle('menu-open', willOpen);
});

mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

const serviceGroups = [...document.querySelectorAll('[data-service-group]')];
let activeService = null;
let activeServiceTrigger = null;
let serviceCloseTimer = null;
let activeServiceScrollY = 0;

const closeDesktopService = ({ restoreFocus = true } = {}) => {
  if (!activeService) return;

  const group = activeService;
  const trigger = activeServiceTrigger;
  const detail = group.querySelector('[data-service-detail]');

  window.clearTimeout(serviceCloseTimer);
  group.classList.add('is-closing');
  group.classList.remove('is-expanded');
  trigger?.setAttribute('aria-expanded', 'false');

  serviceCloseTimer = window.setTimeout(() => {
    group.classList.remove('is-active', 'is-closing');
    group.style.removeProperty('--clip-top');
    group.style.removeProperty('--clip-right');
    group.style.removeProperty('--clip-bottom');
    group.style.removeProperty('--clip-left');
    detail?.setAttribute('aria-hidden', 'true');
    if (trigger) trigger.tabIndex = 0;
    document.body.classList.remove('service-open');
    window.scrollTo(0, activeServiceScrollY);
    if (restoreFocus) trigger?.focus({ preventScroll: true });
  }, reducedMotion ? 0 : 700);

  activeService = null;
  activeServiceTrigger = null;
};

const openDesktopService = (group, trigger) => {
  if (activeService) closeDesktopService({ restoreFocus: false });

  const rect = group.getBoundingClientRect();
  const detail = group.querySelector('[data-service-detail]');
  const closeButton = group.querySelector('[data-service-close]');

  activeServiceScrollY = window.scrollY;
  group.style.setProperty('--clip-top', `${Math.max(0, rect.top)}px`);
  group.style.setProperty('--clip-right', `${Math.max(0, window.innerWidth - rect.right)}px`);
  group.style.setProperty('--clip-bottom', `${Math.max(0, window.innerHeight - rect.bottom)}px`);
  group.style.setProperty('--clip-left', `${Math.max(0, rect.left)}px`);
  group.classList.add('is-active');
  trigger.setAttribute('aria-expanded', 'true');
  trigger.tabIndex = -1;
  detail?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('service-open');
  activeService = group;
  activeServiceTrigger = trigger;

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => group.classList.add('is-expanded'));
  });

  window.setTimeout(() => closeButton?.focus({ preventScroll: true }), reducedMotion ? 0 : 680);
};

serviceGroups.forEach((group) => {
  const trigger = group.querySelector('[data-service-trigger]');
  const closeButton = group.querySelector('[data-service-close]');

  trigger?.addEventListener('click', () => {
    openDesktopService(group, trigger);
  });

  closeButton?.addEventListener('click', () => closeDesktopService());
});

window.addEventListener('resize', () => closeDesktopService({ restoreFocus: false }));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
    closeDesktopService();
  }

  if (event.key !== 'Tab' || !activeService) return;

  const focusable = [...activeService.querySelectorAll('button:not([tabindex="-1"]), a[href]')].filter((item) => !item.hasAttribute('disabled'));
  const first = focusable[0];
  const last = focusable.at(-1);

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
});

const revealItems = document.querySelectorAll('.reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -7% 0px' },
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
    observer.observe(item);
  });
}

document.querySelectorAll('[data-year]').forEach((item) => {
  item.textContent = new Date().getFullYear();
});
