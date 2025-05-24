module.exports = {
  extends: ['react-app', 'react-app/jest', 'prettier'], // This disables ESLint formatting rules that conflict with Prettier
  plugins: ['unused-imports'],
  rules: {
    // Unused imports handling
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],
    // Code quality rules (non-formatting)
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-unused-vars': 'off', // Handled by unused-imports plugin
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {},
    },
  ],
};
