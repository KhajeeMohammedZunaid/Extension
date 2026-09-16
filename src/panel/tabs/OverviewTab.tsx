import React, { useState } from 'react';
import { Copy, Scan, Check } from 'lucide-react';
import { ExtractedTokens, SvgAsset } from '../types';
import { exportCSSVars, exportTailwind } from '../services/exportGenerators';
import { copyToClipboard } from '../services/clipboard';

interface OverviewTabProps {
  tokens: ExtractedTokens | null;
  onOpenSvg: (svg: SvgAsset) => void;
  onToast: (msg: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ tokens, onOpenSvg, onToast }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!tokens) {
    return (
      <div className="p-empty">
        <div className="p-empty-icon">
          <Scan size={22} />
        </div>
        Click <strong>Analyze</strong> to extract design tokens from this page.
      </div>
    );
  }

  const { colors, typography, assets } = tokens;
  const totalAssets = assets.images.length + assets.backgrounds.length + assets.svgs.length;

  const handleCopy = async (key: string, text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      onToast(`Copied: ${label}`);
      setTimeout(() => setCopiedKey(null), 1500);
    }
  };

  return (
    <div>
      {/* ── STATS ── */}
      <div className="p-stats">
        <div className="p-stat">
          <div className="p-stat-val">{colors.colors.length}</div>
          <div className="p-stat-lbl">Colors Detected</div>
        </div>
        <div className="p-stat">
          <div className="p-stat-val">{typography.families.length}</div>
          <div className="p-stat-lbl">Font Families</div>
        </div>
      </div>

      {/* ── PALETTE STRIP & EXPORT ── */}
      {colors.colors.length > 0 && (
        <div className="p-card">
          <div className="p-card-head">
            <span className="p-card-title">Color Palette</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className={`p-btn p-btn-ghost p-btn-sm ${copiedKey === 'css-vars' ? 'p-copied' : ''}`}
                onClick={() => handleCopy('css-vars', exportCSSVars(colors), 'CSS Variables')}
              >
                {copiedKey === 'css-vars' ? <Check size={12} /> : <Copy size={12} />}
                <span>CSS Vars</span>
              </button>
              <button
                className={`p-btn p-btn-ghost p-btn-sm ${copiedKey === 'tailwind' ? 'p-copied' : ''}`}
                onClick={() => handleCopy('tailwind', exportTailwind(colors), 'Tailwind Config')}
              >
                {copiedKey === 'tailwind' ? <Check size={12} /> : <Copy size={12} />}
                <span>Tailwind</span>
              </button>
            </div>
          </div>

          <div className="p-strip">
            {colors.colors.slice(0, 12).map((c, i) => (
              <div
                key={i}
                className="p-strip-s"
                style={{ background: c.hex }}
                onClick={() => handleCopy(`strip-${i}`, c.hex, c.hex)}
                title={`Click to copy ${c.hex}`}
              >
                {copiedKey === `strip-${i}` && (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ffffff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}>
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {colors.colors.slice(0, 10).map((c, i) => {
              const isCopied = copiedKey === `chip-${i}`;
              return (
                <div
                  key={i}
                  className={`p-color-chip ${isCopied ? 'p-copied p-copy-animated' : ''}`}
                  onClick={() => handleCopy(`chip-${i}`, c.hex, c.hex)}
                  title="Click to copy hex"
                >
                  <span className="p-color-chip-dot" style={{ background: c.hex }} />
                  <span className="p-color-chip-text">{isCopied ? 'Copied!' : c.hex}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FONTS USED ── */}
      {typography.families.length > 0 && (
        <div className="p-card">
          <div className="p-card-head">
            <span className="p-card-title">Fonts Used ({typography.families.length})</span>
          </div>
          <div>
            {typography.families.map((f, i) => {
              const isCopied = copiedKey === `font-${i}`;
              return (
                <div key={i} style={{ padding: '8px 0', borderBottom: i < typography.families.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '2px 6px', borderRadius: '6px', background: isCopied ? '#10b981' : 'transparent', color: isCopied ? '#fff' : '#0f172a' }}
                      onClick={() => handleCopy(`font-${i}`, f.family, f.family)}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 700 }}>{isCopied ? 'Copied!' : f.family}</span>
                      <Copy size={11} style={{ opacity: 0.6 }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>{f.count} elements</span>
                  </div>

                  <div
                    style={{ fontFamily: `'${f.family}', sans-serif`, fontSize: '15px', color: '#0f172a', fontWeight: 600, padding: '4px 6px', margin: '4px 0', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => handleCopy(`sample-${i}`, f.family, f.family)}
                    title="Click to copy font name"
                  >
                    The quick brown fox jumps over the lazy dog.
                  </div>

                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                    {f.weights.map((w, wi) => (
                      <span key={wi} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#334155', fontWeight: 700 }}>
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── IMAGES PREVIEW ── */}
      {assets.images.length > 0 && (
        <div className="p-card">
          <div className="p-card-head">
            <span className="p-card-title">Images ({assets.images.length})</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {assets.images.slice(0, 8).map((img, i) => (
              <div
                key={i}
                style={{ width: '58px', height: '58px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0, cursor: 'pointer', position: 'relative' }}
                onClick={() => handleCopy(`img-${i}`, img.src, 'Image URL')}
                title="Click to copy image URL"
              >
                <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {copiedKey === `img-${i}` && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(16, 185, 129, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 700 }}>
                    Copied!
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── INLINE SVGS PREVIEW (FIXED) ── */}
      {assets.svgs.length > 0 && (
        <div className="p-card">
          <div className="p-card-head">
            <span className="p-card-title">Inline SVGs ({assets.svgs.length})</span>
          </div>
          <div className="p-svg-grid">
            {assets.svgs.slice(0, 8).map((s, i) => (
              <div
                key={s.id || i}
                className="p-svg-card"
                onClick={() => onOpenSvg(s)}
                title={`Click to export ${s.name}`}
              >
                <div className="p-svg-canvas">
                  <img src={s.dataUrl} alt={s.name} />
                </div>
                <div className="p-svg-meta">{s.w}×{s.h}px</div>
                <div className="p-svg-hint">Click to export</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
