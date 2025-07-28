module.exports = {
  source: {
    include: [
      'pages',
      'components',
      'lib',
      'utils',
      'middleware.ts',
      'next.config.js',
      'jest.config.js'
    ],
    includePattern: '\\.(js|jsx|ts|tsx)$',
    excludePattern: '(node_modules/|.next/|out/|coverage/)',
  },
  opts: {
    destination: './docs/',
    recurse: true,
    readme: './README.md',
    template: 'node_modules/better-docs',
  },
  plugins: [
    'plugins/markdown',
    'better-docs/component',
    'better-docs/typescript',
  ],
  tags: {
    allowUnknownTags: true,
    dictionaries: ['jsdoc', 'closure'],
  },
  sourceType: 'module',
  tags: {
    allowUnknownTags: true,
  },
  templates: {
    betterDocs: {
      name: 'CampusHub Documentation',
      logo: 'https://your-logo-url-here.com/logo.png',
      title: 'CampusHub API Documentation',
      hideTitle: false,
      navigation: [
        {
          label: 'API',
          href: '/api'
        },
        {
          label: 'Components',
          href: '/components'
        },
        {
          label: 'GitHub',
          href: 'https://github.com/your-username/campushub'
        }
      ]
    }
  }
};
