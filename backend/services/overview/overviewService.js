import pool from '../../db/pool.js'

export const handleCompanyOverviewGet = async (orgId, days = 7) => {
    if (orgId === undefined || isNaN(orgId)) {
        throw new Error('Invalid organization')
    }

    try {
        // Execute all queries in parallel for better performance
        const [
            stockMetricsResult,
            mediaMentionsResult,
            avgSentimentResult
        ] = await Promise.all([
            getStockMetrics(orgId),
            getMediaMentionsMetrics(orgId, days),
            getAverageSentiment(orgId, days)
        ])

        return {
            stock: stockMetricsResult,
            mediaMentions: mediaMentionsResult,
            sentiment: avgSentimentResult
        }
    } catch (error) {
        console.error('Error fetching company overview:', error)
        throw new Error('Failed to fetch company overview')
    }
}

// Get stock metrics (current price and weekly change)
const getStockMetrics = async (orgId) => {
    try {
        // Get current stock price (most recent)
        const currentSql = `
            SELECT mid, date
            FROM sift_db.org_stocks
            WHERE org_id=$1
            ORDER BY date DESC
            LIMIT 1;
        `
        const currentResult = await pool.query(currentSql, [orgId])
        
        if (currentResult.rows.length === 0) {
            return { currentPrice: null, weekChange: null, weekChangePercent: null }
        }
        
        const currentPrice = parseFloat(currentResult.rows[0].mid)
        
        // Get stock price from 7 days ago
        const weekAgoSql = `
            SELECT mid
            FROM sift_db.org_stocks
            WHERE org_id=$1
            AND date <= (SELECT date FROM sift_db.org_stocks WHERE org_id=$1 ORDER BY date DESC LIMIT 1) - INTERVAL '7 days'
            ORDER BY date DESC
            LIMIT 1;
        `
        const weekAgoResult = await pool.query(weekAgoSql, [orgId])
        
        if (weekAgoResult.rows.length === 0) {
            // Not enough data for weekly comparison
            return { currentPrice: currentPrice.toFixed(2), weekChange: null, weekChangePercent: null }
        }
        
        const weekAgoPrice = parseFloat(weekAgoResult.rows[0].mid)
        const weekChange = currentPrice - weekAgoPrice
        const weekChangePercent = (weekChange / weekAgoPrice) * 100
        
        return {
            currentPrice: currentPrice.toFixed(2),
            weekChange: weekChange.toFixed(2),
            weekChangePercent: weekChangePercent.toFixed(2)
        }
    } catch (error) {
        console.error('Error fetching stock metrics:', error)
        throw error
    }
}

// Get media mentions metrics (current count and change percentage)
const getMediaMentionsMetrics = async (orgId, days) => {
    try {
        // Get current period count
        const currentSql = `
            SELECT COUNT(*) as count
            FROM sift_db.media
            WHERE org_id=$1 
            AND published_at >= CURRENT_DATE - INTERVAL '${days} days';
        `
        const currentResult = await pool.query(currentSql, [orgId])
        const currentCount = parseInt(currentResult.rows[0].count)
        
        // Get previous period count (same duration, offset by the period length)
        const previousSql = `
            SELECT COUNT(*) as count
            FROM sift_db.media
            WHERE org_id=$1 
            AND published_at >= CURRENT_DATE - INTERVAL '${days * 2} days'
            AND published_at < CURRENT_DATE - INTERVAL '${days} days';
        `
        const previousResult = await pool.query(previousSql, [orgId])
        const previousCount = parseInt(previousResult.rows[0].count)
        
        // Calculate change
        let changePercent = null
        if (previousCount > 0) {
            changePercent = ((currentCount - previousCount) / previousCount) * 100
        } else if (currentCount > 0) {
            // If previous was 0 but current has mentions, it's 100% increase
            changePercent = 100
        }
        
        return {
            currentCount,
            previousCount,
            changePercent: changePercent !== null ? parseFloat(changePercent.toFixed(2)) : null
        }
    } catch (error) {
        console.error('Error fetching media mentions metrics:', error)
        throw error
    }
}

// Get average sentiment
const getAverageSentiment = async (orgId, days) => {
    try {
        const sql = `
            SELECT AVG(sentiment) as avg_sentiment, COUNT(*) as count
            FROM sift_db.media
            WHERE org_id=$1 
            AND published_at >= CURRENT_DATE - INTERVAL '${days} days'
            AND sentiment IS NOT NULL;
        `
        const results = await pool.query(sql, [orgId])
        const avgSentiment = results.rows[0].avg_sentiment 
            ? parseFloat(results.rows[0].avg_sentiment) 
            : null
        const count = parseInt(results.rows[0].count)
        
        return { avgSentiment, count }
    } catch (error) {
        console.error('Error fetching average sentiment:', error)
        throw error
    }
}
