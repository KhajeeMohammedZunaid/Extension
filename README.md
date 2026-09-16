# Prism — Design Inspector & Token Extractor

Prism is a design inspection Chrome Extension built with **React 18 + Vite + TypeScript**. It extracts colors, typography tokens, and website assets (images, background graphics, and SVG vectors) with Shadow DOM encapsulation and seamless integration with the Mesurer toolbar.

---

## Quick Start: How to Run in Chrome

### 1. Build the Extension
In your terminal, run:
```bash
npm run build
```
*(Or run `npm run dev` to automatically rebuild on file save).*

This compiles the React + TypeScript app in `src/` directly into `panel.js` via Vite (IIFE bundle with inlined CSS).

### 2. Load the Extension in Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle on **Developer mode** in the top right corner.
3. Click the **Load unpacked** button in the top left.
4. Select this directory (`d:\Zunnus\exteiii`).
5. (Optional) Pin **Prism** in your Chrome toolbar.

### 3. Using Prism on Any Webpage
1. Navigate to any website (e.g., `https://mesurer.dev`, `https://github.com`, or your local dev server).
2. Click the **Prism** extension icon in your Chrome toolbar (or click the Assets icon in the Mesurer toolbar dock directly beside the Color Picker tool).
3. The Prism inspector panel will slide out from the right.
4. Click **Analyze** to extract design tokens:
   - **Overview**: High-level design summary with color palette strips, one-click CSS/Tailwind exports, font previews, and asset thumbnails.
   - **Colors**: Interactive swatch grid, color frequency breakdown with hex & HSL values, and export code blocks.
   - **Type**: Font families summary and per-tag cards (`<h1>`, `<h2>`, `<p>`, `<a>`, `<button>`) with live page element highlighting.
   - **Assets**: Image gallery with copy URL / download, and **Inline SVG Elements** with vector previews, dimensions, and 4-way export modal (SVG vector file, PNG 2x, copy SVG, and React JSX).

---

## Project Structure

```
├── manifest.json              # Chrome MV3 Extension Manifest
├── background.js              # Service worker & injection coordinator
├── capture-bridge.js          # Screenshot capture bridge
├── panel.js                   # Compiled React bundle injected as content script
├── vite.config.ts             # Vite library mode configuration (IIFE format)
├── tsconfig.json              # TypeScript compiler configuration
├── package.json               # Dependencies & scripts
└── src/
    ├── vite-env.d.ts          # Vite client & CSS module typings
    └── panel/
        ├── index.tsx          # Bootstrap, Shadow DOM mount, Mesurer dock watcher
        ├── App.tsx            # Main inspector shell & state management
        ├── types.ts           # Token and asset data structures
        ├── components/
        │   ├── SvgModal.tsx   # SVG export modal (Vector, PNG 2x, SVG code, React JSX)
        │   └── Toast.tsx      # Dark-glass floating notification with spring animations
        ├── tabs/
        │   ├── OverviewTab.tsx# Overview summary, swatches, fonts, and assets
        │   ├── ColorsTab.tsx  # Palette breakdown, swatches, and CSS/Tailwind exports
        │   ├── TypographyTab.tsx# Type hierarchy, tag cards, and page element highlighter
        │   └── AssetsTab.tsx  # Image gallery, backgrounds, and inline SVGs
        ├── services/
        │   ├── clipboard.ts   # Dual-engine clipboard pipeline with fallback
        │   ├── exportGenerators.ts # CSS vars, Tailwind, JSX, SVG & PNG downloads
        │   └── extractor.ts   # Token extraction, SVG style freezing & deduplication
        └── styles/
            └── panel.css      # Encapsulated Shadow DOM styling (Inter font, animations)
```

---

## Development Commands

- `npm run build`: Type-checks and compiles the bundle into `panel.js`.
- `npm run dev`: Watches `src/` and rebuilds automatically on code changes.
- `npm run typecheck`: Runs TypeScript compiler check without emitting files.