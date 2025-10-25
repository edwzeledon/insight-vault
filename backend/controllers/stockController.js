import { handleFetchStockData } from "../services/stock/stockService.js";

export const fetchStockData = async (req, res) => {
    try {
        const id = req.params.id
        const days = parseInt(req.query.days) || 7 // Default to 7 days
        if (id === undefined || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid or missing org id ' })
        }
        const stockData = await handleFetchStockData(id, days)
        res.status(200).json({ message: 'Successfully fetched stock data', data: stockData })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
