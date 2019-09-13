const prependEntry = require('./prependEntry');
const runtime = require.resolve('./runtime');

class ReactRefreshPlugin {
  apply(compiler) {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('ReactRefreshPlugin is only for development');
    }

    compiler.options.entry = prependEntry(compiler.options.entry, runtime);

    compiler.hooks.normalModuleFactory.tap('ReactRefreshPlugin', (nmf) => {
      nmf.hooks.afterResolve.tap('ReactRefreshPlugin', (data) => {
        if (
          /\.jsx?$/.test(data.resource) &&
          !/node_modules/.test(data.resource)
        ) {
          data.loaders.unshift({
            loader: require.resolve('./ReactRefreshHotModuleLoader'),
          });
        }

        return data;
      });
    });

    compiler.hooks.compilation.tap('ReactRefreshPlugin', (compilation) => {
      const { mainTemplate } = compilation;

      // Inject a helper function into the bundle's runtime.
      mainTemplate.hooks.localVars.tap(
        'ReactRefreshPlugin',
        (source, chunk, hash) => {
          return [
            source,
            'function setupReactRefreshForModule(moduleId) {',
            '  // "react-refresh/runtime" has not yet executed',
            `  var runtime = ${mainTemplate.requireFn}.$runtime();`,
            '  if (runtime === undefined) {',
            '    return function() {};',
            '  }',
            '  var prevRefreshReg = window.$RefreshReg$;',
            '  var prevRefreshSig = window.$RefreshSig$;',
            '  window.$RefreshReg$ = function(type, id) {',
            '    const fullId = moduleId + " " + id;',
            `    runtime.register(type, fullId);`,
            '  };',
            '  window.$RefreshSig$ = runtime.createSignatureFunctionForTransform;',
            '  return function resetReactRefreshGlobals() {',
            '    window.$RefreshReg$ = prevRefreshReg;',
            '    window.$RefreshSig$ = prevRefreshSig;',
            '  }',
            '}',
          ].join('\n');
        },
      );

      // Give "react-refresh/runtime" a specific id to make lookups in
      // webpack's module cache easier
      compilation.hooks.beforeModuleIds.tap('ReactRefreshPlugin', (modules) => {
        for (const module of modules) {
          if (module.rawRequest === 'react-refresh/runtime') {
            module.id = '$runtime';
          }
        }
      });

      // Decorate `__webpack_require__` with a `$runtime` function, which
      // retreives the exports of "react-refresh/runtime" once loaded.
      mainTemplate.hooks.requireExtensions.tap(
        'ReactRefreshPlugin',
        (source) => {
          return (
            source +
            [
              '\n\n',
              `${mainTemplate.requireFn}.$runtime = function () {`,
              '  // This function only returns the exports of the runtime wrapper',
              '  // once the module has finished executing.',
              `  if ('$runtime' in ${mainTemplate.requireFn}.c && ${mainTemplate.requireFn}.c.$runtime.l) {`,
              `    return ${mainTemplate.requireFn}.c.$runtime.exports;`,
              '  }',
              '}',
            ].join('\n')
          );
        },
      );

      // Wrap module execution in order to setup and teardown state
      // used by "react-refresh/runtime".
      mainTemplate.hooks.require.tap('ReactRefreshPlugin', (source) => {
        const lines = source.split('\n');

        const moduleInitializationLineNumber = lines.findIndex((line) => {
          return line.startsWith('modules[moduleId].call');
        });

        if (moduleInitializationLineNumber === -1) {
          return source;
        }

        lines.splice(
          moduleInitializationLineNumber,
          1,
          'var cleanup = setupReactRefreshForModule(module.i);',
          'try {',
          '  ' + lines[moduleInitializationLineNumber],
          '} finally {',
          '  cleanup();',
          '}',
        );

        return lines.join('\n');
      });
    });
  }
}

module.exports = ReactRefreshPlugin;
