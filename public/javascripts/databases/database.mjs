/**
 * JavaScript to handle with IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'
import { initUserDatabase } from './user.mjs'

// IndexedDB configuration
if ('indexedDB' in window) {
  initUserDatabase()
}