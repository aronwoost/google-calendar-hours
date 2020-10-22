module.exports = {
  env: {
    browser: true,
    jest: true,
  },
  parser: 'babel-eslint',
  extends: ['airbnb', 'prettier', 'prettier/react'],
  plugins: ['prettier'],
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'arrow-body-style': ['error', 'as-needed'],
    'import/no-named-as-default': 'off',
    'no-param-reassign': 'off',
    'react/jsx-fragments': ['error', 'element'],
  },
};
