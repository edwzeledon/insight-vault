import pool from '../../db/pool.js'

/**
 * Get daily sentiment data for an organization within a date range
 * Returns sentiment scores grouped by date
 */
export const handleSentimentDataGet = async (orgId, days = 7) => {
    if (orgId === undefined || isNaN(orgId)) {
        throw new Error('Invalid organization ID')
    }

    try {
        const sql = `
            SELECT 
                DATE(published_at) as date,
                AVG(sentiment) as avg_sentiment,
                COUNT(*) as article_count
            FROM sift_db.media
            WHERE org_id = $1 
            AND published_at >= CURRENT_DATE - INTERVAL '${days} days'
            AND sentiment IS NOT NULL
            GROUP BY DATE(published_at)
            ORDER BY date ASC;
        `
        
        const results = await pool.query(sql, [orgId])
        
        // Transform data for frontend consumption
        const sentimentData = results.rows.map(row => ({
            date: row.date,
            avgSentiment: parseFloat(row.avg_sentiment),
            articleCount: parseInt(row.article_count)
        }))
        
        return sentimentData
    } catch (error) {
        console.error('Error fetching sentiment data:', error)
        throw new Error('Failed to fetch sentiment data')
    }
}
