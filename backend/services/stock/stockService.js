import dotenv from 'dotenv';
dotenv.config()
import pool from '../../db/pool.js'

// Get stock history for chart
export const handleFetchStockData = async (orgId) => {
    if (orgId === undefined || isNaN(orgId)) {
        throw new Error('Invalid organization')
    }
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

