import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import styles from './styles/panel.css?inline';

(function bootstrapPrism() {
  if ((window as any).__PRISM_REACT_BOOTSTRAPPED__) return;
  (window as any).__PRISM_REACT_BOOTSTRAPPED__ = true;

  // 1. Create isolated Shadow Host
  const host = document.createElement('div');
  host.id = 'prism-host';
  Object.assign(host.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    width: '0',
    height: '0',
    zIndex: '2147483645',
    pointerEvents: 'none'
  });

  const shadow = host.attachShadow({ mode: 'open' });

  // 2. Inject encapsulated styles into Shadow Root
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  shadow.appendChild(styleEl);

  // 3. Mount React application into Shadow Root
  const container = document.createElement('div');
  shadow.appendChild(container);
  const root = createRoot(container);
  root.render(<App />);

  // Append host to DOM
  const mountHost = () => {
    if (document.body) {
      document.body.appendChild(host);
    } else {
      document.documentElement.appendChild(host);
    }
  };

  if (document.body || document.documentElement) {
    mountHost();
  } else {
    document.addEventListener('DOMContentLoaded', mountHost);
  }

  // 4. Listen for Chrome extension messages (e.g. extension icon click)
  if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg?.type === 'prism:toggle') {
        if ((window as any).__PRISM_TOGGLE__) {
          (window as any).__PRISM_TOGGLE__();
        }
      }
    });
  }

  // 5. Mesurer Toolbar Dock Integration
  function getMesurerSR(): ShadowRoot | null {
    const mHost = document.getElementById('mesurer-extension-host') ||
                  document.querySelector('#mesurer-extension-host');
    if (mHost && mHost.shadowRoot) return mHost.shadowRoot;

    for (const child of Array.from(document.documentElement.children)) {
      if ((child as HTMLElement).shadowRoot &&
          (child.id === 'mesurer-extension-host' || (child as HTMLElement).shadowRoot?.querySelector('.mesurer-toolbar-surface'))) {
        return (child as HTMLElement).shadowRoot;
      }
    }
    if (document.body) {
      for (const child of Array.from(document.body.children)) {
        if ((child as HTMLElement).shadowRoot &&
            (child.id === 'mesurer-extension-host' || (child as HTMLElement).shadowRoot?.querySelector('.mesurer-toolbar-surface'))) {
          return (child as HTMLElement).shadowRoot;
        }
      }
    }
    return null;
  }

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

    const existingBtn = sr.getElementById('prism-dock-btn');
    if (existingBtn && existingBtn.isConnected) {
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
    btn.title = 'Prism — Assets, Typography & Tokens';
    btn.setAttribute('aria-label', 'Assets & Design Tokens (Prism)');
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if ((window as any).__PRISM_TOGGLE__) {
        (window as any).__PRISM_TOGGLE__();
      }
    });

    wrap.appendChild(btn);

    // Preferred position: directly beside "Sample color" tool
    const colorPicker = sr.querySelector('[data-tool-id="color-picker"]');
    if (colorPicker && colorPicker.parentNode) {
      colorPicker.after(wrap);
      return;
    }

    // Fallback: tool panel
    const toolPanel = sr.querySelector('.mesurer-toolbar-tool-panel');
    if (toolPanel) {
      const target = toolPanel.firstElementChild || toolPanel;
      target.appendChild(wrap);
      return;
    }

    // Fallback: minimize slot / surface
    const slot = sr.querySelector('.mesurer-toolbar-minimize-slot') || sr.querySelector('.mesurer-toolbar-surface');
    if (slot) {
      slot.appendChild(wrap);
    }
  }

  let _observedSr: ShadowRoot | null = null;
  function watchShadowRoot(sr: ShadowRoot) {
    if (_observedSr === sr) return;
    _observedSr = sr;
    const srObs = new MutationObserver(() => {
      if (!sr.getElementById('prism-dock-btn')) {
        tryInjectMesurerDock();
      }
    });
    srObs.observe(sr, { childList: true, subtree: true });
  }

  const _docObs = new MutationObserver(tryInjectMesurerDock);
  _docObs.observe(document.documentElement, { childList: true, subtree: true });

  setInterval(tryInjectMesurerDock, 1000);
  tryInjectMesurerDock();
})();
