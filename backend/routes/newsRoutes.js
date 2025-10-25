import express from 'express'
import {fetchLatestNews, getLatestNews, getNewsCount} from '../controllers/newsController.js'

const router = express.Router()

router.post('/:id', fetchLatestNews)

router.get('/:id', getLatestNews)

router.get('/:id/count', getNewsCount)

export default router