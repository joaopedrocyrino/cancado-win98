import type { Meta, StoryObj } from '@storybook/react';
import { Window } from './Window';
import { useWindowManager } from '../../hooks/useWindowManager';
import { Button, Stack, Text, Title } from '../../primitives';
import type { WindowState } from '../../core/types';

const meta = {
  title: 'Shell/Window',
  component: Window,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Window>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseWindow: WindowState = {
  id: 'demo',
  title: 'Untitled - Notepad',
  icon: '📝',
  params: {},
  x: 40,
  y: 40,
  width: 380,
  height: 240,
  minWidth: 200,
  minHeight: 120,
  z: 10,
  minimized: false,
  maximized: false,
  resizable: true,
};

const bounds = { width: 900, height: 560 };

function Surface({ children }: { children: React.ReactNode }) {
  return (
    <div className="w98-root">
      <div
        style={{
          position: 'relative',
          width: bounds.width,
          height: bounds.height,
          background: '#008080',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

const noop = () => {};

/** A single window with no manager behind it — pure presentation. */
export const Static: Story = {
  args: {
    win: baseWindow,
    focused: true,
    bounds,
    onFocus: noop,
    onClose: noop,
    onMinimize: noop,
    onToggleMaximize: noop,
    onMove: noop,
    onResize: noop,
  },
  render: (args) => (
    <Surface>
      <Window {...args}>
        <Stack gap={8}>
          <Title>Hello from 1998</Title>
          <Text variant="meta">Drag the title bar, or the grip bottom-right.</Text>
        </Stack>
      </Window>
    </Surface>
  ),
};

export const Unfocused: Story = {
  ...Static,
  args: { ...Static.args, focused: false },
};

export const NotResizable: Story = {
  ...Static,
  args: { ...Static.args, win: { ...baseWindow, resizable: false } },
};

/** Wired to a real window manager: drag, resize, stack, minimize, close. */
export const Interactive: Story = {
  args: Static.args,
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const wm = useWindowManager(() => bounds);
    return (
      <Surface>
        <div style={{ position: 'absolute', inset: 8, zIndex: 1 }}>
          <Button
            onClick={() =>
              wm.open({
                id: `win-${wm.windows.length + 1}`,
                title: `Window ${wm.windows.length + 1}`,
                icon: '🗔',
                width: 300,
                height: 200,
              })
            }
          >
            New window
          </Button>
        </div>
        {wm.windows.map((win) => (
          <Window
            key={win.id}
            win={win}
            focused={win.id === wm.focusedId}
            bounds={bounds}
            onFocus={() => wm.focus(win.id)}
            onClose={() => wm.close(win.id)}
            onMinimize={() => wm.minimize(win.id)}
            onToggleMaximize={() => wm.toggleMaximize(win.id)}
            onMove={(x, y) => wm.move(win.id, x, y)}
            onResize={(width, height) => wm.resize(win.id, width, height)}
          >
            <Text>Window id: {win.id}</Text>
          </Window>
        ))}
      </Surface>
    );
  },
};
