// Multiple native dialogs can overlap during the menu -> assistant -> form handoff.
let owners = 0;
let originalOverflow = '';
export function lockPageScroll() {
  if (owners === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  owners += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    owners -= 1;
    if (owners === 0) document.body.style.overflow = originalOverflow;
  };
}
