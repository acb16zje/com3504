/**
 * Populate the search with data from MongoDB or IndexedDB
 *
 * @author Zer Jun Eng
 */

'use strict'
import { loadExplorePageLocal } from './databases/event.mjs'

/**
 * Adding events data into the search function
 */
(async function () {
  await loadExplorePageLocal().then(events => {
    for (let i = 0; i < events.length; i++) {
      events[i].genres = events[i].genres.map(genre => genre.name).join(' ')

      index.add(events[i])
    }
  }).catch((err) => {
    console.log(err)
    console.log('Failed to load events data for search functon')
  })
})()
