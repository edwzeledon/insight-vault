import express from 'express'
import { fetchLatestNews, getLatestNews } from '../controllers/newsController.js'

const router = express.Router()

router.post('/:id', fetchLatestNews)

router.get('/:id', getLatestNews)

export default router