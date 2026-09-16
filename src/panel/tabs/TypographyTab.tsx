import React, { useState, useRef } from 'react';
import { Copy, Type, Check } from 'lucide-react';
import { ExtractedTypography, TypographyTag } from '../types';
import { exportTypographyCSS } from '../services/exportGenerators';
import { copyToClipboard } from '../services/clipboard';

interface TypographyTabProps {
  typography: ExtractedTypography | null;
  onToast: (msg: string) => void;
}

export const TypographyTab: React.FC<TypographyTabProps> = ({ typography, onToast }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const highlightIdxRef = useRef<{ [tag: string]: number }>({});

  if (!typography || (!typography.tags.length && !typography.families.length)) {
    return (
      <div className="p-empty">
        <div className="p-empty-icon">
          <Type size={22} />
        </div>
        Click <strong>Analyze</strong> to inspect typography from this page.
      </div>
    );
  }

  const handleCopy = async (key: string, text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      onToast(`Copied: ${label}`);
      setTimeout(() => setCopiedKey(null), 1500);
    }
  };

  const highlightTagOnPage = (tag: string) => {
    try {
      const els = Array.from(document.querySelectorAll(tag)).filter(el => {
        if (el.closest('#prism-host') || el.closest('#mesurer-extension-host')) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && (el.textContent?.trim().length || 0) > 0;
      });

      if (!els.length) {
        onToast(`No visible <${tag}> found`);
        return;
      }

      const curIdx = ((highlightIdxRef.current[tag] || 0) + 1) % els.length;
      highlightIdxRef.current[tag] = curIdx;
      const target = els[curIdx] || els[0];

      target.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Create glowing blue highlight ring
      const ov = document.createElement('div');
      const r = target.getBoundingClientRect();
      Object.assign(ov.style, {
        position: 'fixed',
        top: `${r.top - 4}px`,
        left: `${r.left - 4}px`,
        width: `${r.width + 8}px`,
        height: `${r.height + 8}px`,
        border: '2px solid #0d99ff',
        borderRadius: '6px',
        background: 'rgba(13, 153, 255, 0.12)',
        zIndex: '2147483643',
        pointerEvents: 'none',
        boxShadow: '0 0 0 4px rgba(13, 153, 255, 0.22)',
        transition: 'opacity 0.6s ease'
      });
      document.body.appendChild(ov);

      onToast(`Scrolled to <${tag}> #${curIdx + 1}`);

      setTimeout(() => {
        ov.style.opacity = '0';
        setTimeout(() => ov.remove(), 600);
      }, 1600);
    } catch (_) {}
  };

  const getTagCss = (t: TypographyTag) => {
    return `${t.tag} {\n  font-family: '${t.family}', sans-serif;\n  font-size: ${t.size};\n  font-weight: ${t.weight};\n  line-height: ${t.lineHeight};\n  letter-spacing: ${t.letterSpacing};\n  color: ${t.colorHex};\n}`;
  };

  return (
    <div>
      {/* ── TOP ACTION ── */}
      <div className="p-card">
        <div className="p-card-head">
          <span className="p-card-title">Font Families ({typography.families.length})</span>
          <button
            className={`p-btn p-btn-ghost p-btn-sm ${copiedKey === 'all-type-css' ? 'p-copied' : ''}`}
            onClick={() => handleCopy('all-type-css', exportTypographyCSS(typography), 'Typography CSS')}
          >
            {copiedKey === 'all-type-css' ? <Check size={12} /> : <Copy size={12} />}
            <span>All CSS</span>
          </button>
        </div>

        <div>
          {typography.families.map((f, i) => (
            <div key={i} style={{ padding: '6px 0', borderBottom: i < typography.families.length - 1 ? '1px solid #f8fafc' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{f.family}</span>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>{f.count} elements</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                {f.weights.map((w, wi) => (
                  <span key={wi} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#334155', fontWeight: 700 }}>
                    {w}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PER-TAG CARDS ── */}
      <div className="p-label">Inspected Elements ({typography.tags.length})</div>
      {typography.tags.map((t, i) => {
        const isCopied = copiedKey === `tag-css-${i}`;
        const isSelectorCopied = copiedKey === `sel-${i}`;

        return (
          <div key={i} className="p-type-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  className={`p-type-tag ${t.tag}`}
                  onClick={() => highlightTagOnPage(t.tag)}
                  title="Click to locate on page"
                >
                  &lt;{t.tag}&gt;
                </span>
                <span
                  className="p-sel-chip"
                  onClick={() => handleCopy(`sel-${i}`, t.selector, t.selector)}
                  title="Click to copy selector"
                >
                  <span>{isSelectorCopied ? 'Copied!' : t.selector}</span>
                  <span style={{ color: '#64748b' }}>{t.w}×{t.h}px</span>
                </span>
              </div>

              <button
                className={`p-btn p-btn-ghost p-btn-sm ${isCopied ? 'p-copied' : ''}`}
                onClick={() => handleCopy(`tag-css-${i}`, getTagCss(t), `<${t.tag}> CSS`)}
                title="Copy tag CSS"
              >
                {isCopied ? <Check size={11} /> : <Copy size={11} />}
                <span>CSS</span>
              </button>
            </div>

            <div
              className="p-type-preview"
              style={{
                fontFamily: `'${t.family}', sans-serif`,
                fontSize: t.size,
                fontWeight: t.weight,
                color: t.colorHex
              }}
              onClick={() => highlightTagOnPage(t.tag)}
              title="Click to scroll to element on page"
            >
              {t.sample || 'Typography sample text'}
            </div>

            <div className="p-type-meta">
              <div className="p-type-prop">
                <span className="p-type-prop-lbl">Font Size</span>
                <span className="p-type-prop-val">{t.size}</span>
              </div>
              <div className="p-type-prop">
                <span className="p-type-prop-lbl">Weight</span>
                <span className="p-type-prop-val">{t.weight}</span>
              </div>
              <div className="p-type-prop">
                <span className="p-type-prop-lbl">Line Height</span>
                <span className="p-type-prop-val">{t.lineHeight}</span>
              </div>
              <div className="p-type-prop">
                <span className="p-type-prop-lbl">Color</span>
                <span className="p-type-prop-val" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: t.colorHex, border: '1px solid rgba(0,0,0,0.1)' }} />
                  {t.colorHex}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
