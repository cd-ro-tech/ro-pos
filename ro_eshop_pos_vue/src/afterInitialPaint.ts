export function afterInitialPaint(callback: () => void) {
  requestAnimationFrame(() => requestAnimationFrame(callback));
}
