import { handleSentimentDataGet } from '../services/sentiment/sentimentService.js'

export const getSentimentData = async (req, res) => {
    try {
        const orgId = req.params.id
        const days = parseInt(req.query.days) || 7
        
        if (!orgId || isNaN(orgId)) {
            return res.status(400).json({ error: 'Invalid organization ID' })
        }
        
        const sentimentData = await handleSentimentDataGet(orgId, days)
        res.status(200).json(sentimentData)
    } catch (error) {
        console.error('Error in getSentimentData controller:', error)
        res.status(500).json({ error: error.message || 'Failed to fetch sentiment data' })
    }
}
