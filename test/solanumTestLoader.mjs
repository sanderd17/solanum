import fs from 'fs'
import process from 'process'
import url from 'url'

const publicURLs = [
    new URL(`${process.cwd()}/solanum-studio/public/`, 'file://'),
    new URL(`${process.cwd()}/solanum-core/public/`, 'file://')
]

/**
 * Resolves modules in a client and server friendly way.
 * All modules are resolved as normal, except modules imported from the root (path starting with '/').
 * Those are searched in the public dirs.
 * @param {string} specifier name or path by which the module is imported
 * @param {{parentURL: URL}} context URL to the module doing the resolve request (null if it's directly from the CLI)
 * @param defaultResolve 
 */
export function resolve(specifier, context, defaultResolve) {
    const { parentURL = null } = context;
    if (parentURL != null && specifier.startsWith('/')) {
        // For some or all specifiers, do some custom logic for resolving.
        // Always return an object of the form {url: <string>}
        for (let publicURL of publicURLs) {
            let resolved = new URL('.' + specifier, publicURL)
            let filePath = url.fileURLToPath(resolved)
            if (fs.existsSync(filePath))
              return {url: resolved.href}
        }
    }
    // Defer to Node.js for all other specifiers.
    return defaultResolve(specifier, context, defaultResolve);
}