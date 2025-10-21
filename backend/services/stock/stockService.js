import dotenv from 'dotenv';
dotenv.config()
import fetch from 'node-fetch';
import pool from '../../db/pool.js'

const marketDataUrl = 'https://api.marketdata.app/v1/stocks/prices'

export const handleFetchStockData = async (orgId) => {
     if (orgId === undefined || isNaN(orgId)) {
        throw new Error('Invalid organization ')
    }
    //get org symbol from db
    const ticker = await getOrgSymbol(orgId)
    if (!ticker) {  
        throw new Error('Organization symbol does not exist')
    }

    //fetch stock data from external API
    let stockMid = await getStockData(ticker)
    stockMid = parseFloat(stockMid)

    //save stock data to db
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    await saveStockData(orgId, stockMid, date)

    //return a week of stock data for display
    const weekStockData = await getWeekStockData(orgId)
    return weekStockData 
}

const getWeekStockData = async (orgId) => {
    try {
        const sql = `
            SELECT mid, date
            FROM sift_db.org_stocks
            WHERE org_id=$1
            ORDER BY date DESC
            LIMIT 7;
        `
        const result = await pool.query(sql, [orgId])
        return result.rows
    } catch (error) {
        console.error('Error fetching week stock data:', error)
        throw new Error('Failed to fetch week stock data')
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

const getOrgSymbol = async (id) => {
    try {
        const orgSql = `
            SELECT symbol
            FROM sift_db.organizations
            WHERE id=$1;
        `
        const orgResults = await pool.query(orgSql, [id])
        return orgResults.rows[0].symbol
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
        return data.mid;
    } catch (error) {
        console.error(`Error fetching stock data for ${symbol}:`, error)
        throw new Error('Failed to fetch stock data')
    }
}

export const startStockScheduler = () => {
    // Initial run after 15s, then hourly
    setTimeout(handleFetchStockData, 15_000)
    setInterval(handleFetchStockData, 60 * 60 * 1000)
}
