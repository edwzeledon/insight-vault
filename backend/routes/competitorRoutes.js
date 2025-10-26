import express from 'express'
import { addCompetitor, getUserCompetitors, removeCompetitor } from '../controllers/competitorController.js'

const router = express.Router()

// POST /competitors - Add a new competitor
router.post('/', addCompetitor)

// GET /competitors - Get all user competitors
router.get('/', getUserCompetitors)

// DELETE /competitors/:id - Remove a competitor
router.delete('/:id', removeCompetitor)

export default router
