import express from 'express'
import fetchLatestNews from '../controllers/newsController.js'

const router = express.Router()

router.get('/:id', fetchLatestNews)

export default router