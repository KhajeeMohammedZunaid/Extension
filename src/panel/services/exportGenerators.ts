import { ExtractedColors, ExtractedTypography, ExtractedAssets } from '../types';

export function ensureSvgXmlns(svgCode: string): string {
  if (!svgCode) return '';
  let res = svgCode.trim();
  if (!res.includes('xmlns=')) {
    res = res.replace(/<svg\b([^>]*)>/i, '<svg$1 xmlns="http://www.w3.org/2000/svg">');
  }
  if (!res.includes('xmlns:xlink=') && res.includes('xlink:href')) {
    res = res.replace(/<svg\b([^>]*)>/i, '<svg$1 xmlns:xlink="http://www.w3.org/1999/xlink">');
  }
  return res;
}

export function exportCSSVars(colors: ExtractedColors | null | undefined): string {
  const list = colors?.colors || [];
  const top = list.slice(0, 24);
  if (!top.length) return ':root {\n  /* No colors extracted yet */\n}';
  return `:root {\n${top.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`;
}

export function exportTailwind(colors: ExtractedColors | null | undefined): string {
  const list = colors?.colors || [];
  const top = list.slice(0, 24);
  if (!top.length) return `module.exports = {\n  theme: {\n    extend: {\n      colors: {}\n    }\n  }\n};`;
  return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${top.map((c, i) => `        'c${i + 1}': '${c.hex}',`).join('\n')}\n      }\n    }\n  }\n};`;
}

export function exportTypographyCSS(typography: ExtractedTypography | null | undefined): string {
  const tags = typography?.tags || [];
  if (tags.length) {
    return tags.map(t =>
      `${t.tag} {\n  font-family: '${t.family}', sans-serif;\n  font-size: ${t.size || '16px'};\n  font-weight: ${t.weight || '400'};\n  line-height: ${t.lineHeight || '1.5'};\n  letter-spacing: ${t.letterSpacing || 'normal'};\n  color: ${t.colorHex || '#0f172a'};\n}`
    ).join('\n\n');
  }
  const families = typography?.families || [];
  if (families.length) {
    return families.map((f, i) =>
      `:root {\n  --font-family-${i + 1}: '${f.family}', sans-serif;\n}`
    ).join('\n\n');
  }
  return '/* No typography detected */';
}

export function exportAllImgUrls(assets: ExtractedAssets | null | undefined): string {
  const imgs = (assets?.images || []).map(i => i.src);
  const bgs = (assets?.backgrounds || []).map(b => b.src);
  const unique = [...new Set([...imgs, ...bgs])];
  return unique.join('\n') || '/* No images found */';
}

export function svgToReact(svgCode: string, name: string = 'Icon'): string {
  const fullSvg = ensureSvgXmlns(svgCode);
  const props: [string, string][] = [
    ['class=', 'className='],
    ['stroke-width=', 'strokeWidth='],
    ['stroke-linecap=', 'strokeLinecap='],
    ['stroke-linejoin=', 'strokeLinejoin='],
    ['fill-opacity=', 'fillOpacity='],
    ['fill-rule=', 'fillRule='],
    ['clip-rule=', 'clipRule='],
    ['stop-color=', 'stopColor='],
    ['stop-opacity=', 'stopOpacity='],
    ['xlink:href=', 'xlinkHref='],
    ['xmlns:xlink=', 'xmlnsXlink='],
    ['xml:space=', 'xmlSpace='],
    ['tabindex=', 'tabIndex='],
    ['viewbox=', 'viewBox='],
    ['stroke-miterlimit=', 'strokeMiterlimit='],
    ['clip-path=', 'clipPath='],
    ['font-family=', 'fontFamily='],
    ['font-size=', 'fontSize='],
    ['font-weight=', 'fontWeight=']
  ];
  let jsx = fullSvg.replace(/<\?xml[^>]*>/g, '').replace(/<!--[\s\S]*?-->/g, '').trim();
  for (const [from, to] of props) jsx = jsx.split(from).join(to);
  // Self-close empty tags
  jsx = jsx.replace(/<(\w+)([^>]*)><\/\1>/g, (_, tag, attrs) => `<${tag}${attrs} />`);
  return `import React from 'react';\n\nexport const ${name} = ({ size = 24, color = 'currentColor', ...props }: { size?: number | string; color?: string; [key: string]: any }) => (\n  ${jsx.replace(/<svg/, '<svg width={size} height={size}').replace(/stroke="[^"]*"/, 'stroke={color}')}\n);\n\nexport default ${name};`;
}

export function svgDownloadSvg(svgCode: string, filename: string = 'icon.svg'): void {
  const code = ensureSvgXmlns(svgCode);
  const blob = new Blob([code], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 1000);
}

export function svgDownloadPng(svgCode: string, width: number, height: number, filename: string = 'icon.png'): void {
  try {
    const fullSvg = ensureSvgXmlns(svgCode);
    const canvas = document.createElement('canvas');
    const scale = 2; // 2x crispness
    const w = Math.max(width || 64, 48);
    const h = Math.max(height || 64, 48);
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    const svgBlob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(blobUrl);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          a.remove();
          URL.revokeObjectURL(pngUrl);
        }, 1000);
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      // Fallback: download direct svg if canvas rasterization blocked
      svgDownloadSvg(svgCode, filename.replace(/\.png$/, '.svg'));
    };

    img.src = blobUrl;
  } catch (_) {
    svgDownloadSvg(svgCode, filename.replace(/\.png$/, '.svg'));
  }
}
