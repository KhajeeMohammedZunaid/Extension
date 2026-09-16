/**
 * Robust dual-engine clipboard copy utility.
 * Attempts asynchronous navigator.clipboard first; seamlessly falls back
 * to document.execCommand('copy') via a focused, document-level textarea.
 */
export async function copyToClipboard(text: string | null | undefined): Promise<boolean> {
  if (text === null || text === undefined) return false;
  const str = String(text);
  if (!str) return false;

  try {
    if (typeof window !== 'undefined' && window.focus) {
      window.focus();
    }
  } catch (_) {}

  // 1. Try modern asynchronous Clipboard API
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(str);
      return true;
    } catch (_) {
      // Fall through to fallback
    }
  }

  // 2. Bulletproof execCommand fallback (MUST NOT have readonly or pointer-events: none)
  try {
    const ta = document.createElement('textarea');
    ta.value = str;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '-9999px';
    ta.style.width = '2em';
    ta.style.height = '2em';
    ta.style.padding = '0';
    ta.style.border = 'none';
    ta.style.outline = 'none';
    ta.style.boxShadow = 'none';
    ta.style.background = 'transparent';
    ta.setAttribute('aria-hidden', 'true');

    const target = document.body || document.documentElement;
    target.appendChild(ta);
    ta.focus({ preventScroll: true });
    ta.select();

    let successful = false;
    try {
      successful = document.execCommand('copy');
    } catch (_) {
      successful = false;
    }

    ta.remove();
    return successful;
  } catch (_) {
    return false;
  }
}
