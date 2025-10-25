import pool from '../../db/pool.js'
import { handleFetchStockData } from '../stock/stockService.js'
import dotenv from 'dotenv'
dotenv.config()
import fetch from 'node-fetch'

const marketDataUrl = 'https://api.marketdata.app/v1/stocks/prices'

const getOrgSymbol = async (id) => {
  try {
    const orgSql = `
      SELECT symbol
      FROM sift_db.organizations
      WHERE id=$1;
    `
    const orgResults = await pool.query(orgSql, [id])
    return orgResults.rows[0]?.symbol
  } catch (error) {
    console.error('Error fetching organization symbol:', error)
    throw new Error('Failed to fetch organization symbol')
  }
}

const getStockData = async (symbol) => {
  try {
    const response = await fetch(`${marketDataUrl}/${symbol}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.MARKET_DATA_API_KEY}`
      }
    })
    const data = await response.json()
    if (data.s !== "ok") throw new Error("Error in fetching stock data")
    return data.mid
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error)
    throw new Error('Failed to fetch stock data')
  }
}

const saveStockData = async (orgId, mid, date) => {
  try {
    const sql = `
      INSERT INTO sift_db.org_stocks (org_id, mid, date)
      VALUES ($1, $2, $3)
      ON CONFLICT (org_id, date) DO UPDATE SET mid = $2, date = $3;
    `
    await pool.query(sql, [orgId, mid, date])
  } catch (error) {
    console.error('Error saving stock data:', error)
    throw new Error('Failed to save stock data')
  }
}

const fetchAndSaveStockData = async (orgId) => {
  if (orgId === undefined || isNaN(orgId)) {
    throw new Error('Invalid organization')
  }

  // Get org symbol from db
  const ticker = await getOrgSymbol(orgId)
  if (!ticker) {
    throw new Error('Organization symbol does not exist')
  }

  // Fetch stock data from external API
  let stockMid = await getStockData(ticker)
  stockMid = parseFloat(stockMid)

  // Save stock data to db
  const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  await saveStockData(orgId, stockMid, date)
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let isStockJobRunning = false

const fetchStockForAllOrgs = async () => {
  if (isStockJobRunning) return
  isStockJobRunning = true
  const started = new Date()

  try {
    // Get all organizations that have a stock symbol
    const { rows } = await pool.query('SELECT id FROM sift_db.organizations WHERE symbol IS NOT NULL;')
    const ids = rows.map((r) => r.id)

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      try {
        await fetchAndSaveStockData(id)
        console.log(`[stock-cron] Updated stock data for org ${id}`)
      } catch (err) {
        console.error(`[stock-cron] Failed to update org ${id}:`, err?.message || err)
      }

      // Wait 15s before processing next org (skip delay after last org)
      if (i < ids.length - 1) {
        console.log(`[stock-cron] Waiting 15s before next org...`)
        await delay(15_000)
      }
    }
  } catch (err) {
    console.error('[stock-cron] Failed to query orgs:', err?.message || err)
  } finally {
    const elapsed = (new Date() - started) / 1000
    console.log(`[stock-cron] Run complete in ${elapsed.toFixed(1)}s`)
    isStockJobRunning = false
  }
}

export const startStockScheduler = () => {
  // Initial run after 15s, then hourly
  setTimeout(fetchStockForAllOrgs, 15_000)
  setInterval(fetchStockForAllOrgs, 60 * 60 * 1000)
}
