import { ExtractedColors, ExtractedTypography, ExtractedAssets, ColorToken, TypographyTag, FontFamilyInfo, ImageAsset, BackgroundAsset, SvgAsset, VideoAsset } from '../types';
import { ensureSvgXmlns } from './exportGenerators';

/* ── Helpers ── */
function parseRgb(v: string): [number, number, number] | null {
  if (!v) return null;
  const m = v.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  return m ? [+m[1], +m[2], +m[3]] : null;
}

function toHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function isTransparent(v: string): boolean {
  if (!v || v === 'transparent' || v === 'none' || v === 'rgba(0, 0, 0, 0)') return true;
  const m = v.match(/rgba\([^)]+,\s*([\d.]+)\)/);
  return m ? +m[1] < 0.04 : false;
}

function hex2hsl(hex: string): string {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function fname(url: string): string {
  try {
    const u = new URL(url);
    const p = u.pathname.split('/').pop();
    return p || url.slice(-20);
  } catch {
    return url.slice(-30);
  }
}

function ext(url: string): string {
  const n = fname(url);
  const i = n.lastIndexOf('.');
  return i > -1 ? n.slice(i + 1).toLowerCase().split('?')[0] : 'img';
}

function toAbsUrl(u: string): string {
  if (!u) return '';
  try {
    return new URL(u, window.location.href).href;
  } catch (_) {
    return u;
  }
}

/* ══════════════════════════════════════════════════════════════════
   1. COLOR EXTRACTION
══════════════════════════════════════════════════════════════════ */
export function extractColors(): ExtractedColors {
  const map = new Map<string, { count: number; r: number; g: number; b: number }>();
  const gradients: string[] = [];

  const add = (raw: string) => {
    if (!raw || isTransparent(raw)) return;
    const rgb = parseRgb(raw);
    if (!rgb) return;
    const [r, g, b] = rgb;
    const hex = toHex(r, g, b).toLowerCase();
    const cur = map.get(hex);
    if (cur) cur.count++;
    else map.set(hex, { count: 1, r, g, b });
  };

  const all = Array.from(document.querySelectorAll('*')).slice(0, 1500);
  for (const el of all) {
    // Skip Prism and Mesurer UI
    if (el.closest('#prism-host') || el.closest('#mesurer-extension-host')) continue;
    try {
      const cs = window.getComputedStyle(el);
      add(cs.color);
      add(cs.backgroundColor);
      if (cs.borderTopWidth && parseInt(cs.borderTopWidth, 10) > 0) add(cs.borderTopColor);

      const bg = cs.backgroundImage;
      if (bg && bg.includes('gradient') && !gradients.includes(bg)) {
        gradients.push(bg);
      }
    } catch (_) {}
  }

  const sorted: ColorToken[] = Array.from(map.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 36)
    .map(([hex, d]) => ({
      hex,
      count: d.count,
      hsl: hex2hsl(hex),
      r: d.r,
      g: d.g,
      b: d.b
    }));

  return { colors: sorted, gradients: gradients.slice(0, 10) };
}

/* ══════════════════════════════════════════════════════════════════
   2. TYPOGRAPHY EXTRACTION
══════════════════════════════════════════════════════════════════ */
export function extractTypography(): ExtractedTypography {
  const families = new Map<string, { count: number; weights: Set<string> }>();
  const tags: TypographyTag[] = [];
  const inspectTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button'];

  for (const tag of inspectTags) {
    const els = Array.from(document.querySelectorAll(tag)).filter(el => {
      if (el.closest('#prism-host') || el.closest('#mesurer-extension-host')) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (el.textContent?.trim().length || 0) > 0;
    });

    if (!els.length) continue;
    const first = els[0];
    const cs = window.getComputedStyle(first);
    const rect = first.getBoundingClientRect();

    const rawFam = cs.fontFamily || 'Inter, sans-serif';
    const fam = rawFam.split(',')[0].trim().replace(/['"]/g, '');
    const w = cs.fontWeight || '400';

    const cur = families.get(fam) || { count: 0, weights: new Set<string>() };
    cur.count += els.length;
    cur.weights.add(w);
    families.set(fam, cur);

    const rgb = parseRgb(cs.color);
    const colorHex = rgb ? toHex(rgb[0], rgb[1], rgb[2]) : '#0f172a';

    let sample = first.textContent?.trim() || '';
    if (sample.length > 50) sample = sample.slice(0, 47) + '…';

    const idAttr = first.id ? `#${first.id}` : '';
    const classAttr = first.className && typeof first.className === 'string'
      ? '.' + first.className.trim().split(/\s+/).slice(0, 2).join('.')
      : '';
    const selector = `${tag}${idAttr}${classAttr}`;

    tags.push({
      tag,
      family: fam,
      size: cs.fontSize || '16px',
      weight: w,
      lineHeight: cs.lineHeight || 'normal',
      letterSpacing: cs.letterSpacing || 'normal',
      colorHex,
      count: els.length,
      selector,
      w: Math.round(rect.width),
      h: Math.round(rect.height),
      sample
    });
  }

  const famList: FontFamilyInfo[] = Array.from(families.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .map(([family, f]) => ({
      family,
      count: f.count,
      weights: Array.from(f.weights).sort()
    }));

  return { tags, families: famList };
}

/* ══════════════════════════════════════════════════════════════════
   3. ASSETS & BULLETPROOF SVG EXTRACTION
══════════════════════════════════════════════════════════════════ */
export function extractAssets(): ExtractedAssets {
  const images: ImageAsset[] = [];
  const seenImg = new Set<string>();

  for (const img of Array.from(document.querySelectorAll('img'))) {
    if (img.closest('#prism-host') || img.closest('#mesurer-extension-host')) continue;
    const s = img.currentSrc || img.src;
    if (!s || s.startsWith('data:')) continue;
    const abs = toAbsUrl(s);
    if (seenImg.has(abs)) continue;
    seenImg.add(abs);
    images.push({
      src: abs,
      alt: img.alt || '',
      w: img.naturalWidth || img.width || 0,
      h: img.naturalHeight || img.height || 0,
      type: ext(abs)
    });
  }

  const backgrounds: BackgroundAsset[] = [];
  const seenBg = new Set<string>();
  const allEls = Array.from(document.querySelectorAll('*')).slice(0, 1000);

  for (const el of allEls) {
    if (el.closest('#prism-host') || el.closest('#mesurer-extension-host')) continue;
    try {
      const bg = window.getComputedStyle(el).backgroundImage;
      if (!bg || bg === 'none' || !bg.startsWith('url(')) continue;
      const raw = bg.slice(4, -1).replace(/['"]/g, '');
      if (!raw || raw.startsWith('data:')) continue;
      const abs = toAbsUrl(raw);
      if (seenBg.has(abs)) continue;
      seenBg.add(abs);
      backgrounds.push({ src: abs, type: ext(abs) });
    } catch (_) {}
  }

  /* ── SVG Pipeline with Style Freezing, currentColor resolution, and Deduplication ── */
  const svgs: SvgAsset[] = [];
  const seenSignatures = new Set<string>();

  const allSvgEls = Array.from(document.querySelectorAll('svg'));
  let svgIdx = 0;

  for (const el of allSvgEls) {
    // 1. Never extract SVGs belonging to Prism or Mesurer toolbar
    if (el.closest('#prism-host') || el.closest('#mesurer-extension-host')) continue;

    try {
      const bb = el.getBoundingClientRect();
      // Skip 0-dimension or off-screen hidden sprite-sheets
      if (bb.width <= 2 && bb.height <= 2) continue;

      const cs = window.getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;

      // 2. Clone SVG and strip harmful tags
      const clone = el.cloneNode(true) as SVGSVGElement;
      clone.querySelectorAll('script').forEach(n => n.remove());

      // 3. Resolve and inline <use href="#id"> references from light DOM
      clone.querySelectorAll('use').forEach(useEl => {
        const href = useEl.getAttribute('href') || useEl.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
        if (href && href.startsWith('#')) {
          const id = href.slice(1);
          const target = document.getElementById(id) || document.querySelector(`#${id}`);
          if (target) {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            Array.from(target.childNodes).forEach(child => g.appendChild(child.cloneNode(true)));
            Array.from(useEl.attributes).forEach(attr => {
              if (!['href', 'xlink:href'].includes(attr.name)) g.setAttribute(attr.name, attr.value);
            });
            useEl.parentNode?.replaceChild(g, useEl);
          }
        }
      });

      // 4. Compute contrast-safe currentColor value
      let parentColor = cs.color;
      if (!parentColor || isTransparent(parentColor) || parentColor === 'rgb(255, 255, 255)') {
        // Light or transparent text color would be invisible on white checkerboard
        parentColor = '#0f172a';
      }

      // 5. Deeply freeze computed stroke/fill on clone and children
      const freezeStyles = (cEl: Element, origEl: Element) => {
        try {
          const ccs = window.getComputedStyle(origEl);
          const fill = ccs.fill;
          const stroke = ccs.stroke;
          const strokeWidth = ccs.strokeWidth;
          const opacity = ccs.opacity;

          if (fill && fill !== 'none') {
            if (fill === 'currentColor' || cEl.getAttribute('fill') === 'currentColor') {
              cEl.setAttribute('fill', parentColor);
            } else if (!cEl.getAttribute('fill') || cEl.getAttribute('fill')?.includes('var(')) {
              cEl.setAttribute('fill', fill);
            }
          }

          if (stroke && stroke !== 'none') {
            if (stroke === 'currentColor' || cEl.getAttribute('stroke') === 'currentColor') {
              cEl.setAttribute('stroke', parentColor);
            } else if (!cEl.getAttribute('stroke') || cEl.getAttribute('stroke')?.includes('var(')) {
              cEl.setAttribute('stroke', stroke);
            }
            if (strokeWidth && strokeWidth !== '0px') {
              cEl.setAttribute('stroke-width', strokeWidth);
            }
          }

          if (opacity && opacity !== '1') {
            cEl.setAttribute('opacity', opacity);
          }
        } catch (_) {}

        const cChildren = Array.from(cEl.children);
        const oChildren = Array.from(origEl.children);
        for (let i = 0; i < cChildren.length; i++) {
          if (oChildren[i]) freezeStyles(cChildren[i], oChildren[i]);
        }
      };

      freezeStyles(clone, el);

      // 6. Ensure viewBox exists and preserves proportions
      if (!clone.getAttribute('viewBox')) {
        let vx = 0, vy = 0, vw = Math.round(bb.width || 24), vh = Math.round(bb.height || 24);
        try {
          const bbox = (el as any).getBBox?.();
          if (bbox && bbox.width > 0 && bbox.height > 0) {
            vx = Math.round(bbox.x);
            vy = Math.round(bbox.y);
            vw = Math.round(bbox.width);
            vh = Math.round(bbox.height);
          }
        } catch (_) {}
        clone.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`);
      }

      // Ensure root svg has currentColor set or high contrast
      if (!clone.getAttribute('fill') && !clone.getAttribute('stroke')) {
        clone.setAttribute('fill', 'currentColor');
      }
      clone.style.color = parentColor;

      // 7. Deduplicate identical icons (signature based on paths, circles, rects, viewBox)
      const paths = Array.from(clone.querySelectorAll('path')).map(p => p.getAttribute('d') || '').join('|');
      const circles = Array.from(clone.querySelectorAll('circle')).map(c => `${c.getAttribute('cx')},${c.getAttribute('cy')},${c.getAttribute('r')}`).join('|');
      const rects = Array.from(clone.querySelectorAll('rect')).map(r => `${r.getAttribute('x')},${r.getAttribute('y')},${r.getAttribute('width')},${r.getAttribute('height')}`).join('|');
      const vb = clone.getAttribute('viewBox') || '';
      const signature = `${vb}::${paths}::${circles}::${rects}`;

      // If this exact vector shape was already added, skip duplicate
      if (seenSignatures.has(signature)) continue;
      seenSignatures.add(signature);

      // 8. Generate clean outerHTML and data URL
      const cleanSvg = ensureSvgXmlns(clone.outerHTML.slice(0, 50000));
      const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(cleanSvg);

      // Name extraction
      const titleEl = el.querySelector('title');
      const ariaLabel = el.getAttribute('aria-label');
      const name = titleEl?.textContent?.trim() || ariaLabel?.trim() || `icon-${svgIdx + 1}`;

      svgIdx++;
      svgs.push({
        id: `svg-${svgIdx}`,
        w: Math.round(bb.width || 24),
        h: Math.round(bb.height || 24),
        code: cleanSvg,
        dataUrl,
        name
      });
    } catch (_) {}
  }

  const videos: VideoAsset[] = [];
  for (const el of Array.from(document.querySelectorAll('video'))) {
    if (el.closest('#prism-host') || el.closest('#mesurer-extension-host')) continue;
    try {
      if (el.src) videos.push({ src: el.src, w: el.videoWidth || 0, h: el.videoHeight || 0 });
    } catch (_) {}
  }

  return {
    images: images.slice(0, 40),
    backgrounds: backgrounds.slice(0, 20),
    svgs: svgs.slice(0, 32),
    videos: videos.slice(0, 10)
  };
}
