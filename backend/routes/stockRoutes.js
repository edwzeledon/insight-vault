import express from 'express'
import { fetchStockData } from '../controllers/stockController.js'

const router = express.Router()

// Get stock history for chart
router.get('/:id', fetchStockData)

export default router
