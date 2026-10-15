(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.Lenis) return;
  window.siteLenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.075, wheelMultiplier: 0.9 });
})();
