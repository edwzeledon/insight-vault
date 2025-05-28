import express from 'express';
import pg from 'pg';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import gplay from "google-play-scraper";
import { expressjwt } from 'express-jwt';

const port = 3000
const app = express()

dotenv.config()
app.use(expressjwt({ secret: process.env.ACCESS_TOKEN_SECRET, algorithms: ['HS256'] }))
app.use(express.json())

const pool = new pg.Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: `${process.env.DB_PASSWORD}`,
    database: 'Personal Projects'
})


const url = 'https://api-inference.huggingface.co/models'

async function summarize(text) {
    try {
        const response = await fetch(`${url}/facebook/bart-large-cnn`, {
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
    } catch (err) {
        throw err
    }
}
async function getSentiment(text) {
    try {
        const response = await fetch(`${url}/cardiffnlp/twitter-roberta-base-sentiment`, {
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

    } catch (err) {
        console.log(err)
        throw err
    }
}
async function extractTextData(text) {
    try {
        const response = await fetch(`${url}/Jean-Baptiste/roberta-large-ner-english`, {
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
    } catch (err) {
        throw err
    }
}

app.post('/addcompetitor', async (req, res) => {
    try {
        const org = req.body.org
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
                INSERT INTO sift_db.competitors (name, app_id)
                VALUES ($1, $2);
            `
            const values = [org, appId]
            await pool.query(insertOrg, values)
        } else {
            appId = dupOrgResults.rows[0].app_id
        }

        //connect user id to org
        
        const addRelation = `
            INSERT INTO sift_db.user_competitors (user_id, org_id)
            VALUES ($1, $2);
        `
        const values = [id, appId]
        await pool.query(addRelation, values)
        res.status(200).json({ message: 'succesfully added new competitor' })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: 'Internal server error' })
    }
})

app.listen(port, () => {
    console.log(`Serving running on port ${port}`)
})