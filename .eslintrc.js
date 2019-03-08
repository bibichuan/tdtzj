module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "no-multiple-empty-lines": 'off',
    "eol-last": 'off',
    "no-unused-vars": [2, {
      // 允许声明未使用变量
      "vars": "local",
      "let": "local",
      // 参数不检查
      "args": "none"
    }],
    "space-infix-ops": 'off',
    "no-trailing-spaces": ["error",{
      "skipBlankLines": true
    }],
    "spaced-comment": 'off',
    "semi": 'off',
    "semi-spacing": 'off',
    "space-before-function-paren": 'off',
    "key-spacing": 'off',
    "keyword-spacing": 'off',
    "no-unused-expressions": 'off',
    "no-unused-vars": 'off',
    "no-new": 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
