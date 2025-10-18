import pool from '../../db/pool.js'
import { handleLatestNewsFetch } from '../news/newsService.js'

let isNewsJobRunning = false

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchNewsForTrackedOrgs = async () => {
  if (isNewsJobRunning) return
  isNewsJobRunning = true
  const started = new Date()
  try {
    // Query orgs to update; currently all organizations
    const { rows } = await pool.query('SELECT id FROM sift_db.organizations;')
    const ids = rows.map((r) => r.id)
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      try {
        await handleLatestNewsFetch({ id })
        console.log(`[news-cron] Updated news for org ${id}`)
      } catch (err) {
        console.error(`[news-cron] Failed to update org ${id}:`, err?.message || err)
      }
      // Wait 15s before processing next org (skip delay after last org)
      if (i < ids.length - 1) {
        console.log(`[news-cron] Waiting 30s before next org...`)
        await delay(30_000)
      }
    }
  } catch (err) {
    console.error('[news-cron] Failed to query orgs:', err?.message || err)
  } finally {
    const elapsed = (new Date() - started) / 1000
    console.log(`[news-cron] Run complete in ${elapsed.toFixed(1)}s`)
    isNewsJobRunning = false
  }
}

export const startNewsScheduler = () => {
  // Initial run after 15s, then hourly
  setTimeout(fetchNewsForTrackedOrgs, 15_000)
  setInterval(fetchNewsForTrackedOrgs, 60 * 60 * 1000)
}
