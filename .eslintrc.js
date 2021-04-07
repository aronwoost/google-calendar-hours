module.exports = {
  env: {
    browser: true,
    jest: true,
  },
  parser: 'babel-eslint',
  extends: [
    'airbnb',
    'prettier',
    'prettier/react',
    'plugin:testing-library/react',
    'plugin:jest-dom/recommended',
  ],
  plugins: ['prettier', 'testing-library', 'jest-dom', 'no-only-tests'],
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'arrow-body-style': ['error', 'as-needed'],
    'import/no-named-as-default': 'off',
    'no-param-reassign': 'off',
    'react/jsx-fragments': ['error', 'element'],
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        labelComponents: [],
        labelAttributes: [],
        controlComponents: [],
        assert: 'either',
        depth: 25,
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.test.js'] },
    ],
    'testing-library/prefer-wait-for': 'error',
    'testing-library/no-manual-cleanup': 'error',
    'testing-library/prefer-screen-queries': 'error',
    'no-only-tests/no-only-tests': 'error',
  },
};
