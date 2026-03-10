/**
 * Global mouse position store - updated on every mousemove.
 * Used by Shader3 for hover animation since document listeners
 * can be more reliable than component-scoped listeners.
 */
export const mouseStore = {
  x: 0,
  y: 0,
};

if (typeof window !== 'undefined') {
  const handler = (e: MouseEvent) => {
    mouseStore.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseStore.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };
  window.addEventListener('mousemove', handler, { passive: true });
}
