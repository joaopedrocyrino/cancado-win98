import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Desktop } from './Desktop';
import { demoApps } from './demoApps';
import { TrayMenuButton } from '../SystemTray/SystemTray';
import { Button } from '../../primitives';
import { useWindowManager } from '../../hooks/useWindowManager';

const meta = {
  title: 'Shell/Desktop',
  component: Desktop,
  parameters: { layout: 'fullscreen' },
  args: { apps: demoApps, brand: <>cancado<b>98</b></> },
} satisfies Meta<typeof Desktop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { wallpaper: 'bliss' },
};

export const TealWallpaper: Story = {
  args: { wallpaper: 'teal' },
};

export const CustomWallpaper: Story = {
  args: {
    wallpaper: 'linear-gradient(160deg, #2b0b3a 0%, #0b2340 60%, #06121f 100%)',
  },
};

export const WithOpenApps: Story = {
  args: {
    wallpaper: 'bliss',
    initialApps: ['about', 'notepad'],
  },
};

/** Extra tray widgets slot in beside the clock. */
export const WithTrayItems: Story = {
  args: {
    wallpaper: 'bliss',
    tray: (
      <TrayMenuButton
        title="Language"
        value="en"
        options={[
          { id: 'en', label: 'English' },
          { id: 'pt', label: 'Português' },
        ]}
        onSelect={() => {}}
      >
        EN
      </TrayMenuButton>
    ),
  },
};

/**
 * The desktop doesn't have to own the viewport — it fills whatever box you
 * give it, and windows are placed and clamped against that box.
 */
export const Embedded: Story = {
  args: { wallpaper: 'bliss', fullscreen: false, initialApps: ['about'] },
  render: (args) => (
    <div style={{ padding: 24, background: '#1b1b1b', minHeight: '100vh' }}>
      <div style={{ width: 720, height: 460, border: '2px solid #444' }}>
        <Desktop {...args} />
      </div>
    </div>
  ),
};

/**
 * Passing your own window manager lets code outside the desktop open, close
 * and arrange windows.
 */
export const ExternallyControlled: Story = {
  args: { wallpaper: 'bliss' },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const wm = useWindowManager();
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div
          className="w98-root"
          style={{ display: 'flex', gap: 8, padding: 8, background: '#c0c0c0' }}
        >
          <Button
            onClick={() =>
              wm.open({ id: 'external', title: 'Opened from outside', width: 360, height: 200, render: () => <p>Driven by an external window manager.</p> })
            }
          >
            Open window
          </Button>
          <Button onClick={wm.minimizeAll}>Minimize all</Button>
          <Button onClick={wm.closeAll}>Close all</Button>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <Desktop {...args} windowManager={wm} fullscreen={false} />
        </div>
      </div>
    );
  },
};

/** Shut Down can be intercepted instead of showing the built-in takeover. */
export const CustomShutdown: Story = {
  args: { wallpaper: 'bliss' },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [count, setCount] = useState(0);
    return (
      <Desktop
        {...args}
        onShutdown={() => {
          setCount((value) => value + 1);
          return false;
        }}
        startMenuExtra={
          <div style={{ padding: '4px 8px', fontSize: 11 }}>
            Shutdown requested {count}×
          </div>
        }
      />
    );
  },
};
