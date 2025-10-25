import { handleCompanyOverviewGet } from "../services/overview/overviewService.js";

export const getCompanyOverview = async (req, res) => {
    try {
        const id = req.params.id
        const days = req.query.days || 7
        
        if (id === undefined || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid or missing org id' })
        }
        
        const overviewData = await handleCompanyOverviewGet(id, days)
        res.status(200).json(overviewData)
    } catch (error) {
        console.error('Error in getCompanyOverview:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
