import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import crypto from 'crypto';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const port = 4000
const app = express()

dotenv.config()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true                 
}));

const pool = new pg.Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: `${process.env.DB_PASSWORD}`,
    database: 'Personal Projects'
})

app.post('/register', async (req, res) => {
    try {
        const { email, password, fname } = req.body

        if (email === undefined || email.length == 0
            || password === undefined || password.length == 0
            || fname === undefined || fname.length == 0
        ) {
            res.status(500).json({
                error: 'Please fill in all required fields'
            })
            return
        }

        const hashedPw = await bcrypt.hash(password, 10)
        const sql = `
            INSERT INTO sift_db.users (fname, email, password)
                VALUES ($1, $2, $3)
            RETURNING id;
        `
        const values = [fname, email, hashedPw]
        const results = await pool.query(sql, values)

        const id = results.rows[0].id
        const accessToken = generateAcessToken(email, id)
        const refreshToken = generateRefreshToken(email, id)

        const addtoken = `
            UPDATE sift_db.users
            SET refresh_tokens = array_append(refresh_tokens, $1)
            WHERE id = $2;
        `
        const addTokenVals = [hashToken(refreshToken), id]
        await pool.query(addtoken, addTokenVals)

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 1000 * 60 * 60 * 24 * 7
        }).status(200).json({ accessToken })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server Error" })
    }
})

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (email === undefined || email.length == 0
            || password === undefined || password.length == 0
        ) {
            res.status(400).json({ error: 'Please fill in all required fields' })
            return
        }

        const sql = `
            SELECT * 
            FROM sift_db.users
            WHERE email = $1;
        `
        const values = [email]
        const results = await pool.query(sql, values)

        if (!results.rowCount) {
            res.status(400).json({ error: 'Invalid Email' })
            return
        }

        const hashedPw = results.rows[0].password
        const isPwMatch = await bcrypt.compare(password, hashedPw)

        if (!isPwMatch) {
            res.status(400).json({ error: 'Invalid Password' })
            return
        }

        const userId = results.rows[0].id
        const accessToken = generateAcessToken(email, userId)
        const refreshToken = generateRefreshToken(email, userId)

        const addtoken = `
            UPDATE sift_db.users
            SET refresh_tokens = array_append(refresh_tokens, $1)
            WHERE id = $2;
        `
        const addTokenVals = [hashToken(refreshToken), userId]
        await pool.query(addtoken, addTokenVals)

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 1000 * 60 * 60 * 24 * 7
        }).status(200).json({ accessToken })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.delete('/logout', async (req, res) => {
    const reftoken = req.cookies.refreshToken
    if (reftoken === undefined) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    let decoded
    try {
        decoded = jwt.verify(reftoken, process.env.REFRESH_TOKEN_SECRET)
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
    try {
        const sql = `
            UPDATE sift_db.users
            SET refresh_tokens = array_remove(refresh_tokens, $1)
            WHERE id = $2
            RETURNING id;
        `
        const values = [hashToken(reftoken), decoded.userId]
        const results = await pool.query(sql, values)

        if (!results.rowCount) {
            return res.status(404).json({ error: 'Token not found or already removed' })
        }
        res.clearCookie("refreshToken", { path: "/" })
        res.status(200).json({ message: 'Logout successful' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Internal server error' })
    }
})

app.post('/refresh', async (req, res) => {
    const reftoken = req.cookies.refreshToken
    if (reftoken === undefined || reftoken.length == 0) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    let decoded
    try {
        decoded = jwt.verify(reftoken, process.env.REFRESH_TOKEN_SECRET)
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
    try {
        const sql = `
            SELECT refresh_tokens
            FROM sift_db.users
            WHERE id = $1 AND $2 = ANY(refresh_tokens); 
        `
        const values = [decoded.userId, hashToken(reftoken)]
        const results = await pool.query(sql, values)
        if (!results.rowCount) {
            return res.status(404).json({ error: 'Token not found or already removed' })
        }
        const acctoken = generateAcessToken(decoded.email, decoded.userId)
        res.status(200).json({ message: 'Succes', accessToken: acctoken })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Internal server error' })
    }

})

function generateAcessToken(email, id) {
    return jwt.sign({ email: email, userId: id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

function generateRefreshToken(email, id) {
    return jwt.sign({ email: email, userId: id }, process.env.REFRESH_TOKEN_SECRET)
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

app.listen(port, () => {
    console.log(`Auth Server running on port ${port}`)
})

