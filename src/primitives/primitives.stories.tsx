import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  BulletList,
  Button,
  Checkbox,
  GroupBox,
  IconGrid,
  IconTile,
  Link,
  Menu,
  MenuItem,
  MenuSeparator,
  ProgressBar,
  Radio,
  Select,
  Separator,
  Stack,
  StatusBar,
  StatusField,
  TabPanel,
  Tabs,
  Text,
  TextArea,
  TextInput,
  Title,
  Toolbar,
} from './index';

const meta: Meta = {
  title: 'Primitives/Gallery',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

/** Everything on one bevelled panel, the way the kit is meant to look. */
export const Gallery: Story = {
  render: () => {
    const [tab, setTab] = useState<'one' | 'two'>('one');
    const [tile, setTile] = useState<string | null>(null);
    return (
      <div className="w98-root" style={{ background: '#008080', padding: 24 }}>
        <div
          className="w98-bevel-out"
          style={{ background: '#c0c0c0', padding: 16, maxWidth: 720 }}
        >
          <Stack gap={16}>
            <Stack gap={6}>
              <Title>Primitives</Title>
              <Text variant="meta">
                The atoms every window is built from. See{' '}
                <Link href="#">the docs</Link>.
              </Text>
            </Stack>

            <Separator />

            <GroupBox label="Buttons">
              <Stack direction="row" gap={8} wrap align="center">
                <Button>OK</Button>
                <Button>Cancel</Button>
                <Button compact>…</Button>
                <Button pressed compact>Held</Button>
                <Button disabled>Disabled</Button>
              </Stack>
            </GroupBox>

            <GroupBox label="Fields">
              <Stack gap={10}>
                <TextInput label="Name" defaultValue="João" />
                <TextArea label="Notes" rows={3} defaultValue="..." />
                <Select
                  label="Theme"
                  options={[
                    { value: 'standard', label: 'Windows Standard' },
                    { value: 'plum', label: 'Plum' },
                  ]}
                />
                <Stack direction="row" gap={16}>
                  <Checkbox label="Enabled" defaultChecked />
                  <Radio name="demo" label="A" defaultChecked />
                  <Radio name="demo" label="B" />
                </Stack>
                <ProgressBar value={62} />
              </Stack>
            </GroupBox>

            <GroupBox label="Tabs">
              <Stack gap={0}>
                <Tabs
                  items={[
                    { id: 'one', label: 'One' },
                    { id: 'two', label: 'Two' },
                  ]}
                  active={tab}
                  onChange={setTab}
                />
                <TabPanel>
                  {tab === 'one' ? (
                    <BulletList items={['First item', 'Second item']} />
                  ) : (
                    <Text>Second panel.</Text>
                  )}
                </TabPanel>
              </Stack>
            </GroupBox>

            <GroupBox label="Tiles">
              <IconGrid onBackgroundClick={() => setTile(null)}>
                {['💾', '🖨️', '🎵', '🗂️'].map((glyph, index) => (
                  <IconTile
                    key={glyph}
                    thumb={glyph}
                    label={`Item ${index + 1}`}
                    selected={tile === glyph}
                    onSelect={() => setTile(glyph)}
                  />
                ))}
              </IconGrid>
            </GroupBox>

            <GroupBox label="Menu">
              <Menu className="w98-bevel-out" compact>
                <MenuItem label="New" icon="📄" accelerator />
                <MenuItem label="Open" icon="📂" accelerator />
                <MenuSeparator />
                <MenuItem label="Checked" checked />
                <MenuItem label="Disabled" disabled />
              </Menu>
            </GroupBox>

            <GroupBox label="Strips">
              <Stack gap={0}>
                <Toolbar>
                  <Text variant="strong">Toolbar</Text>
                </Toolbar>
                <StatusBar>
                  <StatusField grow>4 objects</StatusField>
                  <StatusField>1.44 MB</StatusField>
                </StatusBar>
              </Stack>
            </GroupBox>
          </Stack>
        </div>
      </div>
    );
  },
};
