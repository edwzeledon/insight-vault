import express from 'express';
import pg from 'pg';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import gplay from "google-play-scraper";

dotenv.config()

const port = 3000
const app = express()

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

app.listen(port, () => {
    console.log(`Serving running on port ${port}`)
})