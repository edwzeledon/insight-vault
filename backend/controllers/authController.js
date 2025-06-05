import { handleRegister, handleLogin, handleRefresh, handleLogout } from "../services/auth/authService.js"

export const registerUser = async (req, res) => {
    try {
        const result = await handleRegister(req.body)
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 1000 * 60 * 60 * 24 * 7
        }).status(200).json({ accessToken: result.accessToken })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

export const loginUser = async (req, res) => {
    try {
        const result = await handleLogin(req.body)
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 1000 * 60 * 60 * 24 * 7
        }).status(200).json({ accessToken: result.accessToken })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

export const logoutUser = async (req, res) => {
    try {
        const result = await handleLogout(req.cookies)
        res.clearCookie("refreshToken", { path: "/" })
        res.status(200).json(result)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

export const refreshUser = async (req, res) => {
    try {
        const result = await handleRefresh(req.cookies)
        res.status(200).json(result)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}