import express from 'express'

const router = express.Router();

router.get('/:id', fetchLatestReviews)

export default router
