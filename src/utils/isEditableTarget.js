export function isEditableTarget(event) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return true
  const target = event.target
  if (!(target instanceof Element)) return false
  return Boolean(target.closest('a[href], button, input, select, summary, textarea, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="link"], [role="menuitem"], [role="option"], [role="radio"], [role="switch"], [role="tab"]'))
}
