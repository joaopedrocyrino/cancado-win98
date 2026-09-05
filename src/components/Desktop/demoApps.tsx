import { useState } from 'react';
import type { DesktopApp, WindowRenderContext } from '../../core/types';
import {
  BulletList,
  Button,
  Checkbox,
  FlushBody,
  GroupBox,
  IconGrid,
  IconTile,
  ProgressBar,
  Stack,
  StatusBar,
  TabPanel,
  Tabs,
  Text,
  TextInput,
  Title,
  Toolbar,
} from '../../primitives';

/**
 * A sample registry used by the stories. It doubles as the reference for how
 * a consumer wires their own apps up — every field here is public API.
 */

function Notepad({ params }: WindowRenderContext) {
  const [text, setText] = useState(String(params.initialText ?? ''));
  return (
    <FlushBody column>
      <Toolbar>
        <Text variant="meta">{text.length} characters</Text>
      </Toolbar>
      <textarea
        className="w98-textarea w98-bevel-in"
        style={{ flex: 1, margin: 8, resize: 'none' }}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
    </FlushBody>
  );
}

function About() {
  return (
    <Stack gap={10}>
      <Title>cancado-win98</Title>
      <Text variant="meta">A Windows 98 component kit for React.</Text>
      <BulletList
        items={[
          'Draggable, resizable, minimizable windows',
          'Desktop shortcuts you can rearrange',
          'Start menu driven straight off the app registry',
          'Pure, testable window-manager state',
        ]}
      />
    </Stack>
  );
}

function Settings() {
  const [tab, setTab] = useState<'general' | 'display'>('general');
  const [progress, setProgress] = useState(40);
  return (
    <Stack gap={10}>
      <Tabs
        items={[
          { id: 'general', label: 'General' },
          { id: 'display', label: 'Display' },
        ]}
        active={tab}
        onChange={setTab}
      />
      <TabPanel>
        {tab === 'general' ? (
          <Stack gap={10}>
            <TextInput label="Computer name" defaultValue="CANCADO-PC" />
            <GroupBox label="Options">
              <Stack gap={6}>
                <Checkbox label="Show hidden files" defaultChecked />
                <Checkbox label="Play startup sound" />
              </Stack>
            </GroupBox>
          </Stack>
        ) : (
          <Stack gap={10}>
            <Text>Disk usage</Text>
            <ProgressBar value={progress} />
            <Stack direction="row" gap={6}>
              <Button onClick={() => setProgress((v) => Math.max(0, v - 10))}>
                Less
              </Button>
              <Button onClick={() => setProgress((v) => Math.min(100, v + 10))}>
                More
              </Button>
            </Stack>
          </Stack>
        )}
      </TabPanel>
    </Stack>
  );
}

/** Shows how one window opens another through the render context. */
function Programs({ openApp }: WindowRenderContext) {
  const [selected, setSelected] = useState<string | null>(null);
  const items = [
    { id: 'notepad', label: 'Notepad', glyph: '📝' },
    { id: 'about', label: 'About', glyph: '📄' },
    { id: 'settings', label: 'Settings', glyph: '⚙️' },
  ];
  return (
    <FlushBody column>
      <div style={{ flex: 1, padding: 8, overflow: 'auto' }}>
        <IconGrid onBackgroundClick={() => setSelected(null)}>
          {items.map((item) => (
            <IconTile
              key={item.id}
              thumb={item.glyph}
              label={item.label}
              selected={selected === item.id}
              onSelect={() => setSelected(item.id)}
              onOpen={() => openApp(item.id)}
            />
          ))}
        </IconGrid>
      </div>
      <StatusBar>Double-click to open.</StatusBar>
    </FlushBody>
  );
}

export const demoApps: DesktopApp[] = [
  {
    id: 'programs',
    title: 'Programs',
    icon: '📁',
    window: { width: 420, height: 300 },
    desktop: { label: 'My Programs' },
    startMenu: { group: 'main' },
    render: (ctx) => <Programs {...ctx} />,
  },
  {
    id: 'notepad',
    title: 'Untitled - Notepad',
    icon: '📝',
    window: { width: 420, height: 320, minWidth: 260, minHeight: 180 },
    desktop: { label: 'Notepad' },
    startMenu: { group: 'main' },
    render: (ctx) => <Notepad {...ctx} />,
  },
  {
    id: 'settings',
    title: 'Control Panel',
    icon: '⚙️',
    window: { width: 380, height: 320 },
    desktop: { label: 'Control Panel' },
    startMenu: { group: 'main' },
    render: () => <Settings />,
  },
  {
    id: 'about',
    title: 'About',
    icon: '📄',
    window: { width: 400, height: 280, resizable: false },
    desktop: true,
    startMenu: { group: 'support' },
    render: () => <About />,
  },
];
