/**
 * JavaScript to handle with IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'
import { initUserDatabase } from './user.mjs'

export const DB_NAME = 'musicbee'

// IndexedDB configuration
if ('indexedDB' in window) {
  initUserDatabase()
}
