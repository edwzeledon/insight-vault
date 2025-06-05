import express from 'express'
import { loginUser, logoutUser, refreshUser, registerUser } from '../controllers/authController.js'
const router = express.Router()

router.post('/register', registerUser)

router.post('/login', loginUser)

router.delete('/logout', logoutUser)

router.post('/refresh', refreshUser)

export default router