/**
 * Trivium Library
 * Load the library into memory by folder and file.
 */
require('./utils').loadDirectoryRecursive(require('path').resolve(__dirname, '../app/lib'), ( module.exports = {} ) );