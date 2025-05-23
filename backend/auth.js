import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pg from 'pg'

const port = 4000
const app = express()

dotenv.config()
app.use(express.urlencoded({ extended: false }))

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
            SET refresh_token = array_append(refresh_token, $1)
            WHERE = $2;
        `
        const addTokenVals = [hashToken(refreshToken), id]
        await pool.query(addtoken, addTokenVals )

        res.status(200).json({ accessToken, refreshToken })

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
            SET refresh_token = array_append(refresh_token, $1)
            WHERE = $2;
        `
        const addTokenVals = [hashToken(refreshToken), userId]
        await pool.query(addtoken, addTokenVals )
        
        res.status(200).json({ accessToken, refreshToken })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.delete('/logout', async (req, res) => {
    const reftoken = req.body.token
    if (reftoken === undefined) {
        res.status(403).json({ error: 'Forbidden' });
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
        res.status(200).json({ message: 'Logout successful' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Internal server error' })
    }
})

app.get('/token', async (req, res) => {        

})

function generateAcessToken(email, id) {
    return jwt.sign({ email: email, userId: id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}

function generateRefreshToken(email, id) {
    return jwt.sign({ email: email, userId: id }, process.env.REFRESH_TOKEN_SECRET)
}

function hashToken(token) {
    return createHash('sha256').update(token).digest('hex');
}

app.listen(port, () => {
    console.log(`Auth Server running on port ${port}`)
})

