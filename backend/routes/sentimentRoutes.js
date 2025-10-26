import express from 'express'
import { getSentimentData } from '../controllers/sentimentController.js'

const router = express.Router()

// GET /sentiment/:id?days=7
router.get('/:id', getSentimentData)

export default router
