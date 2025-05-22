import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pg from 'pg'
import e from 'express';

const port = 4000
const app = express()

dotenv.config()
app.use(express.urlencoded({ extended: false }))

const pool = pg.Pool({
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
            res.json({
                error: 'Please fill in all required fields'
            })
            return
        }

        const hashedPw = await bcrypt.hash(password, 10)
        const sql = `
            INSERT INTO sift_db.users (fname, email, password)
                VALUES ($1, $2, $3);
        `

        const values = [fname, email, hashedPw]
        await pool.query(sql, values)

        const accessToken = generateAcessToken(email)
        res.json({ accessToken })

    } catch (error) {
        console.log(error)
        res.json({ error: "Server Error" })
    }
})

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (email === undefined || email.length == 0
            || password === undefined || password.length == 0
        ) {
            res.json({ error: 'Please fill in all required fields' })
            return
        }

        const sql = `
            SELECT * 
             FROM sift_db.users
             WHERE email = $1;
        `
        const values = [email]
        const results = await pool.query(sql, values)

        if (!results.rows) {
            res.json({ error: 'Invalid Email' })
            return
        }

        const hashedPw = results.rows[0].password
        const isPwMatch = await bcrypt.compare(password, hashedPw)

        if (!isPwMatch) {
            res.json({ error: 'Invalid Password' })
            return
        }

        const accessToken = generateAcessToken(email)
        res.json({ accessToken })
    } catch (error) {
        console.log(error)
        res.json({ error: "Server Error" })
    }
})

function generateAcessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}

app.delete('/logout', (req, res) => {
    
})

app.listen(port, () => {
    console.log(`Auth Server running on port ${port}`)
})

