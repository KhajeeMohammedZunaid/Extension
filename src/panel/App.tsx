import React, { useState, useEffect, useCallback } from 'react';
import { Layers, X, Scan, LayoutGrid, Palette, Type, Image as ImageIcon } from 'lucide-react';
import { ExtractedTokens, TabType, SvgAsset } from './types';
import { extractColors, extractTypography, extractAssets } from './services/extractor';
import { OverviewTab } from './tabs/OverviewTab';
import { ColorsTab } from './tabs/ColorsTab';
import { TypographyTab } from './tabs/TypographyTab';
import { AssetsTab } from './tabs/AssetsTab';
import { SvgModal } from './components/SvgModal';
import { Toast } from './components/Toast';

export const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [tokens, setTokens] = useState<ExtractedTokens | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanNote, setScanNote] = useState('Click Analyze to scan this page');
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const [selectedSvg, setSelectedSvg] = useState<SvgAsset | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast({ message: msg, show: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 1800);
  }, []);

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    setScanNote('Scanning page…');

    // Small delay to let UI render scanning state
    await new Promise(r => setTimeout(r, 60));

    try {
      const colors = extractColors();
      const typography = extractTypography();
      const assets = extractAssets();

      const extracted: ExtractedTokens = { colors, typography, assets };
      setTokens(extracted);

      // Store in window for debug / export accessibility
      (window as any).__prismExtracted__ = extracted;

      const totalImgs = assets.images.length + assets.backgrounds.length;
      setScanNote(`${colors.colors.length} colors · ${typography.families.length} fonts · ${totalImgs} imgs · ${assets.svgs.length} svgs`);
    } catch (err) {
      console.error('[Prism] Scan error:', err);
      setScanNote('Error scanning page — try again');
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Sync open state with Mesurer toolbar dock icon
  useEffect(() => {
    const updateDockBtn = () => {
      const host = document.getElementById('mesurer-extension-host');
      const sr = host?.shadowRoot;
      const dockBtn = sr?.getElementById('prism-dock-btn');
      if (dockBtn) {
        if (isOpen) dockBtn.classList.add('p-active');
        else dockBtn.classList.remove('p-active');
      }
    };
    updateDockBtn();
  }, [isOpen]);

  // Handle auto-scan on initial open
  useEffect(() => {
    if (isOpen && !tokens && !isScanning) {
      handleScan();
    }
  }, [isOpen, tokens, isScanning, handleScan]);

  // Register global window bridges for Chrome runtime messages & keyboard
  useEffect(() => {
    const togglePanel = () => setIsOpen(prev => !prev);
    const openPanel = () => setIsOpen(true);
    const closePanel = () => setIsOpen(false);

    (window as any).__PRISM_TOGGLE__ = togglePanel;
    (window as any).__PRISM_OPEN__ = openPanel;
    (window as any).__PRISM_CLOSE__ = closePanel;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      delete (window as any).__PRISM_TOGGLE__;
      delete (window as any).__PRISM_OPEN__;
      delete (window as any).__PRISM_CLOSE__;
    };
  }, [isOpen]);

  return (
    <div className={`p-panel ${!isOpen ? 'p-hidden' : ''}`} id="pp">
      {/* ── HEADER ── */}
      <div className="p-header">
        <div className="p-logo">
          <Layers size={18} strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="p-title">Prism</div>
          <div className="p-subtitle">Design Inspector · Colors · Type · Assets</div>
        </div>
        <button className="p-close" onClick={() => setIsOpen(false)} title="Close Panel">
          <X size={15} strokeWidth={2.2} />
        </button>
      </div>

      {/* ── ANALYZE BAR ── */}
      <div className="p-analyze-bar">
        <span className="p-analyze-note">{scanNote}</span>
        <button
          className="p-btn p-btn-primary"
          disabled={isScanning}
          onClick={handleScan}
        >
          <Scan size={13} strokeWidth={2.2} />
          <span>{isScanning ? 'Scanning…' : tokens ? 'Re-analyze' : 'Analyze'}</span>
        </button>
      </div>

      {/* ── TABS ── */}
      <div className="p-tabs">
        <button
          className={`p-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutGrid size={13} strokeWidth={2} />
          <span>Overview</span>
        </button>

        <button
          className={`p-tab ${activeTab === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveTab('colors')}
        >
          <Palette size={13} strokeWidth={2} />
          <span>Colors</span>
        </button>

        <button
          className={`p-tab ${activeTab === 'type' ? 'active' : ''}`}
          onClick={() => setActiveTab('type')}
        >
          <Type size={13} strokeWidth={2} />
          <span>Type</span>
        </button>

        <button
          className={`p-tab ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          <ImageIcon size={13} strokeWidth={2} />
          <span>Assets</span>
        </button>
      </div>

      {/* ── ACTIVE TAB PANE ── */}
      <div className="p-scroll">
        {activeTab === 'overview' && (
          <OverviewTab
            tokens={tokens}
            onOpenSvg={setSelectedSvg}
            onToast={showToast}
          />
        )}

        {activeTab === 'colors' && (
          <ColorsTab
            colors={tokens?.colors || null}
            onToast={showToast}
          />
        )}

        {activeTab === 'type' && (
          <TypographyTab
            typography={tokens?.typography || null}
            onToast={showToast}
          />
        )}

        {activeTab === 'assets' && (
          <AssetsTab
            assets={tokens?.assets || null}
            onOpenSvg={setSelectedSvg}
            onToast={showToast}
          />
        )}
      </div>

      {/* ── SVG DETAIL MODAL ── */}
      <SvgModal
        svg={selectedSvg}
        onClose={() => setSelectedSvg(null)}
        onToast={showToast}
      />

      {/* ── FLOATING GLASS TOAST ── */}
      <Toast
        message={toast.message}
        show={toast.show}
      />
    </div>
  );
};
