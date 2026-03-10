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
  const update = (clientX: number, clientY: number) => {
    mouseStore.x = (clientX / window.innerWidth) * 2 - 1;
    mouseStore.y = -(clientY / window.innerHeight) * 2 + 1;
  };
  const mouseHandler = (e: MouseEvent) => update(e.clientX, e.clientY);
  const pointerHandler = (e: PointerEvent) => update(e.clientX, e.clientY);
  window.addEventListener('mousemove', mouseHandler, { passive: true });
  window.addEventListener('pointermove', pointerHandler, { passive: true });
}
