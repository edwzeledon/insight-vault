import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { expressjwt } from 'express-jwt';
import pool from './db/pool.js'
import authRoutes from './routes/authRoutes.js'

import gplay from "google-play-scraper";

const port = 3000
const app = express()

dotenv.config()
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(expressjwt({ secret: process.env.ACCESS_TOKEN_SECRET, algorithms: ['HS256'] }).unless({
    path: [/^\/auth\/.*/]
}))
app.use(cookieParser())

//ROUTES
app.use('/auth', authRoutes)

app.post('/addcompetitor', async (req, res) => {
    try {
        const org = req.body.name
        const id = req.auth.userId

        if (org === undefined || org.length == 0) {
            return res.status(500).json({ error: 'Please fill in required field' })
        }
        if (id === undefined || id.length == 0) {
            return res.status(401).json({ error: 'Invalid Token: user id missing' })
        }

        const checkOrgDup = `
            SELECT * 
            FROM sift_db.organizations
            WHERE name ILIKE $1;
        `
        const dupOrgResults = await pool.query(checkOrgDup, [org])

        let appId
        if (!dupOrgResults.rowCount) {
            //insert new org, get play store id
            const appResults = await gplay.search({ term: org, num: 1 })
            appId = appResults.length ? appResults[0].appId : null

            const insertOrg = `
                INSERT INTO sift_db.organizations (name, app_id)
                VALUES ($1, $2)
                RETURNING *;
            `
            const values = [org, appId]
            const results = await pool.query(insertOrg, values)
            if (results.rowCount) {
                appId = results.rows[0].id
            }
        } else {
            appId = dupOrgResults.rows[0].id
        }

        //connect user id to org
        const addRelation = `
            INSERT INTO sift_db.user_competitors (user_id, org_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, org_id) DO NOTHING;
        `
        const values = [id, appId]
        await pool.query(addRelation, values)
        res.status(200).json({ message: 'succesfully added new competitor', org_id: appId })

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

app.get('/getUserCompetitors', async (req, res) => {
    const userId = req.auth.userId
    if (userId === undefined) {
        return res.status(401).json({ error: 'Invalid Token: user id missing' })
    }
    try {
        const sql = `
            SELECT name, org_id
            FROM sift_db.user_competitors
            LEFT JOIN sift_db.organizations
                ON user_competitors.org_id = organizations.id
            WHERE user_id = $1;
        `
        const results = await pool.query(sql, [userId])
        res.status(200).json({ organizations: results.rows })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

app.delete('/userCompetitors/:id', async (req, res) => {
    const orgId = req.params.id
    const userId = req.auth.userId
    if (userId === undefined) {
        return res.status(401).json({ error: 'Invalid Token: user id missing' })
    }
    if (orgId === undefined || isNaN(orgId)) {
        return res.sendStatus(400).json({ error: 'Invalid or missing org id ' })
    }
    try {
        const sql = `
            DELETE FROM sift_db.user_competitors
            WHERE user_id = $1 AND org_id = $2;
        `
        const values = [userId, orgId]
        await pool.query(sql, values)
        res.status(200).json({ message: 'Successfully removed competitor' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

app.listen(port, () => {
    console.log(`Serving running on port ${port}`)
})