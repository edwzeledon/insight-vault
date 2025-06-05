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

const hfurl = 'https://api-inference.huggingface.co/models'
const newsurl = 'https://newsapi.org/v2/top-headlines'

async function summarize(text) {
    const response = await fetch(`${hfurl}/facebook/bart-large-cnn`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: text,
            parameters: {
                min_length: 20,
                max_length: 100
            }
        })
    })
    const results = await response.json()
    return results[0].summary_text
}
async function getSentiment(text) {
    const response = await fetch(`${hfurl}/cardiffnlp/twitter-roberta-base-sentiment`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: text })
    })
    return await response.json()
    /* 
       output: 
       [
          [
               { label: 'LABEL_2', score: 0.9931817650794983 }, // Positive
               { label: 'LABEL_1', score: 0.004856493324041367 }, // Nuetral
               { label: 'LABEL_0', score: 0.0019616682548075914 }' // Negative
           ]
       ]
   */
}
async function extractTextData(text) {
    const response = await fetch(`${hfurl}/Jean-Baptiste/roberta-large-ner-english`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: text })
    })
    return await response.json()
    /* 
       output: 
       [
           {
               entity_group: 'ORG',
               score: 0.9911782,
               word: ' Spotify',
               start: 0,
               end: 7
           }
       ]     
   */
}
async function classifyTextData(data) {
    /*
        SAMPLE INPUT:
        {
            inputs: "Hi, I recently bought a device from your company but it is not working as advertised and I would like to get reimbursed!",
            parameters: { candidate_labels: ["refund", "legal", "faq"] 
        }
    */
    const response = await fetch(`${hfurl}/facebook/bart-large-mnli`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    )
    const result = await response.json()
    return result
    /*
        SAMPLE OUTPUT:
        {
            "sequence": "Hi, I recently bought a device from your company but it is not working as advertised and I would like to get reimbursed!",
            "labels": [
                "refund",
             "faq",
                "legal"
            ],
            "scores": [
                0.8777873516082764,
                0.10522671788930893,
                0.016985908150672913
            ]
        }
    */
}
async function getTopHeadlines(query) {
    const params = new URLSearchParams({ q: query, apiKey: process.env.NEWS_API_TOKEN }).toString()
    const response = await fetch(`${newsurl}?${params}`)
    return await response.json()
}

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