import dotenv from 'dotenv'
dotenv.config()
import fetch from 'node-fetch'
import pool from '../../db/pool.js'

const marketDataCandlesUrl = 'https://api.marketdata.app/v1/stocks/candles'

const fetchHistoricalStockData = async (symbol, resolution = 'D', from, to) => {
  try {
    const url = `${marketDataCandlesUrl}/${resolution}/${symbol}?from=${from}&to=${to}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.MARKET_DATA_API_KEY}`
      }
    })

    const data = await response.json()
    
    if (data.s !== 'ok') {
      throw new Error(`MarketData API error: ${data.s}`)
    }

    // Transform the response into a more usable format
    const candles = []
    for (let i = 0; i < data.t.length; i++) {
      candles.push({
        timestamp: data.t[i],
        date: new Date(data.t[i] * 1000).toISOString().split('T')[0], // Convert Unix timestamp to YYYY-MM-DD
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i],
        mid: ((data.h[i] + data.l[i]) / 2).toFixed(2) // Calculate mid price
      })
    }

    return candles
  } catch (error) {
    console.error(`Error fetching historical stock data for ${symbol}:`, error)
    throw new Error(`Failed to fetch historical stock data: ${error.message}`)
  }
}

const saveHistoricalStockData = async (orgId, candles) => {
  try {
    for (const candle of candles) {
      const sql = `
        INSERT INTO sift_db.org_stocks (org_id, mid, date)
        VALUES ($1, $2, $3)
        ON CONFLICT (org_id, date) DO UPDATE 
        SET mid = EXCLUDED.mid;
      `
      await pool.query(sql, [orgId, candle.mid, candle.date])
    }
  } catch (error) {
    console.error('Error saving historical stock data:', error)
    throw new Error(`Failed to save historical stock data: ${error.message}`)
  }
}

export const fetchAndSaveHistoricalData = async (orgId, symbol) => {
  if (!symbol) {
    console.warn(`No symbol provided for org ${orgId}, skipping historical data fetch`)
    return
  }

  try {
    // Calculate date range (3 months ago to today)
    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setMonth(fromDate.getMonth() - 3)

    const from = fromDate.toISOString().split('T')[0] // YYYY-MM-DD
    const to = toDate.toISOString().split('T')[0] // YYYY-MM-DD

    // Fetch historical data
    const candles = await fetchHistoricalStockData(symbol, 'D', from, to)

    // Save to database
    await saveHistoricalStockData(orgId, candles)
    
  } catch (error) {
    console.error(`Error in fetchAndSaveHistoricalData for org ${orgId}:`, error)
    // Don't throw - we don't want to fail the competitor addition if historical data fetch fails
  }
}
