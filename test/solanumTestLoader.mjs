import path from 'path'
import fs from 'fs'
import process from 'process'
import Module from 'module'
import url from 'url'

const builtins = Module.builtinModules;
const JS_EXTENSIONS = new Set(['.js', '.mjs']);

const baseURL = new URL(`${process.cwd()}/`, 'file://')
const publicURLs = [
  new URL(`${process.cwd()}/solanum-studio/public/`, 'file://'),
  new URL(`${process.cwd()}/solanum-core/public/`, 'file://')
]

/**
 * Resolves modules in a client and server friendly way.
 * All modules are resolved as normal, except modules imported from the root (path starting with '/').
 * Those are searched in the public dirs.
 * @param {string} specifier name or path by which the module is imported
 * @param {URL} parentModuleURL URL to the module doing the resolve request (null if it's directly from the CLI)
 * @param defaultResolve 
 */
export function resolve(specifier, parentModuleURL = null, defaultResolve) {
  if (builtins.includes(specifier)) {
    return {
      url: specifier,
      format: 'builtin'
    };
  }
  if (/^\.{0,2}[/]/.test(specifier) !== true && !specifier.startsWith('file:')) {
    // Import a node module
    return defaultResolve(specifier, parentModuleURL)
  }

  let resolved
  if (parentModuleURL == null) {
    // first import, coming from the CLI
    resolved = new URL(specifier, baseURL)
  } else if (specifier.startsWith('/')) {
    // import starting with / is only supported in the client, load from a public dir
    for (let publicURL of publicURLs) {
      resolved = new URL('.' + specifier, publicURL)
      let filePath = url.fileURLToPath(resolved)
      if (fs.existsSync(filePath))
        break; // file found
    }
  } else {
    // relative import or file: protocol, load from the module that imports it
    resolved = new URL(specifier, parentModuleURL)
  }

  const ext = path.extname(resolved.pathname)
  if (!JS_EXTENSIONS.has(ext)) {
    throw new Error(
      `Cannot load file ${resolved.pathname} with non-JavaScript file extension ${ext}.`)
  }
  return {
    url: resolved.href,
    format: 'module'
  };
}