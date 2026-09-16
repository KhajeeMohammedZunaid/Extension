import React, { useState } from 'react';
import { Copy, Download, Image as ImageIcon, Check } from 'lucide-react';
import { ExtractedAssets, SvgAsset } from '../types';
import { exportAllImgUrls } from '../services/exportGenerators';
import { copyToClipboard } from '../services/clipboard';

interface AssetsTabProps {
  assets: ExtractedAssets | null;
  onOpenSvg: (svg: SvgAsset) => void;
  onToast: (msg: string) => void;
}

export const AssetsTab: React.FC<AssetsTabProps> = ({ assets, onOpenSvg, onToast }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!assets || (!assets.images.length && !assets.backgrounds.length && !assets.svgs.length)) {
    return (
      <div className="p-empty">
        <div className="p-empty-icon">
          <ImageIcon size={22} />
        </div>
        Click <strong>Analyze</strong> to find assets on this page.
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

  const getFname = (url: string) => {
    try {
      const u = new URL(url);
      return u.pathname.split('/').pop() || url.slice(-20);
    } catch {
      return url.slice(-20);
    }
  };

  return (
    <div>
      {/* ── IMAGES GRID ── */}
      {assets.images.length > 0 && (
        <div className="p-card">
          <div className="p-card-head">
            <span className="p-card-title">Images ({assets.images.length})</span>
            <button
              className={`p-btn p-btn-ghost p-btn-sm ${copiedKey === 'all-imgs' ? 'p-copied' : ''}`}
              onClick={() => handleCopy('all-imgs', exportAllImgUrls(assets), 'All Image URLs')}
            >
              {copiedKey === 'all-imgs' ? <Check size={12} /> : <Copy size={12} />}
              <span>All URLs</span>
            </button>
          </div>

          <div className="p-asset-grid">
            {assets.images.slice(0, 10).map((img, i) => {
              const isCopied = copiedKey === `img-${i}`;
              return (
                <div key={i} className="p-asset-card">
                  <div className="p-asset-thumb">
                    <img
                      src={img.src}
                      alt={img.alt}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="p-asset-meta">
                    <div className="p-asset-name">{getFname(img.src)}</div>
                    <div className="p-asset-dim">
                      {img.w && img.h ? `${img.w}×${img.h}px · ` : ''}{img.type.toUpperCase()}
                    </div>
                    <div className="p-asset-actions">
                      <button
                        className={`p-icon-btn ${isCopied ? 'p-copied' : ''}`}
                        onClick={() => handleCopy(`img-${i}`, img.src, 'Image URL')}
                        title="Copy URL"
                      >
                        {isCopied ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                      <a
                        className="p-icon-btn"
                        href={img.src}
                        download
                        target="_blank"
                        rel="noreferrer"
                        title="Download Image"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#475569' }}
                      >
                        <Download size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {assets.images.length > 10 && (
            <div style={{ marginTop: '8px' }}>
              <div className="p-label">Remaining Images</div>
              {assets.images.slice(10).map((img, i) => {
                const idx = i + 10;
                const isCopied = copiedKey === `img-${idx}`;
                return (
                  <div key={idx} className="p-asset-row">
                    <div className="p-asset-ico">
                      <img
                        src={img.src}
                        alt={img.alt}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="p-asset-info">
                      <div className="p-asset-name">{getFname(img.src)}</div>
                      <div className="p-asset-dim">{img.w && img.h ? `${img.w}×${img.h}px · ` : ''}{img.type.toUpperCase()}</div>
                    </div>
                    <div className="p-asset-actions">
                      <button
                        className={`p-icon-btn ${isCopied ? 'p-copied' : ''}`}
                        onClick={() => handleCopy(`img-${idx}`, img.src, 'Image URL')}
                        title="Copy URL"
                      >
                        {isCopied ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                      <a
                        className="p-icon-btn"
                        href={img.src}
                        download
                        target="_blank"
                        rel="noreferrer"
                        title="Download"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#475569' }}
                      >
                        <Download size={13} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── BACKGROUND IMAGES ── */}
      {assets.backgrounds.length > 0 && (
        <div>
          <div className="p-label">Background Images ({assets.backgrounds.length})</div>
          <div className="p-card">
            {assets.backgrounds.map((bg, i) => {
              const isCopied = copiedKey === `bg-${i}`;
              return (
                <div key={i} className="p-asset-row">
                  <div className="p-asset-ico" style={{ backgroundImage: `url("${bg.src}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="p-asset-info">
                    <div className="p-asset-name">{getFname(bg.src)}</div>
                    <div className="p-asset-dim">Background · {bg.type.toUpperCase()}</div>
                  </div>
                  <div className="p-asset-actions">
                    <button
                      className={`p-icon-btn ${isCopied ? 'p-copied' : ''}`}
                      onClick={() => handleCopy(`bg-${i}`, bg.src, 'Background URL')}
                      title="Copy URL"
                    >
                      {isCopied ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                    <a
                      className="p-icon-btn"
                      href={bg.src}
                      download
                      target="_blank"
                      rel="noreferrer"
                      title="Download"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#475569' }}
                    >
                      <Download size={13} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── INLINE SVG ELEMENTS (PREVIEW & EXPORT FIX) ── */}
      {assets.svgs.length > 0 && (
        <div>
          <div className="p-label">Inline SVG Elements ({assets.svgs.length})</div>
          <div className="p-svg-grid">
            {assets.svgs.map((s, i) => (
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

      {/* ── VIDEOS ── */}
      {assets.videos.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div className="p-label">Videos ({assets.videos.length})</div>
          <div className="p-card">
            {assets.videos.map((v, i) => {
              const isCopied = copiedKey === `vid-${i}`;
              return (
                <div key={i} className="p-asset-row">
                  <div className="p-asset-ico" style={{ color: '#94a3b8', fontSize: '18px' }}>▶</div>
                  <div className="p-asset-info">
                    <div className="p-asset-name">{getFname(v.src)}</div>
                    <div className="p-asset-dim">{v.w && v.h ? `${v.w}×${v.h}px` : 'Video'}</div>
                  </div>
                  <button
                    className={`p-icon-btn ${isCopied ? 'p-copied' : ''}`}
                    onClick={() => handleCopy(`vid-${i}`, v.src, 'Video URL')}
                    title="Copy URL"
                  >
                    {isCopied ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
