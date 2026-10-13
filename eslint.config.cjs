const { fixupPluginRules } = require('@eslint/compat');
const next = require('./tooling/next-eslint');
const stylistic = require('@stylistic/eslint-plugin');
module.exports = [{ ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**'] }, {
 files: ['pages/**/*.{js,jsx}', 'components/**/*.{js,jsx}', 'lib/**/*.{js,jsx}'],
 languageOptions: { ecmaVersion: 2021, sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } }, globals: { ...require('globals').browser, ...require('globals').node, ...require('globals').es2021 } },
 settings: { react: { version: 'detect' }, 'import/resolver': { node: true } },
 plugins: { '@next/next': fixupPluginRules(next), react: fixupPluginRules(require('eslint-plugin-react')), 'react-hooks': fixupPluginRules(require('eslint-plugin-react-hooks')), 'jsx-a11y': fixupPluginRules(require('eslint-plugin-jsx-a11y')), import: fixupPluginRules(require('eslint-plugin-import')), '@stylistic': stylistic.default || stylistic },
 rules: {
  "no-unused-vars": [
    "error",
    {
      "argsIgnorePattern": "^_"
    }
  ],
  "no-console": [
    "warn",
    {
      "allow": [
        "warn",
        "error"
      ]
    }
  ],
  "prefer-const": [
    "error"
  ],
  "no-var": [
    "error"
  ],
  "object-shorthand": [
    "error"
  ],
  "prefer-arrow-callback": [
    "error"
  ],
  "react/prop-types": [
    "off"
  ],
  "react/react-in-jsx-scope": [
    "off"
  ],
  "constructor-super": [
    "error"
  ],
  "for-direction": [
    "error"
  ],
  "getter-return": [
    "error"
  ],
  "no-async-promise-executor": [
    "error"
  ],
  "no-case-declarations": [
    "error"
  ],
  "no-class-assign": [
    "error"
  ],
  "no-compare-neg-zero": [
    "error"
  ],
  "no-cond-assign": [
    "error"
  ],
  "no-const-assign": [
    "error"
  ],
  "no-constant-condition": [
    "error"
  ],
  "no-control-regex": [
    "error"
  ],
  "no-debugger": [
    "error"
  ],
  "no-delete-var": [
    "error"
  ],
  "no-dupe-args": [
    "error"
  ],
  "no-dupe-class-members": [
    "error"
  ],
  "no-dupe-else-if": [
    "error"
  ],
  "no-dupe-keys": [
    "error"
  ],
  "no-duplicate-case": [
    "error"
  ],
  "no-empty": [
    "error"
  ],
  "no-empty-character-class": [
    "error"
  ],
  "no-empty-pattern": [
    "error"
  ],
  "no-ex-assign": [
    "error"
  ],
  "no-extra-boolean-cast": [
    "error"
  ],
  "no-extra-semi": [
    "error"
  ],
  "no-fallthrough": [
    "error"
  ],
  "no-func-assign": [
    "error"
  ],
  "no-global-assign": [
    "error"
  ],
  "no-import-assign": [
    "error"
  ],
  "no-inner-declarations": [
    "error"
  ],
  "no-invalid-regexp": [
    "error"
  ],
  "no-irregular-whitespace": [
    "error"
  ],
  "no-loss-of-precision": [
    "error"
  ],
  "no-misleading-character-class": [
    "error"
  ],
  "no-mixed-spaces-and-tabs": [
    "error"
  ],
  "no-new-symbol": [
    "error"
  ],
  "no-nonoctal-decimal-escape": [
    "error"
  ],
  "no-obj-calls": [
    "error"
  ],
  "no-octal": [
    "error"
  ],
  "no-prototype-builtins": [
    "error"
  ],
  "no-redeclare": [
    "error"
  ],
  "no-regex-spaces": [
    "error"
  ],
  "no-self-assign": [
    "error"
  ],
  "no-setter-return": [
    "error"
  ],
  "no-shadow-restricted-names": [
    "error"
  ],
  "no-sparse-arrays": [
    "error"
  ],
  "no-this-before-super": [
    "error"
  ],
  "no-undef": [
    "error"
  ],
  "no-unexpected-multiline": [
    "error"
  ],
  "no-unreachable": [
    "error"
  ],
  "no-unsafe-finally": [
    "error"
  ],
  "no-unsafe-negation": [
    "error"
  ],
  "no-unsafe-optional-chaining": [
    "error"
  ],
  "no-unused-labels": [
    "error"
  ],
  "no-useless-backreference": [
    "error"
  ],
  "no-useless-catch": [
    "error"
  ],
  "no-useless-escape": [
    "error"
  ],
  "no-with": [
    "error"
  ],
  "require-yield": [
    "error"
  ],
  "use-isnan": [
    "error"
  ],
  "valid-typeof": [
    "error"
  ],
  "@next/next/no-html-link-for-pages": [
    "error"
  ],
  "@next/next/no-sync-scripts": [
    "error"
  ],
  "@next/next/google-font-display": [
    "warn"
  ],
  "@next/next/google-font-preconnect": [
    "warn"
  ],
  "@next/next/next-script-for-ga": [
    "warn"
  ],
  "@next/next/no-async-client-component": [
    "warn"
  ],
  "@next/next/no-before-interactive-script-outside-document": [
    "warn"
  ],
  "@next/next/no-css-tags": [
    "warn"
  ],
  "@next/next/no-head-element": [
    "warn"
  ],
  "@next/next/no-img-element": [
    "warn"
  ],
  "@next/next/no-page-custom-font": [
    "warn"
  ],
  "@next/next/no-styled-jsx-in-document": [
    "warn"
  ],
  "@next/next/no-title-in-document-head": [
    "warn"
  ],
  "@next/next/no-typos": [
    "warn"
  ],
  "@next/next/no-unwanted-polyfillio": [
    "warn"
  ],
  "@next/next/inline-script-id": [
    "error"
  ],
  "@next/next/no-assign-module-variable": [
    "error"
  ],
  "@next/next/no-document-import-in-page": [
    "error"
  ],
  "@next/next/no-duplicate-head": [
    "error"
  ],
  "@next/next/no-head-import-in-document": [
    "error"
  ],
  "@next/next/no-script-component-in-head": [
    "error"
  ],
  "import/no-anonymous-default-export": [
    "warn"
  ],
  "react/no-unknown-property": [
    "off"
  ],
  "jsx-a11y/alt-text": [
    "warn",
    {
      "elements": [
        "img"
      ],
      "img": [
        "Image"
      ]
    }
  ],
  "jsx-a11y/aria-props": [
    "warn"
  ],
  "jsx-a11y/aria-proptypes": [
    "warn"
  ],
  "jsx-a11y/aria-unsupported-elements": [
    "warn"
  ],
  "jsx-a11y/role-has-required-aria-props": [
    "warn"
  ],
  "jsx-a11y/role-supports-aria-props": [
    "warn"
  ],
  "react/jsx-no-target-blank": [
    "off"
  ],
  "react-hooks/rules-of-hooks": [
    "error"
  ],
  "react-hooks/exhaustive-deps": [
    "warn"
  ],
  "react/display-name": [
    2
  ],
  "react/jsx-key": [
    2
  ],
  "react/jsx-no-comment-textnodes": [
    2
  ],
  "react/jsx-no-duplicate-props": [
    2
  ],
  "react/jsx-no-undef": [
    2
  ],
  "react/jsx-uses-react": [
    2
  ],
  "react/jsx-uses-vars": [
    2
  ],
  "react/no-children-prop": [
    2
  ],
  "react/no-danger-with-children": [
    2
  ],
  "react/no-deprecated": [
    2
  ],
  "react/no-direct-mutation-state": [
    2
  ],
  "react/no-find-dom-node": [
    2
  ],
  "react/no-is-mounted": [
    2
  ],
  "react/no-render-return-value": [
    2
  ],
  "react/no-string-refs": [
    2
  ],
  "react/no-unescaped-entities": [
    2
  ],
  "react/no-unsafe": [
    0
  ],
  "react/require-render-return": [
    2
  ],
  "@stylistic/arrow-spacing": [
    "error"
  ],
  "@stylistic/comma-dangle": [
    "error",
    "never"
  ],
  "@stylistic/quotes": [
    "error",
    "single",
    {
      "avoidEscape": true
    }
  ],
  "@stylistic/semi": [
    "error",
    "always"
  ],
  "@stylistic/indent": [
    "error",
    2,
    {
      "SwitchCase": 1,
      "flatTernaryExpressions": false,
      "offsetTernaryExpressions": false,
      "ignoreComments": false
    }
  ]
}
}];
