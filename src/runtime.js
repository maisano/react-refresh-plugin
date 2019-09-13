const ReactRefreshRuntime = require('react-refresh/runtime');

ReactRefreshRuntime.injectIntoGlobalHook(window);

window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;

let timerId;

function enqueueUpdate() {
  clearTimeout(timerId);

  timerId = setTimeout(() => {
    ReactRefreshRuntime.performReactRefresh();
  }, 30);
}

function isReactRefreshBoundary(moduleExports) {
  if (ReactRefreshRuntime.isLikelyComponentType(moduleExports)) {
    return true;
  }

  if (moduleExports == null || typeof moduleExports !== 'object') {
    // Exit if we can't iterate over exports.
    return false;
  }

  let hasExports = false;
  let areAllExportsComponents = true;

  for (const key in moduleExports) {
    hasExports = true;
    if (key === '__esModule') {
      continue;
    }

    const desc = Object.getOwnPropertyDescriptor(moduleExports, key);
    if (desc && desc.get) {
      // Don't invoke getters as they may have side effects.
      return false;
    }

    const exportValue = moduleExports[key];
    if (!ReactRefreshRuntime.isLikelyComponentType(exportValue)) {
      areAllExportsComponents = false;
    }
  }

  return hasExports && areAllExportsComponents;
}

module.exports = {
  isReactRefreshBoundary,
  enqueueUpdate,
};
