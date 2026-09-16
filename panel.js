/* panel.js — Prism Design Inspector (v2)
   Full rewrite: Peek-quality UI, per-tag typography, asset thumbnails,
   CSS/Tailwind export, color swatch grid + list, all inside Shadow DOM
   ─────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  if (window.__PRISM_V2__) return;
  window.__PRISM_V2__ = true;

  /* ══════════════════════════════════════════════════════════════════
     ICONS (Lucide, stroke-width 1.75, matching Mesurer toolbar style)
  ══════════════════════════════════════════════════════════════════ */
  const IC = {
    layers:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    close:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    overview: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
    palette:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".75" fill="currentColor" stroke="none"/><circle cx="17.5" cy="10.5" r=".75" fill="currentColor" stroke="none"/><circle cx="8.5" cy="7.5" r=".75" fill="currentColor" stroke="none"/><circle cx="6.5" cy="12.5" r=".75" fill="currentColor" stroke="none"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
    type:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
    image:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
    copy:     `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
    check:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    download: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    scan:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>`,
    code:     `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    link:     `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  };

  /* ══════════════════════════════════════════════════════════════════
     UTILS
  ══════════════════════════════════════════════════════════════════ */
  function parseRgb(v) {
    if (!v) return null;
    const m = v.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    return m ? [+m[1], +m[2], +m[3]] : null;
  }
  function toHex(r, g, b) { return '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''); }
  function isTransparent(v) {
    if (!v || v==='transparent'||v==='none'||v==='rgba(0, 0, 0, 0)') return true;
    const m = v.match(/rgba\([^)]+,\s*([\d.]+)\)/);
    return m ? +m[1] < 0.04 : false;
  }
  function luminance(hex) {
    const r=parseInt(hex.slice(1,3),16)/255, g=parseInt(hex.slice(3,5),16)/255, b=parseInt(hex.slice(5,7),16)/255;
    return 0.2126*r+0.7152*g+0.0722*b;
  }
  function hex2hsl(hex) {
    let r=parseInt(hex.slice(1,3),16)/255, g=parseInt(hex.slice(3,5),16)/255, b=parseInt(hex.slice(5,7),16)/255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b); let h,s,l=(max+min)/2;
    if(max===min){h=s=0;}else{const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);
      switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}h/=6;}
    return `hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
  }
  function fname(url) {
    try { const u = new URL(url); const p=u.pathname.split('/').pop(); return p||url.slice(-20); } catch { return url.slice(-30); }
  }
  function ext(url) {
    const n=fname(url); const i=n.lastIndexOf('.'); return i>-1?n.slice(i+1).toLowerCase().split('?')[0]:'img';
  }
  function safe(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  async function copyToClipboard(text) {
    if (text === null || text === undefined) return false;
    const str = String(text);
    if (!str) return false;

    // Ensure window focus so clipboard API has permission
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
        // Fall back to execCommand below
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

      // Append to document.body (document level selection required by Chrome)
      const target = document.body || document.documentElement;
      target.appendChild(ta);

      ta.focus({ preventScroll: true });
      ta.select();
      ta.setSelectionRange(0, str.length);

      const success = document.execCommand('copy');
      target.removeChild(ta);
      if (success) return true;
    } catch (err) {
      console.warn('[Prism] execCommand copy failed:', err);
    }

    return false;
  }

  function ensureSvgXmlns(svgStr) {
    if (!svgStr) return '';
    let res = svgStr.trim();
    if (!res.includes('xmlns=')) {
      res = res.replace(/<svg\b([^>]*)>/i, '<svg xmlns="http://www.w3.org/2000/svg"$1>');
    }
    if (res.includes('xlink:') && !res.includes('xmlns:xlink=')) {
      res = res.replace(/<svg\b([^>]*)>/i, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"$1>');
    }
    return res;
  }

  /* ══════════════════════════════════════════════════════════════════
     EXTRACTION — COLORS
  ══════════════════════════════════════════════════════════════════ */
  function extractColors() {
    const map = new Map();
    const props = ['color','background-color','border-color','border-top-color','border-left-color','outline-color'];
    const els = Array.from(document.querySelectorAll('*')).slice(0, 3000);

    for (const el of els) {
      try {
        const s = window.getComputedStyle(el);
        for (const p of props) {
          const v = s.getPropertyValue(p);
          if (!v || isTransparent(v)) continue;
          const rgb = parseRgb(v);
          if (!rgb) continue;
          const hex = toHex(...rgb);
          if (!map.has(hex)) map.set(hex, { hex, count:0, lum:luminance(hex), hsl:hex2hsl(hex) });
          map.get(hex).count++;
        }
      } catch(_) {}
    }

    // CSS custom properties (CSS variables) from :root
    const cssVars = [];
    try {
      const rootStyle = window.getComputedStyle(document.documentElement);
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules||[])) {
            if (rule.selectorText === ':root' || rule.selectorText === 'html') {
              const txt = rule.cssText;
              const varMatches = txt.match(/--[\w-]+:\s*[^;]+/g)||[];
              for (const vm of varMatches) {
                const [name, ...rest] = vm.split(':');
                const val = rest.join(':').trim();
                if (val && (val.startsWith('#') || val.startsWith('rgb') || val.startsWith('hsl') || val.startsWith('oklch'))) {
                  cssVars.push({ name: name.trim(), value: val });
                }
              }
            }
          }
        } catch(_) {}
      }
    } catch(_) {}

    // Gradients
    const gradients = [];
    try {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules||[])) {
            const txt = rule.cssText||'';
            const gm = txt.match(/(?:linear|radial|conic)-gradient\([^;)]{5,300}\)/g);
            if (gm) gradients.push(...gm);
          }
        } catch(_) {}
      }
    } catch(_) {}

    const colors = Array.from(map.values()).sort((a,b)=>b.count-a.count);
    return { colors: colors.slice(0,100), gradients:[...new Set(gradients)].slice(0,12), cssVars: cssVars.slice(0,30) };
  }

  /* ══════════════════════════════════════════════════════════════════
     EXTRACTION — TYPOGRAPHY (per HTML tag)
  ══════════════════════════════════════════════════════════════════ */
  function extractTypography() {
    const tags = ['h1','h2','h3','h4','h5','h6','p','a','button','li','label','span','blockquote','caption','figcaption'];
    const results = [];

    for (const tag of tags) {
      const els = Array.from(document.querySelectorAll(tag)).filter(el => el.textContent.trim().length > 0);
      if (!els.length) continue;

      // Pick the most visible/representative element
      const el = els.find(e => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      }) || els[0];

      try {
        const s = window.getComputedStyle(el);
        const family = s.fontFamily.split(',')[0].trim().replace(/['"]/g,'');
        const fsize = s.fontSize;
        const fweight = s.fontWeight;
        const lh = s.lineHeight;
        const ls = s.letterSpacing;
        const color = s.color;
        const text = el.textContent.trim().slice(0, 100);
        const rgb = parseRgb(color);
        const colorHex = rgb ? toHex(...rgb) : '#000000';
        const r = el.getBoundingClientRect();
        const w = Math.round(r.width);
        const h = Math.round(r.height);

        let sel = tag;
        if (el.id) sel += '#' + el.id;
        else if (el.className && typeof el.className === 'string') {
          const c = el.className.trim().split(/\s+/)[0];
          if (c && !c.includes(':')) sel += '.' + c;
        }

        results.push({ tag, family, size: fsize, weight: fweight, lineHeight: lh, letterSpacing: ls, colorHex, sampleText: text, count: els.length, w, h, selector: sel });
      } catch(_) {}
    }

    // Font families summary with weights
    const familyMap = new Map();
    for (const r of results) {
      if (!familyMap.has(r.family)) familyMap.set(r.family, { family: r.family, tags: new Set(), weights: new Set() });
      const f = familyMap.get(r.family);
      f.tags.add(r.tag);
      if (r.weight) f.weights.add(r.weight);
    }

    return {
      tags: results,
      families: Array.from(familyMap.values()).map(f => ({
        family: f.family,
        tags: Array.from(f.tags),
        weights: Array.from(f.weights).sort()
      }))
    };
  }

  /* ══════════════════════════════════════════════════════════════════
     EXTRACTION — ASSETS
  ══════════════════════════════════════════════════════════════════ */
  function toAbsUrl(u) {
    if (!u) return '';
    try { return new URL(u, window.location.href).href; } catch(_) { return u; }
  }

  function extractAssets() {
    const images = [];
    const seenImg = new Set();
    for (const img of Array.from(document.querySelectorAll('img'))) {
      const s = img.currentSrc || img.src;
      if (!s || s.startsWith('data:')) continue;
      const abs = toAbsUrl(s);
      if (seenImg.has(abs)) continue;
      seenImg.add(abs);
      images.push({ src: abs, alt: img.alt||'', w: img.naturalWidth||img.width||0, h: img.naturalHeight||img.height||0, type: ext(abs) });
    }

    const backgrounds = [];
    const seenBg = new Set();
    for (const el of Array.from(document.querySelectorAll('*')).slice(0,1000)) {
      try {
        const bg = window.getComputedStyle(el).backgroundImage;
        if (!bg||bg==='none'||!bg.startsWith('url(')) continue;
        const raw = bg.slice(4,-1).replace(/['"]/g,'');
        if (!raw||raw.startsWith('data:')) continue;
        const abs = toAbsUrl(raw);
        if (seenBg.has(abs)) continue;
        seenBg.add(abs);
        backgrounds.push({ src: abs, type: ext(abs) });
      } catch(_) {}
    }

    // Reset node store for this analysis run
    window.__prismSvgNodes__ = [];
    const svgs = [];
    for (const el of Array.from(document.querySelectorAll('svg'))) {
      try {
        const bb = el.getBoundingClientRect();
        if (bb.width > 4 && bb.height > 4) {
          // Original code for export
          const orig = el.cloneNode(true);
          orig.querySelectorAll('script').forEach(n => n.remove());
          const code = ensureSvgXmlns(orig.outerHTML.slice(0, 50000));

          // Safe preview node — appended via DOM, never via innerHTML
          const preview = el.cloneNode(true);
          if (!preview.getAttribute('viewBox')) {
            preview.setAttribute('viewBox', `0 0 ${Math.round(bb.width || 24)} ${Math.round(bb.height || 24)}`);
          }
          preview.setAttribute('width', '36');
          preview.setAttribute('height', '36');
          preview.style.cssText = 'display:block;max-width:36px;max-height:36px;overflow:hidden;';
          preview.querySelectorAll('script').forEach(n => n.remove());

          const idx = window.__prismSvgNodes__.length;
          window.__prismSvgNodes__.push(preview);
          svgs.push({ w: Math.round(bb.width), h: Math.round(bb.height), code, idx });
        }
      } catch(_) {}
    }

    const videos = [];
    for (const el of Array.from(document.querySelectorAll('video'))) {
      try { if (el.src) videos.push({ src:el.src, w:el.videoWidth||0, h:el.videoHeight||0 }); } catch(_) {}
    }

    return { images: images.slice(0,40), backgrounds: backgrounds.slice(0,20), svgs: svgs.slice(0,20), videos: videos.slice(0,10) };
  }

  /* ══════════════════════════════════════════════════════════════════
     EXPORT GENERATORS
  ══════════════════════════════════════════════════════════════════ */
  function exportCSSVars(colors) {
    const list = Array.isArray(colors) ? colors : (colors?.colors || []);
    const top = list.slice(0, 24);
    if (!top.length) return ':root {\n  /* No colors extracted yet */\n}';
    return `:root {\n${top.map((c,i)=>`  --color-${i+1}: ${c.hex};`).join('\n')}\n}`;
  }

  function exportTailwind(colors) {
    const list = Array.isArray(colors) ? colors : (colors?.colors || []);
    const top = list.slice(0, 24);
    if (!top.length) return `module.exports = {\n  theme: {\n    extend: {\n      colors: {}\n    }\n  }\n};`;
    return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${top.map((c,i)=>`        'c${i+1}': '${c.hex}',`).join('\n')}\n      }\n    }\n  }\n};`;
  }

  function exportTypographyCSS(dataOrTags) {
    const tags = Array.isArray(dataOrTags) ? dataOrTags : (dataOrTags?.tags || []);
    if (tags.length) {
      return tags.map(t =>
        `${t.tag} {\n  font-family: '${t.family}', sans-serif;\n  font-size: ${t.size || '16px'};\n  font-weight: ${t.weight || '400'};\n  line-height: ${t.lineHeight || '1.5'};\n  letter-spacing: ${t.letterSpacing || 'normal'};\n  color: ${t.colorHex || '#0f172a'};\n}`
      ).join('\n\n');
    }
    const families = Array.isArray(dataOrTags?.families) ? dataOrTags.families : [];
    if (families.length) {
      return families.map((f, i) =>
        `:root {\n  --font-family-${i+1}: '${f.family}', sans-serif;\n}`
      ).join('\n\n');
    }
    return '/* No typography detected */';
  }

  function exportAllImgUrls(assets) {
    const imgs = (assets?.images || []).map(i => i.src);
    const bgs = (assets?.backgrounds || []).map(b => b.src);
    const unique = [...new Set([...imgs, ...bgs])];
    return unique.join('\n') || '/* No images found */';
  }

  function exportByType(type) {
    const data = (typeof window !== 'undefined' && window.__prismExtracted__) || null;
    if (!data) return '';
    if (type === 'css-vars')     return exportCSSVars(data.colors);
    if (type === 'tailwind')     return exportTailwind(data.colors);
    if (type === 'type-css')     return exportTypographyCSS(data.typography);
    if (type === 'all-img-urls') return exportAllImgUrls(data.assets);
    return '';
  }

  /* ══════════════════════════════════════════════════════════════════
     SVG EXPORT HELPERS
  ══════════════════════════════════════════════════════════════════ */
  function svgToReact(svgCode, name='Icon') {
    const fullSvg = ensureSvgXmlns(svgCode);
    const props = [
      ['class=','className='],['stroke-width=','strokeWidth='],['stroke-linecap=','strokeLinecap='],
      ['stroke-linejoin=','strokeLinejoin='],['fill-opacity=','fillOpacity='],['fill-rule=','fillRule='],
      ['clip-rule=','clipRule='],['stop-color=','stopColor='],['stop-opacity=','stopOpacity='],
      ['xlink:href=','xlinkHref='],['xmlns:xlink=','xmlnsXlink='],['xml:space=','xmlSpace='],
      ['tabindex=','tabIndex='],['viewbox=','viewBox='],
      ['stroke-miterlimit=','strokeMiterlimit='],['clip-path=','clipPath='],
      ['font-family=','fontFamily='],['font-size=','fontSize='],['font-weight=','fontWeight=']
    ];
    let jsx = fullSvg.replace(/<\?xml[^>]*>/g,'').replace(/<!--[\s\S]*?-->/g,'').trim();
    for (const [from, to] of props) jsx = jsx.split(from).join(to);
    // Self-close empty tags
    jsx = jsx.replace(/<(\w+)([^>]*)><\/\1>/g, (_, tag, attrs) => `<${tag}${attrs} />`);
    return `import React from 'react';\n\nexport const ${name} = ({ size = 24, color = 'currentColor', ...props }) => (\n  ${jsx.replace(/<svg/, '<svg width={size} height={size}').replace(/stroke="[^"]*"/, 'stroke={color}')}\n);\n\nexport default ${name};`;
  }

  function svgDownloadSvg(svgCode, filename) {
    try {
      const fullSvg = ensureSvgXmlns(svgCode);
      const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = (filename || 'icon.svg').replace(/\.svg$/i, '') + '.svg';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try { URL.revokeObjectURL(url); } catch (_) {}
        a.remove();
      }, 500);
    } catch (err) {
      console.error('[Prism] Download SVG error:', err);
    }
  }

  function svgDownloadPng(svgCode, w, h, filename) {
    try {
      const fullSvg   = ensureSvgXmlns(svgCode);
      const widthNum  = Math.max(parseInt(w, 10) || 64, 32);
      const heightNum = Math.max(parseInt(h, 10) || 64, 32);
      const renderW   = widthNum * 2;
      const renderH   = heightNum * 2;

      let sized = fullSvg;
      if (!/viewBox=/i.test(sized)) {
        sized = sized.replace(/<svg\b([^>]*)>/i, `<svg viewBox="0 0 ${widthNum} ${heightNum}"$1>`);
      }
      sized = sized.replace(/<svg\b([^>]*)>/i, (m, attrs) => {
        const clean = attrs.replace(/\bwidth="[^"]*"/gi, '').replace(/\bheight="[^"]*"/gi, '');
        return `<svg width="${renderW}" height="${renderH}"${clean}>`;
      });

      const blob = new Blob([sized], { type: 'image/svg+xml;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const img  = new Image();

      const triggerDownload = (dataUrl) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = (filename || 'icon.png').replace(/\.png$/i, '') + '.png';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => a.remove(), 500);
      };

      const cleanup = () => {
        try { URL.revokeObjectURL(url); } catch (_) {}
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width  = renderW;
          canvas.height = renderH;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, renderW, renderH);
          cleanup();
          const pngUrl = canvas.toDataURL('image/png');
          triggerDownload(pngUrl);
        } catch (err) {
          cleanup();
          svgDownloadSvg(fullSvg, (filename || 'icon').replace(/\.png$/i, '') + '.svg');
        }
      };

      img.onerror = () => {
        cleanup();
        const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sized);
        const img2 = new Image();
        img2.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width  = renderW;
            canvas.height = renderH;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img2, 0, 0, renderW, renderH);
            triggerDownload(canvas.toDataURL('image/png'));
          } catch (_) {
            svgDownloadSvg(fullSvg, (filename || 'icon').replace(/\.png$/i, '') + '.svg');
          }
        };
        img2.onerror = () => {
          svgDownloadSvg(fullSvg, (filename || 'icon').replace(/\.png$/i, '') + '.svg');
        };
        img2.src = dataUri;
      };

      img.src = url;
    } catch (err) {
      console.error('[Prism] PNG conversion failed:', err);
      svgDownloadSvg(svgCode, (filename || 'icon').replace(/\.png$/i, '') + '.svg');
    }
  }

  /* ══════════════════════════════════════════════════════════════════
     CSS — complete design system for the panel
  ══════════════════════════════════════════════════════════════════ */
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── TRIGGER BUTTON — exact Mesurer toolbar pill style ─────── */
    .p-trigger {
      position: fixed; top: 10px; right: 16px;
      pointer-events: all; width: 36px; height: 36px;
      border-radius: 10px; background: #fff;
      border: 1px solid rgba(0,0,0,0.09);
      box-shadow: 0 2px 8px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: #374151; transition: all 0.15s ease; z-index: 9999; outline: none;
    }
    .p-trigger:hover { background:#EEF2FF; color:#4f46e5; transform:scale(1.06); box-shadow:0 4px 14px rgba(0,0,0,0.13); }
    .p-trigger.open { background:#EEF2FF; color:#4f46e5; box-shadow:0 2px 8px rgba(79,70,229,0.2); }

    /* ── PANEL SHELL ─────────────────────────────────────────────── */
    .p-panel {
      position: fixed; top: 0; right: 0; width: 388px; height: 100vh; height: 100dvh;
      background: #f8fafc;
      box-shadow: -2px 0 40px rgba(0,0,0,0.12), -1px 0 8px rgba(0,0,0,0.05);
      transform: translateX(calc(100% + 4px));
      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
      z-index: 9998; pointer-events: all;
      display: flex; flex-direction: column;
      font-family: 'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      overflow: hidden; color: #0f172a;
    }
    .p-panel.open { transform: translateX(0); }

    /* ── HEADER ─────────────────────────────────────────────────── */
    .p-header {
      background: #fff; border-bottom: 1px solid #e2e8f0;
      padding: 12px 14px; display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }
    .p-logo {
      width: 30px; height: 30px; border-radius: 8px;
      background: linear-gradient(135deg,#4f46e5,#7c3aed);
      display: flex; align-items: center; justify-content: center; color:#fff; flex-shrink:0;
    }
    .p-title { font-size:14px; font-weight:700; color:#0f172a; letter-spacing:-.015em; }
    .p-subtitle { font-size:10px; color:#94a3b8; font-weight:400; margin-top:1px; }
    .p-close {
      width:28px; height:28px; border-radius:7px; border:none; background:none;
      cursor:pointer; display:flex; align-items:center; justify-content:center;
      color:#94a3b8; transition:all .15s; margin-left:auto; flex-shrink:0;
    }
    .p-close:hover { background:#f1f5f9; color:#0f172a; }

    /* ── ANALYZE BAR ────────────────────────────────────────────── */
    .p-analyze-bar {
      background:#fff; border-bottom:1px solid #e2e8f0;
      padding:8px 14px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
    }
    .p-analyze-note { font-size:10px; color:#94a3b8; }
    .p-btn {
      display:inline-flex; align-items:center; gap:5px;
      padding:6px 12px; border-radius:8px; border:none; cursor:pointer;
      font-family:inherit; font-size:11px; font-weight:600;
      transition:all .15s; outline:none;
    }
    .p-btn-primary { background:#4f46e5; color:#fff; }
    .p-btn-primary:hover { background:#4338ca; }
    .p-btn-primary:disabled { opacity:.5; cursor:not-allowed; }
    .p-btn-ghost {
      background:none; color:#475569; border:1px solid #e2e8f0;
    }
    .p-btn-ghost:hover { background:#f1f5f9; color:#0f172a; border-color:#cbd5e1; }
    .p-btn-sm { padding:4px 9px; font-size:10px; border-radius:6px; }

    /* ── TABS ───────────────────────────────────────────────────── */
    .p-tabs { background:#fff; border-bottom:1px solid #e2e8f0; display:flex; flex-shrink:0; }
    .p-tab {
      flex:1; border:none; background:none; cursor:pointer;
      padding:9px 4px 8px; display:flex; flex-direction:column; align-items:center; gap:3px;
      color:#94a3b8; font-size:9px; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
      transition:color .15s; border-bottom:2px solid transparent; font-family:inherit; outline:none;
    }
    .p-tab:hover { color:#4f46e5; }
    .p-tab.active { color:#4f46e5; border-bottom-color:#4f46e5; }

    /* ── SCROLL AREA ────────────────────────────────────────────── */
    .p-scroll {
      flex:1; overflow-y:auto; overflow-x:hidden; min-height:0;
      scrollbar-width:thin; scrollbar-color:#e2e8f0 transparent;
    }
    .p-scroll::-webkit-scrollbar { width:4px; }
    .p-scroll::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:2px; }
    .p-pane { display:none; padding:14px; }
    .p-pane.active { display:block; }

    /* ── SECTION LABEL ──────────────────────────────────────────── */
    .p-label {
      font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase;
      letter-spacing:.08em; margin:14px 0 8px;
    }
    .p-label:first-child { margin-top:0; }

    /* ── CARDS ──────────────────────────────────────────────────── */
    .p-card {
      background:#fff; border-radius:12px; border:1px solid #e2e8f0;
      padding:14px; margin-bottom:10px;
    }
    .p-card-head {
      display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;
    }
    .p-card-title { font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.07em; }
    .p-card-actions { display:flex; gap:6px; }

    /* ── STAT GRID ──────────────────────────────────────────────── */
    .p-stats { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px; }
    .p-stat { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:12px 14px; }
    .p-stat-val { font-size:26px; font-weight:700; color:#0f172a; letter-spacing:-.03em; line-height:1; margin-bottom:4px; }
    .p-stat-lbl { font-size:12px; color:#475569; font-weight:600; }

    /* ── PALETTE STRIP ──────────────────────────────────────────── */
    .p-strip { display:flex; height:38px; border-radius:8px; overflow:hidden; border:1px solid rgba(0,0,0,0.05); margin-bottom:12px; }
    .p-strip-s { flex:1; }

    /* ── COLOR SWATCHES GRID ────────────────────────────────────── */
    .p-swatch-grid { display:grid; grid-template-columns:repeat(8,1fr); gap:6px; }
    .p-swatch {
      aspect-ratio:1; border-radius:7px; border:1px solid rgba(0,0,0,0.07);
      cursor:pointer; transition:transform .15s,box-shadow .15s; position:relative;
    }
    .p-swatch:hover { transform:scale(1.15); box-shadow:0 4px 12px rgba(0,0,0,0.15); z-index:2; }

    /* ── COLOR LIST ─────────────────────────────────────────────── */
    .p-color-row {
      display:flex; align-items:center; gap:10px;
      padding:8px 0; border-bottom:1px solid #f8fafc;
    }
    .p-color-row:last-child { border-bottom:none; }
    .p-color-dot { width:32px; height:32px; border-radius:8px; border:1px solid rgba(0,0,0,0.07); flex-shrink:0; }
    .p-color-info { flex:1; min-width:0; }
    .p-color-hex { font-family:'Inter',sans-serif; font-size:14px; color:#0f172a; font-weight:700; display:block; }
    .p-color-hsl { font-size:12px; color:#334155; display:block; margin-top:2px; font-weight:600; font-family:'Inter',sans-serif; }
    .p-color-count { font-size:12px; color:#0f172a; font-weight:700; white-space:nowrap; padding:3px 8px; background:#f1f5f9; border-radius:5px; font-family:'Inter',sans-serif; }

    /* ── ICON COPY BTN ──────────────────────────────────────────── */
    .p-icon-btn {
      width:26px; height:26px; border-radius:6px; border:none; background:none;
      cursor:pointer; display:flex; align-items:center; justify-content:center;
      color:#64748b; transition:all .15s; padding:0; flex-shrink:0;
    }
    .p-icon-btn:hover { background:#f1f5f9; color:#4f46e5; }
    .p-icon-btn.done { color:#22c55e; }

    /* ── GRADIENT ───────────────────────────────────────────────── */
    .p-grad-bar { height:44px; border-radius:8px; border:1px solid rgba(0,0,0,0.05); margin-bottom:6px; }
    .p-grad-code { font-family:'Inter',sans-serif; font-size:11px; color:#334155; word-break:break-all; line-height:1.5; font-weight:500; }

    /* ── CODE BLOCK ─────────────────────────────────────────────── */
    .p-code-block {
      background:#0f172a; border-radius:8px; padding:12px; overflow-x:auto;
      font-family:'Space Mono',monospace; font-size:11px; color:#e2e8f0; line-height:1.7;
      white-space:pre; max-height:200px; overflow-y:auto;
      scrollbar-width:thin; scrollbar-color:#334155 transparent;
    }
    .p-code-block .c-kw { color:#c084fc; }
    .p-code-block .c-prop { color:#67e8f9; }
    .p-code-block .c-val { color:#86efac; }
    .p-code-block .c-str { color:#fbbf24; }

    /* ── EXPORT ROW ─────────────────────────────────────────────── */
    .p-export-row { display:flex; gap:6px; margin-top:10px; flex-wrap:wrap; }

    /* ── TYPOGRAPHY CARDS ───────────────────────────────────────── */
    .p-type-card {
      background:#fff; border-radius:12px; border:1px solid #e2e8f0;
      padding:14px; margin-bottom:8px; overflow:hidden;
    }
    .p-type-tag {
      display:inline-flex; align-items:center; padding:3px 8px;
      border-radius:5px; font-family:'Inter',sans-serif; font-size:11px; font-weight:700;
      background:#0f172a; color:#fff; letter-spacing:.02em;
    }
    .p-type-tag.h1,.p-type-tag.h2 { background:linear-gradient(135deg,#4f46e5,#7c3aed); }
    .p-type-tag.h3,.p-type-tag.h4 { background:linear-gradient(135deg,#0891b2,#4f46e5); }
    .p-type-tag.h5,.p-type-tag.h6 { background:linear-gradient(135deg,#0891b2,#06b6d4); }
    .p-type-tag.p  { background:linear-gradient(135deg,#475569,#64748b); }
    .p-type-tag.a  { background:linear-gradient(135deg,#1d4ed8,#3b82f6); }
    .p-type-tag.button { background:linear-gradient(135deg,#047857,#059669); }
    .p-sel-chip {
      transition: all 0.15s ease;
    }
    .p-sel-chip:hover {
      background: #e2e8f0 !important;
      color: #0f172a !important;
    }
    .p-type-preview {
      color:#0f172a; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;
      line-height:1.3; margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid #f1f5f9;
    }
    .p-type-meta { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
    .p-type-prop { background:#f8fafc; border-radius:7px; padding:8px 10px; }
    .p-type-prop-lbl { font-size:11px; font-weight:700; color:#334155; text-transform:uppercase; letter-spacing:.05em; display:block; margin-bottom:3px; font-family:'Inter',sans-serif; }
    .p-type-prop-val { font-size:13px; font-weight:600; color:#0f172a; font-family:'Inter',sans-serif; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .p-count-pill { font-size:11px; color:#475569; margin-left:4px; font-weight:600; font-family:'Inter',sans-serif; }

    /* ── ASSET CARDS ────────────────────────────────────────────── */
    .p-asset-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }
    .p-asset-card {
      background:#fff; border:1px solid #e2e8f0; border-radius:10px; overflow:hidden;
      cursor:default; transition:box-shadow .15s;
    }
    .p-asset-card:hover { box-shadow:0 4px 12px rgba(0,0,0,0.08); }
    .p-asset-thumb {
      width:100%; aspect-ratio:16/10; background:#f8fafc;
      display:flex; align-items:center; justify-content:center; overflow:hidden;
      border-bottom:1px solid #f1f5f9; color:#cbd5e1; font-size:11px;
    }
    .p-asset-thumb img { width:100%; height:100%; object-fit:cover; }
    .p-asset-meta { padding:8px; }
    .p-asset-name { font-size:12px; font-weight:600; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:3px; font-family:'Inter',sans-serif; }
    .p-asset-dim { font-size:12px; color:#334155; font-weight:600; margin-top:2px; font-family:'Inter',sans-serif; }
    .p-asset-actions { display:flex; gap:3px; margin-top:6px; }

    /* ── ASSET LIST ─────────────────────────────────────────────── */
    .p-asset-row { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #f8fafc; }
    .p-asset-row:last-child { border-bottom:none; }
    .p-asset-ico { width:40px; height:40px; border-radius:7px; background:#f8fafc; border:1px solid #e2e8f0; overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:#cbd5e1; }
    .p-asset-ico img { width:100%; height:100%; object-fit:cover; }
    .p-asset-info { flex:1; min-width:0; }
    .p-asset-nm { font-size:12px; font-weight:600; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-family:'Inter',sans-serif; }
    .p-asset-tp { font-size:12px; color:#334155; font-weight:600; margin-top:2px; font-family:'Inter',sans-serif; }
    .p-asset-btns { display:flex; gap:3px; flex-shrink:0; }

    /* ── EMPTY STATE ────────────────────────────────────────────── */
    .p-empty { text-align:center; padding:40px 20px; color:#475569; font-size:13px; line-height:1.7; font-weight:500; font-family:'Inter',sans-serif; }
    .p-empty-icon { width:44px; height:44px; background:#f1f5f9; border-radius:12px; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; color:#64748b; }

    /* ── CSS VAR TAG ────────────────────────────────────────────── */
    .p-var-row { display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid #f8fafc; }
    .p-var-row:last-child { border-bottom:none; }
    .p-var-dot { width:16px; height:16px; border-radius:4px; border:1px solid rgba(0,0,0,0.08); flex-shrink:0; }
    .p-var-name { font-family:'Inter',sans-serif; font-size:12px; color:#1e293b; font-weight:600; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .p-var-val { font-family:'Inter',sans-serif; font-size:12px; color:#0f172a; font-weight:600; }

    /* ── OVERVIEW FONT PREVIEW ──────────────────────────────────── */
    .p-ov-font { padding:10px 0; border-bottom:1px solid #f8fafc; }
    .p-ov-font:last-child { border-bottom:none; }
    .p-ov-font-name { font-size:13px; font-weight:700; color:#0f172a; margin-bottom:5px; font-family:'Inter',sans-serif; }
    .p-ov-font-tags { display:flex; flex-wrap:wrap; gap:4px; margin-top:5px; }
    .p-tag-chip { font-size:11px; padding:3px 8px; border-radius:5px; background:#f1f5f9; color:#1e293b; font-weight:700; font-family:'Inter',sans-serif; }
    .p-tag-btn { font-size:11px; padding:4px 9px; border-radius:6px; font-weight:700; font-family:'Inter',sans-serif; cursor:pointer; transition:all .15s; outline:none; }
    .p-tag-btn:hover { filter:brightness(0.88); transform:scale(1.05); box-shadow:0 2px 8px rgba(0,0,0,0.12); }

    /* ── SVG ACTION BUTTONS ─────────────────────────────────────── */
    .p-svg-act { display:flex; gap:4px; margin-top:6px; justify-content:center; flex-wrap:wrap; }
    .p-svg-act-btn {
      padding:4px 8px; border-radius:6px; border:1px solid #e2e8f0;
      background:#f8fafc; color:#1e293b; font-size:10px; font-weight:700;
      font-family:'Inter',sans-serif; cursor:pointer; transition:all .12s; outline:none;
      text-transform:uppercase; letter-spacing:.04em;
    }
    .p-svg-act-btn:hover { background:#4f46e5; color:#fff; border-color:#4f46e5; }

    /* ── DOCK INJECT BTN ────────────────────────────────────────── */
    .prism-dock-btn {
      width:32px; height:32px; border-radius:8px; background:none; border:none;
      cursor:pointer; display:flex; align-items:center; justify-content:center;
      color:#1e293b; transition:all .15s; padding:0;
    }
    .prism-dock-btn:hover { background:#EEF2FF; color:#4f46e5; }

    /* ── SVG GRID + MODAL ─────────────────────────────────── */
    .p-svg-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
    .p-svg-card {
      background:#fff; border:1.5px solid #e2e8f0; border-radius:10px;
      padding:10px 6px 7px; display:flex; flex-direction:column; align-items:center;
      gap:4px; cursor:pointer; transition:box-shadow .15s,transform .15s,border-color .15s;
    }
    .p-svg-card:hover { box-shadow:0 6px 18px rgba(79,70,229,0.13); transform:translateY(-2px); border-color:#c7d2fe; }
    .p-svg-canvas {
      width:40px; height:40px; display:flex; align-items:center; justify-content:center;
      background: repeating-conic-gradient(#f1f5f9 0% 25%, #fff 0% 50%) 0 0 / 8px 8px;
      border-radius:6px; overflow:hidden;
    }
    .p-svg-canvas svg { max-width:36px; max-height:36px; display:block; }
    .p-svg-meta { font-size:11px; color:#0f172a; font-family:'Inter',sans-serif; text-align:center; white-space:nowrap; font-weight:600; }
    .p-svg-hint { font-size:9px; color:#64748b; text-align:center; font-family:'Inter',sans-serif; font-weight:500; transition:color .15s; }
    .p-svg-card:hover .p-svg-hint { color:#0d99ff; font-weight:600; }
    .p-modal-btn {
      display:flex; align-items:center; justify-content:center; gap:5px;
      padding:9px 6px; border-radius:9px; border:1.5px solid #e2e8f0;
      background:#f8fafc; color:#0f172a; font-size:11px; font-weight:700;
      font-family:'Inter',sans-serif; cursor:pointer; transition:all .15s; outline:none;
    }
    .p-modal-btn:hover { background:#EEF2FF; color:#4f46e5; border-color:#c7d2fe; }
    .p-modal-btn-primary { background:#0d99ff; color:#fff; border-color:#0d99ff; }
    .p-modal-btn-primary:hover { background:#0284c7; color:#fff; border-color:#0284c7; }
    .p-modal-btn.done { background:#22c55e !important; color:#fff !important; border-color:#22c55e !important; }

    /* ── COPY ANIMATION & TOAST ─────────────────────────────────── */
    @keyframes prismPop {
      0%   { transform: scale(1); }
      30%  { transform: scale(0.88); }
      60%  { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    .p-copy-animated {
      animation: prismPop 0.32s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
    }
    .p-copied {
      background: #10b981 !important;
      color: #ffffff !important;
      border-color: #10b981 !important;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.45) !important;
    }
    .p-toast {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(24px) scale(0.92);
      background: #0f172a;
      color: #f8fafc;
      padding: 9px 18px;
      border-radius: 9999px;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.32), 0 0 0 1px rgba(255, 255, 255, 0.12);
      opacity: 0;
      pointer-events: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 9999;
      white-space: nowrap;
      max-width: 90%;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .p-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
    .p-toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #34d399;
      font-size: 14px;
    }
    .p-toast-msg {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ── OVERVIEW SPECIFIC ENHANCEMENTS ─────────────────────────── */
    .p-color-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 6px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: 'Inter', sans-serif;
    }
    .p-color-chip:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }
    .p-color-chip-dot {
      width: 14px;
      height: 14px;
      border-radius: 4px;
      border: 1px solid rgba(0, 0, 0, 0.12);
      flex-shrink: 0;
    }
    .p-color-chip-text {
      font-size: 11px;
      font-weight: 600;
      color: #0f172a;
      letter-spacing: -0.01em;
    }
    .p-ov-font-name-wrap {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 6px;
      transition: all 0.15s ease;
    }
    .p-ov-font-name-wrap:hover {
      background: #f1f5f9;
    }
    .p-ov-font-name-wrap .p-copy-indicator {
      opacity: 0;
      color: #64748b;
      transition: opacity 0.15s ease;
      display: flex;
      align-items: center;
    }
    .p-ov-font-name-wrap:hover .p-copy-indicator {
      opacity: 1;
    }
    .p-ov-font-sample {
      cursor: pointer;
      border-radius: 6px;
      padding: 3px 6px;
      margin-left: -6px;
      transition: all 0.15s ease;
    }
    .p-ov-font-sample:hover {
      background: #f1f5f9;
      color: #4f46e5 !important;
    }
    .p-ov-img-card {
      width: 58px;
      height: 58px;
      border-radius: 8px;
      overflow: hidden;
      border: 1.5px solid #e2e8f0;
      background: #f8fafc;
      flex-shrink: 0;
      cursor: pointer;
      position: relative;
      transition: all 0.18s ease;
    }
    .p-ov-img-card:hover {
      border-color: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 6px 14px rgba(79, 70, 229, 0.15);
    }
    .p-ov-img-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.15s ease;
      color: #fff;
    }
    .p-ov-img-card:hover .p-ov-img-overlay {
      opacity: 1;
    }
    .p-img-copied-badge {
      position: absolute;
      inset: 0;
      background: #10b981;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      z-index: 5;
      animation: prismPop 0.25s ease;
    }`;

  /* ══════════════════════════════════════════════════════════════════
     RENDER — OVERVIEW
  ══════════════════════════════════════════════════════════════════ */
  function renderOverview(d) {
    const { colors, typography, assets } = d;
    const topColors = (colors?.colors || colors || []).slice(0, 10);
    const topFamilies = (typography?.families || []).slice(0, 4);
    const images = assets?.images || [];
    const backgrounds = assets?.backgrounds || [];
    const svgs = assets?.svgs || [];
    const totalImgs = images.length + backgrounds.length;

    return `
      <div class="p-stats">
        <div class="p-stat"><div class="p-stat-val">${(colors?.colors || colors || []).length}</div><div class="p-stat-lbl">Colors found</div></div>
        <div class="p-stat"><div class="p-stat-val">${(typography?.families || []).length}</div><div class="p-stat-lbl">Font families</div></div>
        <div class="p-stat"><div class="p-stat-val">${totalImgs}</div><div class="p-stat-lbl">Images</div></div>
        <div class="p-stat"><div class="p-stat-val">${svgs.length}</div><div class="p-stat-lbl">SVG elements</div></div>
      </div>

      ${topColors.length ? `
      <div class="p-card">
        <div class="p-card-head">
          <span class="p-card-title">Color Palette</span>
          <div class="p-card-actions">
            <button class="p-btn p-btn-ghost p-btn-sm" data-prism-export="css-vars" title="Export CSS Variables">
              ${IC.copy} CSS Vars
            </button>
            <button class="p-btn p-btn-ghost p-btn-sm" data-prism-export="tailwind" title="Export Tailwind Theme">
              ${IC.code} Tailwind
            </button>
          </div>
        </div>
        <div class="p-strip">${topColors.map(c=>`<div class="p-strip-s" style="background:${c.hex};cursor:pointer" title="Click to copy ${c.hex}" data-prism-copy="${c.hex}"></div>`).join('')}</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${topColors.map(c=>`
            <div class="p-color-chip" data-prism-copy="${c.hex}" title="Click to copy ${c.hex}">
              <div class="p-color-chip-dot" style="background:${c.hex}"></div>
              <span class="p-color-chip-text">${c.hex}</span>
            </div>`).join('')}
        </div>
      </div>` : ''}

      ${topFamilies.length ? `
      <div class="p-card">
        <div class="p-card-head">
          <span class="p-card-title">Fonts Used</span>
          <button class="p-btn p-btn-ghost p-btn-sm" data-prism-export="type-css" title="Export Typography CSS">
            ${IC.copy} CSS
          </button>
        </div>
        ${topFamilies.map(f=>`
          <div class="p-ov-font">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
              <div class="p-ov-font-name-wrap" data-prism-copy="${safe(f.family)}" title="Click to copy font name '${safe(f.family)}'">
                <span class="p-ov-font-name">${safe(f.family)}</span>
                <span class="p-copy-indicator">${IC.copy}</span>
              </div>
              <button class="p-icon-btn" data-prism-copy="${safe(f.family)}" title="Copy font family '${safe(f.family)}'">${IC.copy}</button>
            </div>
            <div class="p-ov-font-sample" data-prism-copy="${safe(f.family)}" title="Click to copy font family '${safe(f.family)}'" style="font-family:'${safe(f.family)}',sans-serif;font-size:20px;font-weight:600;color:#0f172a;line-height:1.25;margin-bottom:6px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">
              The quick brown fox jumps over the lazy dog
            </div>
            <div class="p-ov-font-tags">${(f.tags || []).map(t=>`<span class="p-tag-chip p-tag-btn" data-prism-highlight="${t}" style="cursor:pointer" title="Highlight &lt;${t}&gt; on page">&lt;${t}&gt;</span>`).join('')}</div>
          </div>`).join('')}
      </div>` : ''}

      ${images.length ? `
      <div class="p-card">
        <div class="p-card-head">
          <span class="p-card-title">Images Preview</span>
          <button class="p-btn p-btn-ghost p-btn-sm" data-prism-export="all-img-urls" title="Copy all image URLs">${IC.copy} All URLs</button>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${images.slice(0,8).map(img=>`
            <div class="p-ov-img-card" data-prism-copy="${safe(img.src)}" title="Click to copy URL (${safe(fname(img.src))})">
              <img src="${safe(img.src)}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.style.display='none'"/>
              <div class="p-ov-img-overlay">${IC.copy}</div>
            </div>`).join('')}
        </div>
      </div>` : ''}

      ${svgs.length ? `
      <div class="p-card">
        <div class="p-card-head">
          <span class="p-card-title">Inline SVGs (${svgs.length})</span>
          <span style="font-size:10px;color:#64748b;font-weight:600">Click to export</span>
        </div>
        <div class="p-svg-grid">
          ${svgs.slice(0, 4).map((s, i) => `
            <div class="p-svg-card" data-svg-open="${i}" title="Click to export SVG #${i+1}">
              <div class="p-svg-canvas" data-svg-idx="${s.idx}"></div>
              <div class="p-svg-meta">${s.w}\u00d7${s.h}px</div>
              <div class="p-svg-hint">Export</div>
            </div>`).join('')}
        </div>
      </div>` : ''}
    `;
  }

  /* ══════════════════════════════════════════════════════════════════
     RENDER — COLORS
  ══════════════════════════════════════════════════════════════════ */
  function renderColors(data) {
    const { colors, gradients, cssVars } = data;
    if (!colors.length) return `<div class="p-empty"><div class="p-empty-icon">${IC.palette}</div>No colors found. Click Analyze.</div>`;

    const top = colors.slice(0,12);
    const all = colors;

    return `
      <div class="p-card">
        <div class="p-card-head">
          <span class="p-card-title">Top Colors (${colors.length} total)</span>
          <div class="p-card-actions">
            <button class="p-btn p-btn-ghost p-btn-sm" data-prism-export="css-vars" onclick="window.__prismCopyText__(window.__prismExport__('css-vars'))">
              ${IC.code} CSS Vars
            </button>
            <button class="p-btn p-btn-ghost p-btn-sm" data-prism-export="tailwind" onclick="window.__prismCopyText__(window.__prismExport__('tailwind'))">
              ${IC.code} Tailwind
            </button>
          </div>
        </div>
        ${top.map(c=>`
          <div class="p-color-row">
            <div class="p-color-dot" style="background:${c.hex}"></div>
            <div class="p-color-info">
              <span class="p-color-hex">${c.hex}</span>
              <span class="p-color-hsl">${c.hsl}</span>
            </div>
            <span class="p-color-count">${c.count}×</span>
            <button class="p-icon-btn" data-prism-copy="${c.hex}" onclick="window.__prismCopy__(this,'${c.hex}')" title="Copy hex">${IC.copy}</button>
          </div>`).join('')}
      </div>

      <div class="p-label">All Swatches</div>
      <div class="p-swatch-grid">
        ${all.map(c=>`
          <div class="p-swatch" style="background:${c.hex};cursor:pointer" title="Click to copy ${c.hex}" data-prism-copy="${c.hex}" onclick="window.__prismCopy__(this,'${c.hex}')"></div>`).join('')}
      </div>

      ${gradients.length ? `
        <div class="p-label" style="margin-top:16px">Gradients (${gradients.length})</div>
        ${gradients.map(g=>`
          <div class="p-card" style="padding:10px 12px;margin-bottom:8px">
            <div class="p-grad-bar" style="background:${g}"></div>
            <div class="p-grad-code">${safe(g.length>100?g.slice(0,100)+'…':g)}</div>
            <button class="p-icon-btn" style="margin-top:6px" data-prism-copy="${safe(g)}" onclick="window.__prismCopy__(this,'${g.replace(/'/g,"\\'")}')">
              ${IC.copy} <span style="font-size:10px;margin-left:3px">Copy</span>
            </button>
          </div>`).join('')}` : ''}

      ${cssVars.length ? `
        <div class="p-label" style="margin-top:16px">CSS Variables from :root</div>
        <div class="p-card">
          ${cssVars.map(v=>`
            <div class="p-var-row">
              <div class="p-var-dot" style="background:${v.value}"></div>
              <span class="p-var-name">${safe(v.name)}</span>
              <span class="p-var-val">${safe(v.value.length>20?v.value.slice(0,20)+'…':v.value)}</span>
              <button class="p-icon-btn" data-prism-copy="${safe(v.value)}" onclick="window.__prismCopy__(this,'${v.value.replace(/'/g,"\\'")}')">
                ${IC.copy}
              </button>
            </div>`).join('')}
        </div>` : ''}

      <div class="p-label" style="margin-top:16px">Export</div>
      <div class="p-card">
        <div class="p-card-head"><span class="p-card-title">CSS Custom Properties</span></div>
        <div class="p-code-block" id="code-css-vars">${safe(exportCSSVars(colors))}</div>
        <div class="p-export-row">
          <button class="p-btn p-btn-primary p-btn-sm" data-prism-export="css-vars" onclick="window.__prismCopyText__(window.__prismExport__('css-vars'))">${IC.copy} Copy CSS</button>
          <button class="p-btn p-btn-ghost p-btn-sm" data-prism-export="tailwind" onclick="window.__prismCopyText__(window.__prismExport__('tailwind'))">${IC.copy} Copy Tailwind</button>
        </div>
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════════════
     RENDER — TYPOGRAPHY
  ══════════════════════════════════════════════════════════════════ */
  function renderTypography(typography) {
    const { tags, families } = typography;
    if (!tags.length) return `<div class="p-empty"><div class="p-empty-icon">${IC.type}</div>No typography found. Click Analyze.</div>`;

    const tagColors = { h1:'#4f46e5',h2:'#6d28d9',h3:'#0891b2',h4:'#0e7490',h5:'#0f766e',h6:'#065f46',p:'#475569',a:'#1d4ed8',button:'#047857',li:'#374151',label:'#374151',span:'#374151',blockquote:'#7c3aed',figcaption:'#6b7280',caption:'#6b7280' };

    return `
      ${families && families.length ? `
        <div class="p-card">
          <div class="p-card-head">
            <span class="p-card-title">Font Families (${families.length})</span>
          </div>
          ${families.map(f => `
            <div class="p-ov-font">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                <span class="p-ov-font-name">${safe(f.family)}</span>
                <span style="font-size:12px;color:#334155;font-weight:600;font-family:'Inter',sans-serif">${f.weights.length ? f.weights.join(', ') : ''}</span>
              </div>
              <div style="font-family:'${safe(f.family)}',sans-serif;font-size:17px;font-weight:500;color:#0f172a;line-height:1.4;margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                The quick brown fox jumps over the lazy dog
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:4px">
                ${f.tags.map(tg => `<span class="p-tag-chip">&lt;${tg}&gt;</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="p-card">
        <div class="p-card-head">
          <span class="p-card-title">${tags.length} Tag Styles Detected</span>
          <button class="p-btn p-btn-ghost p-btn-sm" data-prism-export="type-css" onclick="window.__prismCopyText__(window.__prismExport__('type-css'))">
            ${IC.copy} Export CSS
          </button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">
          ${tags.map(t=>`<button class="p-tag-chip p-tag-btn" data-prism-highlight="${t.tag}" style="background:${tagColors[t.tag]||'#475569'}18;color:${tagColors[t.tag]||'#475569'};border:1px solid ${tagColors[t.tag]||'#475569'}30" onclick="window.__prismHighlight__('${t.tag}')" title="Highlight on page">&lt;${t.tag}&gt; ${t.count}</button>`).join('')}
        </div>
      </div>

      ${tags.map(t=>`
        <div class="p-type-card">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">
            <button class="p-type-tag ${t.tag}" data-prism-highlight="${t.tag}" onclick="window.__prismHighlight__('${t.tag}')" title="Click to scroll to and highlight on page" style="cursor:pointer;border:none">&lt;${t.tag}&gt;</button>
            <span class="p-sel-chip" data-prism-copy="${safe(t.selector)}" onclick="window.__prismCopy__(this,'${safe(t.selector)}')" title="Click to copy selector (${safe(t.selector)})" style="font-family:'Inter',sans-serif;font-size:11px;color:#0f172a;background:#f1f5f9;padding:3px 8px;border-radius:6px;cursor:pointer;font-weight:600;display:inline-flex;align-items:center;gap:4px;border:1px solid #e2e8f0">
              ${safe(t.selector)} ${t.w && t.h ? `<span style="color:#475569;font-weight:500">${t.w} × ${t.h}px</span>` : ''}
            </span>
            <span class="p-count-pill">${t.count} on page</span>
            <button class="p-icon-btn" style="margin-left:auto" data-prism-copy="${t.tag} { font-family: '${safe(t.family)}'; font-size: ${t.size}; font-weight: ${t.weight}; line-height: ${t.lineHeight}; color: ${t.colorHex}; }" onclick="window.__prismCopy__(this,\`${t.tag} { font-family: '${t.family.replace(/'/g,"\\'")}'; font-size: ${t.size}; font-weight: ${t.weight}; line-height: ${t.lineHeight}; color: ${t.colorHex}; }\`)" title="Copy CSS">
              ${IC.copy}
            </button>
          </div>
          <div class="p-type-preview" data-prism-highlight="${t.tag}" onclick="window.__prismHighlight__('${t.tag}')" title="Click to highlight on page" style="cursor:pointer;font-family:${t.family},sans-serif;font-size:${['h1','h2'].includes(t.tag)?'26px':['h3','h4'].includes(t.tag)?'20px':['h5','h6'].includes(t.tag)?'16px':'14px'};font-weight:${t.weight};color:#0f172a">
            ${t.sampleText || 'The quick brown fox jumps over the lazy dog'}
          </div>
          <div class="p-type-meta">
            <div class="p-type-prop">
              <span class="p-type-prop-lbl">Font Family</span>
              <span class="p-type-prop-val">${safe(t.family)}</span>
            </div>
            <div class="p-type-prop">
              <span class="p-type-prop-lbl">Font Size</span>
              <span class="p-type-prop-val">${t.size}</span>
            </div>
            <div class="p-type-prop">
              <span class="p-type-prop-lbl">Font Weight</span>
              <span class="p-type-prop-val">${t.weight}</span>
            </div>
            <div class="p-type-prop">
              <span class="p-type-prop-lbl">Line Height</span>
              <span class="p-type-prop-val">${t.lineHeight}</span>
            </div>
            <div class="p-type-prop">
              <span class="p-type-prop-lbl">Letter Spacing</span>
              <span class="p-type-prop-val">${t.letterSpacing}</span>
            </div>
            <div class="p-type-prop">
              <span class="p-type-prop-lbl">Color</span>
              <span class="p-type-prop-val" style="display:flex;align-items:center;gap:6px">
                <span style="width:12px;height:12px;border-radius:3px;background:${t.colorHex};border:1px solid rgba(0,0,0,0.15);flex-shrink:0"></span>
                ${t.colorHex}
              </span>
            </div>
          </div>
        </div>`).join('')}

      <div class="p-label" style="margin-top:4px">Typography CSS Export</div>
      <div class="p-card">
        <div class="p-card-head"><span class="p-card-title">All Styles as CSS</span></div>
        <div class="p-code-block">${safe(exportTypographyCSS(tags))}</div>
        <div class="p-export-row">
          <button class="p-btn p-btn-primary p-btn-sm" data-prism-export="type-css" onclick="window.__prismCopyText__(window.__prismExport__('type-css'))">${IC.copy} Copy All CSS</button>
        </div>
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════════════
     RENDER — ASSETS
  ══════════════════════════════════════════════════════════════════ */
  function renderAssets(assets) {
    const { images, backgrounds, svgs, videos } = assets;
    const totalImgs = images.length + backgrounds.length;
    if (!totalImgs && !svgs.length) return `<div class="p-empty"><div class="p-empty-icon">${IC.image}</div>No assets found. Click Analyze.</div>`;

    function safeUrl(u) { return u.replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }

    return `
      ${images.length ? `
        <div class="p-card">
          <div class="p-card-head">
            <span class="p-card-title">Images (${images.length})</span>
            <button class="p-btn p-btn-ghost p-btn-sm" data-prism-export="all-img-urls" onclick="window.__prismCopyText__(${JSON.stringify(images.map(i=>i.src).join('\n'))})">
              ${IC.copy} All URLs
            </button>
          </div>
          <div class="p-asset-grid">
            ${images.slice(0,10).map(img=>`
              <div class="p-asset-card">
                <div class="p-asset-thumb">
                  <img data-src="${safe(img.src)}" class="p-lazy-img" referrerpolicy="no-referrer" crossorigin="anonymous" />
                </div>
                <div class="p-asset-meta">
                  <div class="p-asset-name">${safe(fname(img.src))}</div>
                  <div class="p-asset-dim">${img.w&&img.h?img.w+'×'+img.h+'px · ':''}${img.type.toUpperCase()}</div>
                  <div class="p-asset-actions">
                    <button class="p-icon-btn p-btn-sm" data-prism-copy="${safe(img.src)}" onclick="window.__prismCopy__(this,'${safeUrl(img.src)}')" title="Copy URL">${IC.copy}</button>
                    <a class="p-icon-btn" href="${safe(img.src)}" download target="_blank" title="Download" style="display:flex;align-items:center;justify-content:center;text-decoration:none;color:#475569">${IC.download}</a>
                  </div>
                </div>
              </div>`).join('')}
          </div>
          ${images.length > 10 ? `
            <div class="p-label">All Images</div>
            ${images.slice(10).map(img=>`
              <div class="p-asset-row">
                <div class="p-asset-ico"><img data-src="${safe(img.src)}" class="p-lazy-img" referrerpolicy="no-referrer" crossorigin="anonymous" /></div>
                <div class="p-asset-info">
                  <div class="p-asset-nm">${safe(fname(img.src))}</div>
                  <div class="p-asset-tp">${img.w&&img.h?img.w+'×'+img.h+' · ':''}${img.type.toUpperCase()}</div>
                </div>
                <div class="p-asset-btns">
                  <button class="p-icon-btn" data-prism-copy="${safe(img.src)}" onclick="window.__prismCopy__(this,'${safeUrl(img.src)}')" title="Copy URL">${IC.copy}</button>
                  <a class="p-icon-btn" href="${safe(img.src)}" download target="_blank" style="display:flex;align-items:center;justify-content:center;text-decoration:none;color:#475569">${IC.download}</a>
                </div>
              </div>`).join('')}
          ` : ''}
        </div>` : ''}

      ${backgrounds.length ? `
        <div class="p-label">Background Images (${backgrounds.length})</div>
        <div class="p-card">
          ${backgrounds.map(bg=>`
            <div class="p-asset-row">
              <div class="p-asset-ico" style="background:url('${safe(bg.src)}') center/cover;border:1px solid #e2e8f0"></div>
              <div class="p-asset-info">
                <div class="p-asset-nm">${safe(fname(bg.src))}</div>
                <div class="p-asset-tp">Background · ${bg.type.toUpperCase()}</div>
              </div>
              <div class="p-asset-btns">
                <button class="p-icon-btn" data-prism-copy="${safe(bg.src)}" onclick="window.__prismCopy__(this,'${safeUrl(bg.src)}')" title="Copy URL">${IC.copy}</button>
                <a class="p-icon-btn" href="${safe(bg.src)}" download target="_blank" style="display:flex;align-items:center;justify-content:center;text-decoration:none;color:#cbd5e1">${IC.download}</a>
              </div>
            </div>`).join('')}
        </div>` : ''}

      ${svgs.length ? `
        <div class="p-label">Inline SVG Elements (${svgs.length})</div>
        <div class="p-svg-grid">
          ${svgs.map((s,i)=>`
            <div class="p-svg-card" data-svg-open="${i}" onclick="window.__prismSvgOpen__(${i})" title="Click to export SVG #${i+1}">
              <div class="p-svg-canvas" data-svg-idx="${s.idx}"></div>
              <div class="p-svg-meta">${s.w}\u00d7${s.h}px</div>
              <div class="p-svg-hint">Click to export</div>
            </div>`).join('')}
        </div>` : ''}

      ${videos.length ? `
        <div class="p-label" style="margin-top:14px">Videos (${videos.length})</div>
        <div class="p-card">
          ${videos.map(v=>`
            <div class="p-asset-row">
              <div class="p-asset-ico" style="color:#94a3b8;font-size:18px">▶</div>
              <div class="p-asset-info"><div class="p-asset-nm">${safe(fname(v.src))}</div><div class="p-asset-tp">${v.w&&v.h?v.w+'×'+v.h+'px':''}</div></div>
              <button class="p-icon-btn" data-prism-copy="${safe(v.src)}" onclick="window.__prismCopy__(this,'${safeUrl(v.src)}')" title="Copy URL">${IC.copy}</button>
            </div>`).join('')}
        </div>` : ''}
    `;
  }

  /* ══════════════════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════════════════ */
  function init() {
    const host = document.createElement('div');
    host.id = 'prism-host';
    Object.assign(host.style, { position:'fixed', top:'0', right:'0', width:'0', height:'0', zIndex:'2147483645', pointerEvents:'none' });

    const shadow = host.attachShadow({ mode:'open' });

    const styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    shadow.appendChild(styleEl);

    const root = document.createElement('div');
    root.innerHTML = `
      <div class="p-panel" id="pp">
        <div class="p-header">
          <div class="p-logo">${IC.layers}</div>
          <div style="flex:1;min-width:0">
            <div class="p-title">Prism</div>
            <div class="p-subtitle">Design Inspector · Colors · Type · Assets</div>
          </div>
          <button class="p-close" id="pc">${IC.close}</button>
        </div>

        <div class="p-analyze-bar">
          <span class="p-analyze-note" id="pn">Click Analyze to scan this page</span>
          <button class="p-btn p-btn-primary" id="pa">${IC.scan} Analyze</button>
        </div>

        <div class="p-tabs" id="ptabs">
          <button class="p-tab active" data-tab="overview">${IC.overview}<span>Overview</span></button>
          <button class="p-tab" data-tab="colors">${IC.palette}<span>Colors</span></button>
          <button class="p-tab" data-tab="type">${IC.type}<span>Type</span></button>
          <button class="p-tab" data-tab="assets">${IC.image}<span>Assets</span></button>
        </div>

        <div class="p-scroll">
          <div class="p-pane active" id="tab-overview">
            <div class="p-empty"><div class="p-empty-icon">${IC.scan}</div>Click <strong>Analyze</strong> to extract design tokens from this page.</div>
          </div>
          <div class="p-pane" id="tab-colors">
            <div class="p-empty"><div class="p-empty-icon">${IC.palette}</div>Click <strong>Analyze</strong> to extract colors.</div>
          </div>
          <div class="p-pane" id="tab-type">
            <div class="p-empty"><div class="p-empty-icon">${IC.type}</div>Click <strong>Analyze</strong> to inspect typography.</div>
          </div>
          <div class="p-pane" id="tab-assets">
            <div class="p-empty"><div class="p-empty-icon">${IC.image}</div>Click <strong>Analyze</strong> to find assets.</div>
          </div>
        </div>

        <!-- SVG detail modal (inside panel, above scroll) -->
        <div id="prism-svg-modal" style="display:none;position:absolute;inset:0;z-index:20;background:rgba(15,23,42,0.6);backdrop-filter:blur(6px);align-items:center;justify-content:center;padding:16px;flex-direction:column">
          <div style="background:#fff;border-radius:16px;width:100%;max-width:320px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.28);display:flex;flex-direction:column">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px 0">
              <div>
                <div style="font-size:13px;font-weight:700;color:#0f172a;font-family:'Inter',sans-serif" id="prism-svg-title">SVG Element</div>
                <div style="font-size:11px;color:#64748b;margin-top:2px;font-family:'Space Mono',monospace" id="prism-svg-dims"></div>
              </div>
              <button id="prism-svg-close" style="width:30px;height:30px;border-radius:8px;border:none;background:#f1f5f9;cursor:pointer;font-size:16px;color:#64748b;display:flex;align-items:center;justify-content:center;font-family:sans-serif" title="Close">&#x2715;</button>
            </div>
            <div id="prism-svg-preview" style="display:flex;align-items:center;justify-content:center;min-height:150px;background:repeating-conic-gradient(#f1f5f9 0% 25%,#fff 0% 50%) 0 0/16px 16px;margin:14px 16px;border-radius:10px;border:1px solid #e2e8f0;padding:16px;overflow:hidden"></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 16px 16px">
              <button class="p-modal-btn p-modal-btn-primary" id="prism-svg-dl-svg">${IC.download} SVG File</button>
              <button class="p-modal-btn" id="prism-svg-dl-png">${IC.download} PNG Image</button>
              <button class="p-modal-btn" id="prism-svg-cp-svg">${IC.copy} Copy SVG</button>
              <button class="p-modal-btn" id="prism-svg-cp-jsx">${IC.code} Copy React</button>
            </div>
          </div>
        </div>

        <!-- Floating Copied Toast -->
        <div id="prism-toast" class="p-toast">
          <span class="p-toast-icon">${IC.check}</span>
          <span class="p-toast-msg" id="prism-toast-msg">Copied to clipboard!</span>
        </div>
      </div>
    `;
    shadow.appendChild(root);
    document.body.appendChild(host);

    const panel    = shadow.getElementById('pp');
    const closeBtn = shadow.getElementById('pc');
    const analyzeB = shadow.getElementById('pa');
    const noteEl   = shadow.getElementById('pn');
    const tabBtns  = shadow.querySelectorAll('.p-tab');
    let isOpen = false;
    let extracted = (typeof window !== 'undefined' && window.__prismExtracted__) || null;

    function exportByType(type) {
      const data = extracted || (typeof window !== 'undefined' && window.__prismExtracted__) || null;
      if (!data) return '';
      if (type === 'css-vars')     return exportCSSVars(data.colors);
      if (type === 'tailwind')     return exportTailwind(data.colors);
      if (type === 'type-css')     return exportTypographyCSS(data.typography);
      if (type === 'all-img-urls') return exportAllImgUrls(data.assets);
      return '';
    }
    window.__prismExport__ = exportByType;

    function updateDockBtnState(active) {
      const sr = getMesurerSR();
      if (!sr) return;
      const btn = sr.getElementById('prism-dock-btn');
      if (btn) {
        if (active) btn.classList.add('p-active');
        else btn.classList.remove('p-active');
      }
    }

    function openPanel()  {
      isOpen = true;
      panel.classList.add('open');
      updateDockBtnState(true);
      if (!extracted) {
        setTimeout(() => {
          if (analyzeB && !analyzeB.disabled) analyzeB.click();
        }, 50);
      }
    }
    function closePanel() {
      isOpen = false;
      panel.classList.remove('open');
      updateDockBtnState(false);
    }

    // Toggle via extension toolbar icon click (message from background.js)
    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg?.type === 'prism:toggle') {
          tryInjectMesurerDock();
          isOpen ? closePanel() : openPanel();
        }
      });
    }

    // ── SVG detail modal wiring ───────────────────────────────────
    const svgModal    = shadow.getElementById('prism-svg-modal');
    const svgPreview  = shadow.getElementById('prism-svg-preview');
    const svgDims     = shadow.getElementById('prism-svg-dims');
    const svgTitle    = shadow.getElementById('prism-svg-title');
    const svgCloseBtn = shadow.getElementById('prism-svg-close');
    const svgDlSvg    = shadow.getElementById('prism-svg-dl-svg');
    const svgDlPng    = shadow.getElementById('prism-svg-dl-png');
    const svgCpSvg    = shadow.getElementById('prism-svg-cp-svg');
    const svgCpJsx    = shadow.getElementById('prism-svg-cp-jsx');
    let svgCurrentIdx = 0;

    function openSvgModal(i) {
      const svgs = window.__prismSvgData__ || [];
      const s = svgs[i];
      if (!s) return;
      svgCurrentIdx = i;
      svgTitle.textContent = `SVG ${i + 1} of ${svgs.length}`;
      svgDims.textContent  = `${s.w} × ${s.h} px  ·  vector asset`;
      svgPreview.innerHTML = '';

      let previewNode = null;
      const node = (window.__prismSvgNodes__ || [])[s.idx];
      if (node) {
        previewNode = node.cloneNode(true);
      } else if (s.code) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(ensureSvgXmlns(s.code), 'image/svg+xml');
          previewNode = doc.querySelector('svg');
        } catch (_) {}
      }

      if (previewNode) {
        if (!previewNode.getAttribute('viewBox')) {
          previewNode.setAttribute('viewBox', `0 0 ${s.w || 24} ${s.h || 24}`);
        }
        previewNode.setAttribute('width', '120');
        previewNode.setAttribute('height', '120');
        previewNode.style.cssText = 'display:block;max-width:140px;max-height:140px;width:auto;height:auto;object-fit:contain;margin:auto;';
        svgPreview.appendChild(previewNode);
      }
      svgModal.style.display = 'flex';
    }
    function closeSvgModal() { if (svgModal) svgModal.style.display = 'none'; }

    if (svgCloseBtn) svgCloseBtn.addEventListener('click', closeSvgModal);
    if (svgModal) svgModal.addEventListener('click', e => { if (e.target === svgModal) closeSvgModal(); });

    let _toastTimer = null;
    function showToast(msg) {
      const toast = shadow.getElementById('prism-toast');
      const toastMsg = shadow.getElementById('prism-toast-msg');
      if (!toast || !toastMsg) return;
      toastMsg.textContent = msg || 'Copied to clipboard!';
      toast.classList.add('show');
      clearTimeout(_toastTimer);
      _toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 1800);
    }

    function triggerCopyAnimation(el, textOrLabel) {
      if (!el) return;

      // Add bounce pop animation and glowing emerald state
      el.classList.remove('p-copy-animated');
      void el.offsetWidth; // force reflow for animation restart
      el.classList.add('p-copy-animated');
      el.classList.add('p-copied');

      // Preserve original content for smooth restoration
      if (!el.dataset.origHtml) {
        el.dataset.origHtml = el.innerHTML;
      }

      if (el.classList.contains('p-btn')) {
        el.innerHTML = `${IC.check} Copied!`;
      } else if (el.classList.contains('p-icon-btn')) {
        el.innerHTML = IC.check;
      } else if (el.classList.contains('p-color-chip') || el.classList.contains('p-sel-chip')) {
        const span = el.querySelector('.p-color-chip-text') || el.querySelector('span:last-child') || el.querySelector('span');
        if (span) {
          if (!span.dataset.origText) span.dataset.origText = span.textContent;
          span.textContent = 'Copied!';
        }
      } else if (el.classList.contains('p-strip-s') || el.classList.contains('p-swatch')) {
        el.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.6))">${IC.check}</span>`;
      } else if (el.classList.contains('p-ov-font-name-wrap')) {
        const span = el.querySelector('.p-ov-font-name') || el.querySelector('span');
        if (span) {
          if (!span.dataset.origText) span.dataset.origText = span.textContent;
          span.textContent = 'Copied!';
        }
      } else if (el.classList.contains('p-ov-img-card')) {
        let badge = el.querySelector('.p-img-copied-badge');
        if (!badge) {
          badge = document.createElement('div');
          badge.className = 'p-img-copied-badge';
          badge.innerHTML = `${IC.check} Copied!`;
          el.appendChild(badge);
          setTimeout(() => badge && badge.remove(), 1500);
        }
      } else if (el.classList.contains('p-modal-btn')) {
        el.innerHTML = `${IC.check} Copied!`;
      } else {
        const span = el.querySelector('span');
        if (span) {
          if (!span.dataset.origText) span.dataset.origText = span.textContent;
          span.textContent = 'Copied!';
        }
      }

      // Show sleek floating toast notification
      let preview = '';
      if (textOrLabel) {
        const clean = String(textOrLabel).trim();
        if (clean.length > 30) preview = clean.slice(0, 27) + '…';
        else preview = clean;
      }
      showToast(preview ? `Copied: ${preview}` : 'Copied to clipboard!');

      // Revert after 1500ms
      setTimeout(() => {
        el.classList.remove('p-copied');
        el.classList.remove('p-copy-animated');
        if (el.dataset.origHtml) {
          el.innerHTML = el.dataset.origHtml;
          delete el.dataset.origHtml;
        }
        const span = el.querySelector('.p-color-chip-text') || el.querySelector('.p-ov-font-name') || el.querySelector('span:last-child') || el.querySelector('span');
        if (span && span.dataset.origText) {
          span.textContent = span.dataset.origText;
          delete span.dataset.origText;
        }
      }, 1500);
    }

    function btnFlash(btn, label = 'Done') {
      if (!btn) return;
      const was = btn.innerHTML;
      btn.innerHTML = `${IC.check} ${label}`;
      btn.classList.add('p-copied');
      btn.classList.add('p-copy-animated');
      showToast(label ? `${label}!` : 'Done!');
      setTimeout(() => {
        btn.innerHTML = was;
        btn.classList.remove('p-copied');
        btn.classList.remove('p-copy-animated');
      }, 1600);
    }

    if (svgDlSvg) {
      svgDlSvg.addEventListener('click', (e) => {
        e.stopPropagation();
        const s = (window.__prismSvgData__ || [])[svgCurrentIdx];
        if (s) {
          svgDownloadSvg(s.code, `icon-${svgCurrentIdx + 1}.svg`);
          btnFlash(svgDlSvg, 'SVG Downloaded');
        }
      });
    }

    if (svgDlPng) {
      svgDlPng.addEventListener('click', (e) => {
        e.stopPropagation();
        const s = (window.__prismSvgData__ || [])[svgCurrentIdx];
        if (s) {
          svgDownloadPng(s.code, Math.max(s.w, 64), Math.max(s.h, 64), `icon-${svgCurrentIdx + 1}.png`);
          btnFlash(svgDlPng, 'PNG Downloaded');
        }
      });
    }

    if (svgCpSvg) {
      svgCpSvg.addEventListener('click', (e) => {
        e.stopPropagation();
        const s = (window.__prismSvgData__ || [])[svgCurrentIdx];
        if (s) {
          const fullSvg = ensureSvgXmlns(s.code);
          copyToClipboard(fullSvg).then(() => {
            triggerCopyAnimation(svgCpSvg, 'SVG Code');
          });
        }
      });
    }

    if (svgCpJsx) {
      svgCpJsx.addEventListener('click', (e) => {
        e.stopPropagation();
        const s = (window.__prismSvgData__ || [])[svgCurrentIdx];
        if (s) {
          const jsx = svgToReact(s.code, `Icon${svgCurrentIdx + 1}`);
          copyToClipboard(jsx).then(() => {
            triggerCopyAnimation(svgCpJsx, 'React Component');
          });
        }
      });
    }

    window.__prismSvgOpen__ = openSvgModal;

    // Event delegation on shadow root for click reliability across world contexts
    shadow.addEventListener('click', (e) => {
      // 1. SVG card click -> open SVG modal
      const svgCard = e.target.closest('.p-svg-card');
      if (svgCard) {
        const idxStr = svgCard.getAttribute('data-svg-open');
        if (idxStr !== null) {
          const idx = parseInt(idxStr, 10);
          if (!isNaN(idx)) {
            openSvgModal(idx);
            return;
          }
        }
      }

      // 2. Tag highlight click
      const hlEl = e.target.closest('[data-prism-highlight]');
      if (hlEl) {
        const tag = hlEl.getAttribute('data-prism-highlight');
        if (tag && window.__prismHighlight__) {
          window.__prismHighlight__(tag);
          return;
        }
      }

      // 3. Any element with data-prism-copy attribute
      const copyEl = e.target.closest('[data-prism-copy]');
      if (copyEl) {
        e.preventDefault();
        e.stopPropagation();
        const text = copyEl.getAttribute('data-prism-copy');
        if (text !== null) {
          copyToClipboard(text).then(() => {
            triggerCopyAnimation(copyEl, text);
          });
        }
        return;
      }

      // 4. Any element with data-prism-export attribute
      const expEl = e.target.closest('[data-prism-export]');
      if (expEl) {
        e.preventDefault();
        e.stopPropagation();
        const type = expEl.getAttribute('data-prism-export');
        const code = exportByType(type);
        if (code) {
          copyToClipboard(code).then(() => {
            triggerCopyAnimation(expEl, type.toUpperCase());
          });
        } else {
          showToast('Please analyze the page first');
        }
        return;
      }

      // 5. Fallback for any legacy onclick containing __prismCopy
      const legacyEl = e.target.closest('[onclick*="__prismCopy"]');
      if (legacyEl) {
        e.preventDefault();
        e.stopPropagation();
        const oc = legacyEl.getAttribute('onclick') || '';
        let textToCopy = '';
        if (oc.includes("__prismExport__('css-vars')")) {
          textToCopy = exportByType('css-vars');
        } else if (oc.includes("__prismExport__('tailwind')")) {
          textToCopy = exportByType('tailwind');
        } else if (oc.includes("__prismExport__('type-css')")) {
          textToCopy = exportByType('type-css');
        } else if (oc.includes('__prismCopyText__') && oc.includes('JSON.stringify')) {
          textToCopy = exportByType('all-img-urls');
        } else {
          const m = oc.match(/__prismCopy(?:Text)?__\((?:this,)?\s*['"`]([\s\S]*?)['"`]\)/);
          if (m && m[1]) textToCopy = m[1].replace(/\\'/g, "'").replace(/\\"/g, '"');
        }
        if (textToCopy) {
          copyToClipboard(textToCopy).then(() => {
            triggerCopyAnimation(legacyEl, textToCopy);
          });
        }
        return;
      }
    });

    closeBtn.addEventListener('click', closePanel);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closePanel(); }, true);

    tabBtns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        tabBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        shadow.querySelectorAll('.p-pane').forEach(p=>p.classList.remove('active'));
        shadow.getElementById('tab-'+btn.dataset.tab).classList.add('active');
      });
    });

    analyzeB.addEventListener('click', ()=>{
      analyzeB.disabled = true;
      analyzeB.innerHTML = IC.scan + ' Scanning…';
      noteEl.textContent = 'Scanning page…';
      setTimeout(()=>{
        try {
          const colors     = extractColors();
          const typography = extractTypography();
          const assets     = extractAssets();
          extracted = { colors, typography, assets };
          window.__prismExtracted__ = extracted;

          shadow.getElementById('tab-overview').innerHTML = renderOverview(extracted);
          shadow.getElementById('tab-colors').innerHTML   = renderColors(colors);
          shadow.getElementById('tab-type').innerHTML     = renderTypography(typography);
          shadow.getElementById('tab-assets').innerHTML   = renderAssets(assets);
          // Store SVG data for download/copy handlers
          window.__prismSvgData__ = assets.svgs;
          activateLazyImgs();
          activateSvgPreviews(); // safe DOM append, no innerHTML for SVGs

          noteEl.textContent = `${colors.colors.length} colors · ${typography.families.length} fonts · ${assets.images.length+assets.backgrounds.length} imgs`;
        } catch(err) {
          noteEl.textContent = 'Error — try re-analyzing';
          console.error('[Prism]', err);
        }
        analyzeB.disabled = false;
        analyzeB.innerHTML = IC.scan + ' Re-analyze';
      }, 80);
    });

    // ── Highlight element on page ─────────────────────────────
    let _highlightIdx = {};
    window.__prismHighlight__ = function(tag) {
      try {
        const els = Array.from(document.querySelectorAll(tag)).filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && el.textContent.trim().length > 0;
        });
        if (!els.length) return;
        _highlightIdx[tag] = ((_highlightIdx[tag] || 0) + 1) % els.length;
        const target = els[_highlightIdx[tag]] || els[0];
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const ov = document.createElement('div');
        const r = target.getBoundingClientRect();
        Object.assign(ov.style, {
          position: 'fixed',
          top: (r.top - 4) + 'px', left: (r.left - 4) + 'px',
          width: (r.width + 8) + 'px', height: (r.height + 8) + 'px',
          border: '2px solid #0d99ff',
          borderRadius: '6px',
          background: 'rgba(13,153,255,0.12)',
          zIndex: '2147483643',
          pointerEvents: 'none',
          transition: 'opacity 0.6s ease',
          boxShadow: '0 0 0 4px rgba(13,153,255,0.22)',
          animation: 'none',
        });
        document.body.appendChild(ov);
        setTimeout(() => { ov.style.opacity = '0'; setTimeout(() => ov.remove(), 600); }, 1600);
      } catch(_) {}
    };

    // ── Lazy-load images via data-src, fetch() fallback to bypass CSP ──
    // ── Safe SVG preview: appendChild into placeholder, never innerHTML ──
    function activateSvgPreviews() {
      shadow.querySelectorAll('.p-svg-canvas[data-svg-idx]').forEach(container => {
        const idx = parseInt(container.getAttribute('data-svg-idx'), 10);
        const node = (window.__prismSvgNodes__ || [])[idx];
        if (!node) return;
        container.removeAttribute('data-svg-idx');
        try {
          container.appendChild(node.cloneNode(true));
        } catch(_) {}
      });
    }

    function activateLazyImgs() {
      shadow.querySelectorAll('img.p-lazy-img[data-src]').forEach(img => {
        const src = img.getAttribute('data-src');
        if (!src) return;
        img.removeAttribute('data-src');
        img.setAttribute('referrerpolicy', 'no-referrer');
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.25s ease';

        function showFallback() {
          img.style.display = 'none';
          if (!img.parentElement.querySelector('.p-img-fb')) {
            const fb = document.createElement('div');
            fb.className = 'p-img-fb';
            fb.innerHTML = IC.image;
            fb.style.cssText = 'color:#cbd5e1;display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:22px';
            img.parentElement.appendChild(fb);
          }
        }

        img.onload = function() { this.style.opacity = '1'; };
        img.onerror = function() {
          fetch(src, { mode: 'cors', credentials: 'omit' })
            .then(r => { if (!r.ok) throw 0; return r.blob(); })
            .then(b => {
              const blobUrl = URL.createObjectURL(b);
              img.onload = () => { img.style.opacity = '1'; };
              img.onerror = showFallback;
              img.src = blobUrl;
            })
            .catch(showFallback);
        };
        img.src = src;
      });
    }

    // ── SVG global action handlers ────────────────────────────────
    window.__prismSvgData__ = [];
    window.__prismSvgSvg__ = function(i) {
      const s = (window.__prismSvgData__ || [])[i];
      if (!s) return;
      svgDownloadSvg(s.code, `icon-${i+1}.svg`);
    };
    window.__prismSvgPng__ = function(i) {
      const s = (window.__prismSvgData__ || [])[i];
      if (!s) return;
      svgDownloadPng(s.code, Math.max(s.w, 64), Math.max(s.h, 64), `icon-${i+1}.png`);
    };
    window.__prismSvgCode__ = function(i) {
      const s = (window.__prismSvgData__ || [])[i];
      if (!s) return;
      copyToClipboard(ensureSvgXmlns(s.code));
    };
    window.__prismSvgReact__ = function(i) {
      const s = (window.__prismSvgData__ || [])[i];
      if (!s) return;
      copyToClipboard(svgToReact(s.code, `Icon${i+1}`));
    };

    // ── Find Mesurer's Shadow Root across DOM locations ────────────
    function getMesurerSR() {
      const host = document.getElementById('mesurer-extension-host') ||
                   document.querySelector('#mesurer-extension-host');
      if (host && host.shadowRoot) return host.shadowRoot;

      for (const child of Array.from(document.documentElement.children)) {
        if (child.shadowRoot && (child.id === 'mesurer-extension-host' || child.shadowRoot.querySelector('.mesurer-toolbar-surface'))) {
          return child.shadowRoot;
        }
      }
      if (document.body) {
        for (const child of Array.from(document.body.children)) {
          if (child.shadowRoot && (child.id === 'mesurer-extension-host' || child.shadowRoot.querySelector('.mesurer-toolbar-surface'))) {
            return child.shadowRoot;
          }
        }
      }
      return null;
    }

    // ── Inject Prism button into Mesurer dock beside Sample Color ──
    function tryInjectMesurerDock() {
      const sr = getMesurerSR();
      if (!sr) return;

      watchShadowRoot(sr);

      // Inject dock styling into Mesurer's shadow root
      if (!sr.getElementById('prism-dock-style')) {
        const st = document.createElement('style');
        st.id = 'prism-dock-style';
        st.textContent = `
          #prism-dock-wrapper {
            display: inline-flex;
            align-items: center;
            position: relative;
            vertical-align: middle;
          }
          #prism-dock-btn {
            width: 32px; height: 32px; border-radius: 8px;
            background: none; border: none; cursor: pointer;
            display: inline-flex; align-items: center; justify-content: center;
            color: #1e293b; padding: 0; flex-shrink: 0;
            transition: background 0.15s, color 0.15s, transform 0.1s;
            vertical-align: middle; outline: none;
          }
          #prism-dock-btn:hover {
            background: rgba(0,0,0,0.08);
            color: #0d99ff;
          }
          #prism-dock-btn.p-active {
            background: #0d99ff !important;
            color: #ffffff !important;
          }
        `;
        sr.appendChild(st);
      }

      // If button exists and is connected, update active state
      const existingBtn = sr.getElementById('prism-dock-btn');
      if (existingBtn && existingBtn.isConnected) {
        if (isOpen) existingBtn.classList.add('p-active');
        else existingBtn.classList.remove('p-active');
        return;
      }

      // Build button wrapper
      const wrap = document.createElement('div');
      wrap.id = 'prism-dock-wrapper';
      wrap.className = 'msr:relative';
      wrap.setAttribute('data-tool-id', 'prism-assets');

      const btn = document.createElement('button');
      btn.id = 'prism-dock-btn';
      btn.type = 'button';
      btn.className = 'msr:flex msr:size-8 msr:select-none msr:items-center msr:justify-center msr:rounded-[8px] msr:outline-none';
      if (isOpen) btn.classList.add('p-active');
      btn.title = 'Prism — Assets, Typography & Tokens';
      btn.setAttribute('aria-label', 'Assets & Design Tokens (Prism)');
      btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOpen) closePanel();
        else openPanel();
      });

      wrap.appendChild(btn);

      // Preferred position: directly beside "Sample color" tool
      const colorPicker = sr.querySelector('[data-tool-id="color-picker"]');
      if (colorPicker && colorPicker.parentNode) {
        colorPicker.after(wrap);
        return;
      }

      // Fallback 1: tool panel
      const toolPanel = sr.querySelector('.mesurer-toolbar-tool-panel');
      if (toolPanel) {
        const target = toolPanel.firstElementChild || toolPanel;
        target.appendChild(wrap);
        return;
      }

      // Fallback 2: minimize slot / surface
      const slot = sr.querySelector('.mesurer-toolbar-minimize-slot') || sr.querySelector('.mesurer-toolbar-surface');
      if (slot) {
        slot.appendChild(wrap);
      }
    }

    let _observedSr = null;
    function watchShadowRoot(sr) {
      if (_observedSr === sr) return;
      _observedSr = sr;
      const srObs = new MutationObserver(() => {
        if (!sr.getElementById('prism-dock-btn')) {
          tryInjectMesurerDock();
        }
      });
      srObs.observe(sr, { childList: true, subtree: true });
    }

    // Observe documentElement for Mesurer host creation
    const _docObs = new MutationObserver(tryInjectMesurerDock);
    _docObs.observe(document.documentElement, { childList: true, subtree: true });

    // Ongoing check for dynamic tool switching in Mesurer
    setInterval(tryInjectMesurerDock, 1000);
    tryInjectMesurerDock();
    window.__prismCopy__ = function(btn, text) {
      copyToClipboard(text).then(()=>{
        triggerCopyAnimation(btn, text);
      });
    };

    window.__prismCopyText__ = function(text) {
      copyToClipboard(text).then(()=>{
        showToast(text ? `Copied: ${String(text).slice(0, 25)}` : 'Copied to clipboard!');
      });
    };

    window.__prismExport__ = exportByType;
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
