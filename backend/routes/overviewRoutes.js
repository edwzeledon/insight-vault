import express from 'express'
import { getCompanyOverview } from '../controllers/overviewController.js'

const router = express.Router()

router.get('/:id', getCompanyOverview)

export default router
