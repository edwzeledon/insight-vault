import { handleAddCompetitor, handleGetUserCompetitors, handleRemoveCompetitor } from '../services/competitor/competitorService.js'

/**
 * POST /competitors
 * Add a new competitor for the authenticated user
 */
export const addCompetitor = async (req, res) => {
    try {
        const orgName = req.body.name
        const userId = req.auth.userId

        const result = await handleAddCompetitor(orgName, userId)
        res.status(200).json({ message: result.message, org_id: result.orgId })
    } catch (error) {
        console.error('Error in addCompetitor controller:', error)
        
        // Handle specific error types
        if (error.message.includes('required field')) {
            return res.status(400).json({ error: error.message })
        }
        if (error.message.includes('Invalid Token')) {
            return res.status(401).json({ error: error.message })
        }
        
        res.status(500).json({ error: 'Internal server error' })
    }
}

/**
 * GET /competitors
 * Get all competitors for the authenticated user
 */
export const getUserCompetitors = async (req, res) => {
    try {
        const userId = req.auth.userId
        const organizations = await handleGetUserCompetitors(userId)
        
        res.status(200).json({ organizations })
    } catch (error) {
        console.error('Error in getUserCompetitors controller:', error)
        
        if (error.message.includes('Invalid Token')) {
            return res.status(401).json({ error: error.message })
        }
        
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

/**
 * DELETE /competitors/:id
 * Remove a competitor from the authenticated user's list
 */
export const removeCompetitor = async (req, res) => {
    try {
        const orgId = req.params.id
        const userId = req.auth.userId

        const result = await handleRemoveCompetitor(orgId, userId)
        res.status(200).json(result)
    } catch (error) {
        console.error('Error in removeCompetitor controller:', error)
        
        if (error.message.includes('Invalid Token')) {
            return res.status(401).json({ error: error.message })
        }
        if (error.message.includes('Invalid or missing org id')) {
            return res.status(400).json({ error: error.message })
        }
        
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
