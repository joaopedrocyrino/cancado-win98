import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { resolve } from 'path';

// Per-entry builds — each becomes its own .mjs + .css so consumers only ship
// what they import. `index` keeps the everything barrel for convenience.
//
// The entries mirror the source layers: `core` and `wm` are logic-only (no CSS,
// no React components), `primitives` is the atom set, and the rest are the
// individual shell pieces.
const entries = {
  index: resolve(__dirname, 'src/entries/index.ts'),
  tokens: resolve(__dirname, 'src/entries/tokens.ts'),
  core: resolve(__dirname, 'src/entries/core.ts'),
  wm: resolve(__dirname, 'src/entries/wm.ts'),
  hooks: resolve(__dirname, 'src/entries/hooks.ts'),
  primitives: resolve(__dirname, 'src/entries/primitives.ts'),
  Desktop: resolve(__dirname, 'src/entries/Desktop.ts'),
  DesktopIcon: resolve(__dirname, 'src/entries/DesktopIcon.ts'),
  Window: resolve(__dirname, 'src/entries/Window.ts'),
  Taskbar: resolve(__dirname, 'src/entries/Taskbar.ts'),
  StartMenu: resolve(__dirname, 'src/entries/StartMenu.ts'),
  ShutdownScreen: resolve(__dirname, 'src/entries/ShutdownScreen.ts'),
};

export default defineConfig({
  plugins: [
    react(),
    // Injects `import './foo.css'` at the top of each generated entry so
    // consumers automatically get the right stylesheet when importing the JS
    // subpath. Without it Vite extracts the CSS and orphans it.
    libInjectCss(),
    dts({
      include: ['src'],
      // Stories and their fixtures are dev-only — no types shipped for them.
      exclude: ['src/**/*.stories.tsx', 'src/**/demoApps.tsx'],
      // Per-entry types — no rollup, so each subpath gets its own .d.ts.
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry: entries,
      formats: ['es'],
      fileName: (_format, name) => `${name}.mjs`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // Code shared across entries lands in chunks/.
        chunkFileNames: 'chunks/[name]-[hash].mjs',
        assetFileNames: (info) => {
          if (info.names?.some((n) => n.endsWith('.css'))) {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // One CSS bundle per entry that imports CSS.
    cssCodeSplit: true,
    cssMinify: true,
    emptyOutDir: true,
  },
});
