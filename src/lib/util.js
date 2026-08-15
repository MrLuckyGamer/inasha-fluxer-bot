import { pathToFileURL } from 'url';

/**
 * Convert an absolute filesystem path to a file:// URL string.
 * Required for dynamic import() of absolute paths in Node ESM.
 */
export function pathToURL(absPath) {
  return pathToFileURL(absPath).href;
}
