import express from 'express'
import { fetchStockData } from '../controllers/stockController.js'

const router = express.Router()

router.get('/:id', fetchStockData)

export default router
