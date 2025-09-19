import express from 'express'
//functions needed from controller

const router = express.Router()

router.get('/:orgId/latest')

export default router