const runtime = require.resolve('./runtime');

const ReactRefreshHotModuleInjection = `
const runtime = require('${runtime}');
if (runtime.isReactRefreshBoundary(module.exports || module.__proto__.exports)) {
  module.hot.accept();
  runtime.enqueueUpdate();
}
`;

function ReactRefreshHotModuleLoader(source) {
  this.cacheable();

  return source + ReactRefreshHotModuleInjection;
}

module.exports = ReactRefreshHotModuleLoader;
