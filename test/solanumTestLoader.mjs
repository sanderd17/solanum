import path from 'path';
import process from 'process';
import Module from 'module';

const builtins = Module.builtinModules;
const JS_EXTENSIONS = new Set(['.js', '.mjs']);

const baseURL = new URL(`${process.cwd()}/`, 'file://');
const publicURL = new URL(`${process.cwd()}/solanum-core/public/`, 'file://');

export function resolve(specifier, parentModuleURL = null, defaultResolve) {
  if (builtins.includes(specifier)) {
    return {
      url: specifier,
      format: 'builtin'
    };
  }
  if (/^\.{0,2}[/]/.test(specifier) !== true && !specifier.startsWith('file:')) {
    // Import a node module
    return defaultResolve(specifier, parentModuleURL);
  }

  let resolved
  if (parentModuleURL == null) {
    // first import, coming from the CLI
    resolved = new URL(specifier, baseURL);
  } else if (specifier.startsWith('/')) {
    // import starting with / is only supported in the client, load from the public dir
    resolved = new URL('.' + specifier, publicURL);
  } else {
    // relative import, load from the module that imports it
    resolved = new URL(specifier, parentModuleURL);
  }

  const ext = path.extname(resolved.pathname);
  if (!JS_EXTENSIONS.has(ext)) {
    throw new Error(
      `Cannot load file ${resolved.pathname} with non-JavaScript file extension ${ext}.`);
  }
  return {
    url: resolved.href,
    format: 'module'
  };
}