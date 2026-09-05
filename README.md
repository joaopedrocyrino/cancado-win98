# cancado-win98

A Windows 98 component kit for React — a full desktop shell (wallpaper,
draggable shortcuts, windows, taskbar, Start menu) plus the primitives to build
apps that live inside it.

```bash
pnpm add cancado-win98
```

## Quick start

```tsx
import { Desktop, Stack, Title, Text } from 'cancado-win98';
import type { DesktopApp } from 'cancado-win98';

const apps: DesktopApp[] = [
  {
    id: 'about',
    title: 'About Me',
    icon: '📄',
    window: { width: 460, height: 340 },
    desktop: true,                     // shortcut on the wallpaper
    startMenu: { group: 'main' },      // entry in the Start menu
    render: () => (
      <Stack gap={8}>
        <Title>Hello</Title>
        <Text variant="meta">Rendered inside a real window.</Text>
      </Stack>
    ),
  },
];

export function App() {
  return <Desktop apps={apps} wallpaper="bliss" brand={<>cancado<b>98</b></>} />;
}
```

One registry drives everything: the desktop shortcut, the Start-menu entry and
the window content all come from the same `DesktopApp`, so there is no second
list to keep in sync.

## Architecture

The package is layered, and each layer is importable on its own.

| Layer | Path | What it is |
| --- | --- | --- |
| `core/` | `cancado-win98/core` | Pure TypeScript: the window-manager reducer, geometry math, the app-registry model. No React, no DOM, no CSS. |
| `hooks/` | `cancado-win98/hooks` | React bindings: `useWindowManager`, `usePointerDrag`, `useDismiss`, `useElementSize`, `useClock`. |
| `primitives/` | `cancado-win98/primitives` | Buttons, fields, tabs, tiles, menus, strips. |
| `components/` | `cancado-win98/Desktop`, `/Window`, … | The shell pieces. Every one is presentational and controlled. |

The point of the split: **state transitions live in `core` as a pure reducer**,
so window behaviour is exercisable without rendering anything, and the React
layer never hides a decision inside a component.

### Window manager

`useWindowManager()` is usable on its own if you want the behaviour without the
chrome:

```tsx
import { useWindowManager } from 'cancado-win98/wm';

const wm = useWindowManager();
wm.open({ id: 'doc-1', title: 'Report.doc', width: 420, height: 300 });
wm.toggleMaximize('doc-1');
```

Pass it to `<Desktop windowManager={wm} />` to drive windows from outside — a
router, a keyboard shortcut, a test.

The reducer itself is exported too, for tests or a custom store:

```ts
import {
  windowManagerReducer,
  initialWindowManagerState,
} from 'cancado-win98/core';

const state = windowManagerReducer(initialWindowManagerState, {
  type: 'open',
  input: { id: 'a', title: 'A' },
  bounds: { width: 1024, height: 768 },
});
```

### Talking to the desktop from inside a window

```tsx
render: ({ openApp, close, params }) => (
  <Button onClick={() => openApp('settings', { params: { tab: 'display' } })}>
    Settings
  </Button>
)
```

Anywhere deeper in the tree, `useDesktop()` gives the same handles without
prop-drilling.

## `<Desktop>` props

| Prop | Default | Notes |
| --- | --- | --- |
| `apps` | `[]` | The registry. Drives icons, Start menu and window content. |
| `wallpaper` | `'teal'` | `'teal'`, `'bliss'`, `'dither'`, or any CSS `background` value. |
| `brand` | – | Content for the Start menu's vertical gutter. |
| `labels` | English | Partial override of every shell string — plug in your own i18n. |
| `tray` | – | Extra system-tray items, rendered left of the clock. |
| `initialApps` | – | App ids opened once on mount. |
| `onShutdown` | – | Return `false` to suppress the built-in takeover screen. |
| `windowManager` | internal | Bring your own, from `useWindowManager()`. |
| `fullscreen` | `true` | Off means the desktop fills its parent box instead of the viewport. |

The desktop measures **itself**, not the viewport, so an embedded desktop still
places, clamps and maximizes windows against its own box.

## Theming

Every colour and metric is a CSS custom property on `:root` (see
`src/styles/tokens.css`). Override them to re-skin the whole thing:

```css
:root {
  --w98-desktop: #3a6ea5;
  --w98-title-active-1: #7e0000;
  --w98-title-active-2: #d16b6b;
}
```

## Styles

Component subpaths inject their own CSS automatically. If you want the whole
sheet at once:

```ts
import 'cancado-win98/styles';   // everything
import 'cancado-win98/tokens';   // just the variables
```

## Development

```bash
pnpm install
pnpm storybook     # component gallery + a live desktop
pnpm typecheck
pnpm build
```

## License

MIT
