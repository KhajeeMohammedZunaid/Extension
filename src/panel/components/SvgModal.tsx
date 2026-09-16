import React, { useState } from 'react';
import { Download, Copy, Code, X, Check } from 'lucide-react';
import { SvgAsset } from '../types';
import { svgDownloadSvg, svgDownloadPng, svgToReact } from '../services/exportGenerators';
import { copyToClipboard } from '../services/clipboard';

interface SvgModalProps {
  svg: SvgAsset | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const SvgModal: React.FC<SvgModalProps> = ({ svg, onClose, onToast }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!svg) return null;

  const triggerFeedback = (type: string, toastMsg: string) => {
    setCopiedType(type);
    onToast(toastMsg);
    setTimeout(() => setCopiedType(null), 1600);
  };

  const handleDownloadSvg = () => {
    svgDownloadSvg(svg.code, `${svg.name || 'icon'}.svg`);
    triggerFeedback('dl-svg', 'SVG File Downloaded!');
  };

  const handleDownloadPng = () => {
    svgDownloadPng(svg.code, Math.max(svg.w, 64), Math.max(svg.h, 64), `${svg.name || 'icon'}.png`);
    triggerFeedback('dl-png', 'PNG Image Downloaded!');
  };

  const handleCopySvg = async () => {
    const ok = await copyToClipboard(svg.code);
    if (ok) triggerFeedback('cp-svg', 'SVG Code Copied!');
  };

  const handleCopyReact = async () => {
    const componentName = svg.name
      ? svg.name.replace(/[^a-zA-Z0-9]/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
      : 'Icon';
    const jsx = svgToReact(svg.code, componentName || 'Icon');
    const ok = await copyToClipboard(jsx);
    if (ok) triggerFeedback('cp-react', 'React Component Copied!');
  };

  return (
    <div className="p-modal-backdrop" onClick={onClose}>
      <div className="p-modal-window" onClick={e => e.stopPropagation()}>
        <div className="p-modal-head">
          <div>
            <div className="p-modal-title">{svg.name || 'SVG Element'}</div>
            <div className="p-modal-dims">{svg.w} × {svg.h}px</div>
          </div>
          <button className="p-modal-close" onClick={onClose} title="Close">
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="p-modal-preview">
          <img src={svg.dataUrl} alt={svg.name} />
        </div>

        <div className="p-modal-actions">
          <button
            className={`p-modal-btn p-modal-btn-primary ${copiedType === 'dl-svg' ? 'p-copied' : ''}`}
            onClick={handleDownloadSvg}
          >
            {copiedType === 'dl-svg' ? <Check size={14} /> : <Download size={14} />}
            <span>SVG File</span>
          </button>

          <button
            className={`p-modal-btn ${copiedType === 'dl-png' ? 'p-copied' : ''}`}
            onClick={handleDownloadPng}
          >
            {copiedType === 'dl-png' ? <Check size={14} /> : <Download size={14} />}
            <span>PNG (2×)</span>
          </button>

          <button
            className={`p-modal-btn ${copiedType === 'cp-svg' ? 'p-copied' : ''}`}
            onClick={handleCopySvg}
          >
            {copiedType === 'cp-svg' ? <Check size={14} /> : <Copy size={14} />}
            <span>Copy SVG</span>
          </button>

          <button
            className={`p-modal-btn ${copiedType === 'cp-react' ? 'p-copied' : ''}`}
            onClick={handleCopyReact}
          >
            {copiedType === 'cp-react' ? <Check size={14} /> : <Code size={14} />}
            <span>React JSX</span>
          </button>
        </div>
      </div>
    </div>
  );
};
