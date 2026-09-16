import React, { useState } from 'react';
import { Copy, Palette, Check } from 'lucide-react';
import { ExtractedColors } from '../types';
import { exportCSSVars, exportTailwind } from '../services/exportGenerators';
import { copyToClipboard } from '../services/clipboard';

interface ColorsTabProps {
  colors: ExtractedColors | null;
  onToast: (msg: string) => void;
}

export const ColorsTab: React.FC<ColorsTabProps> = ({ colors, onToast }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!colors || !colors.colors.length) {
    return (
      <div className="p-empty">
        <div className="p-empty-icon">
          <Palette size={22} />
        </div>
        Click <strong>Analyze</strong> to extract colors from this page.
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

  return (
    <div>
      {/* ── TOP ACTIONS ── */}
      <div className="p-card">
        <div className="p-card-head">
          <span className="p-card-title">Palette Swatches ({colors.colors.length})</span>
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

        {/* ── SWATCH GRID ── */}
        <div className="p-swatch-grid">
          {colors.colors.map((c, i) => (
            <div
              key={i}
              className="p-swatch"
              style={{ background: c.hex }}
              onClick={() => handleCopy(`swatch-${i}`, c.hex, c.hex)}
              title={`Click to copy ${c.hex}`}
            >
              {copiedKey === `swatch-${i}` && (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ffffff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}>
                  <Check size={12} strokeWidth={2.5} />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── COLOR LIST ── */}
      <div className="p-card">
        <div className="p-card-head">
          <span className="p-card-title">Color Breakdown</span>
        </div>
        <div>
          {colors.colors.map((c, i) => {
            const isCopied = copiedKey === `row-${i}`;
            return (
              <div key={i} className="p-color-row">
                <div className="p-color-dot" style={{ background: c.hex }} />
                <div className="p-color-info">
                  <span className="p-color-hex">{c.hex}</span>
                  <span className="p-color-hsl">{c.hsl}</span>
                </div>
                <span className="p-color-count">{c.count}×</span>
                <button
                  className={`p-icon-btn ${isCopied ? 'p-copied' : ''}`}
                  onClick={() => handleCopy(`row-${i}`, c.hex, c.hex)}
                  title="Copy Hex"
                >
                  {isCopied ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CSS VARIABLES EXPORT BLOCK ── */}
      <div className="p-label">CSS Variables Code</div>
      <div className="p-card" style={{ padding: '8px' }}>
        <div className="p-code-block">
          {exportCSSVars(colors)}
        </div>
      </div>
    </div>
  );
};
