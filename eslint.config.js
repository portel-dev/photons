import html from 'eslint-plugin-html';

export default [
  {
    files: ['**/*.html'],
    plugins: { html },
    rules: {
      // Basic syntax errors - these will catch issues like await in non-async functions
      'no-undef': 'off', // HTML has globals like document, window
      'no-unused-vars': 'off', // Functions may be called from HTML attributes
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        fetch: 'readonly',
        confirm: 'readonly',
        alert: 'readonly',
        Date: 'readonly',
        Map: 'readonly',
        Set: 'readonly',
        JSON: 'readonly',
        Promise: 'readonly',
        Error: 'readonly',
        URLSearchParams: 'readonly',
      },
    },
  },
];
