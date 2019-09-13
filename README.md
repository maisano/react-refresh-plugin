# `react-refresh-plugin`

An _**experimental**_ webpack plugin for hot-reloading React components. Uses `react-refresh` under the hood.

## Installation

This module, still in its nascency, is not available on npm. To install, clone
the repository:

```
git clone https://github.com/maisano/react-refresh-plugin.git
```

Once installed, you can link it locally:

```
npm link
```

## Usage

In your project repository, install the locally linked package, as well as the
`react-refresh` peer dependency:

```
npm install -D react-refresh
npm link react-refresh-plugin
```

And then amend your webpack configuration:

```diff
+const ReactRefreshPlugin = require('react-refresh-plugin');
+
module.exports = {

  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
+         plugins: ['react-refresh/babel'],
        },
      },
    },
  ],

  plugins: [
+   new ReactRefreshPlugin(),
  ],

};
```
