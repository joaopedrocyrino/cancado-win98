import type { Preview } from '@storybook/react';
import '../src/styles/base.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: {
      default: 'desktop',
      values: [
        { name: 'desktop', value: '#008080' },
        { name: 'face', value: '#c0c0c0' },
        { name: 'black', value: '#000000' },
      ],
    },
  },
};

export default preview;
