import express from 'express';
import pg from 'pg';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv'

dotenv.config()

const port = 3000
const app = express()

const url = 'https://api-inference.huggingface.co/models'

app.get('/api/summarize', async (req, res) => {
    try {
        const text = 'Broccoli is a vital addition to a balanced diet due to its rich nutritional profile and numerous health benefits. This cruciferous vegetable is packed with essential vitamins, minerals, and antioxidants that contribute to overall well-being. Regular consumption of broccoli has been linked to improved digestion, enhanced immune function, and a reduced risk of chronic diseases such as heart disease and certain cancers. Additionally, its high fiber content promotes satiety, making it an excellent choice for those looking to maintain a healthy weight. Incorporating broccoli into meals not only boosts nutritional intake but also supports long-term health.'
        const response = await fetch (`${url}/facebook/bart-large-cnn`, {
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
        console.log(results.summary_text) // summary is returned in summary_text
    } catch (err) {
        console.log(err)
        res.json({ error: 'Error fetching data from summarize model'})
    }
})

app.get('/api/getsentiment', async (req, res) => {
    try {
        const text = 'Spotify has been so awesome lately, i love these new features!'
        const response = await fetch(`${url}/cardiffnlp/twitter-roberta-base-sentiment`, {
            method: 'POST', 
            headers: {
                Authorization: `Bearer ${process.env.HF_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: text })
        })
        const results = await response.json()
        console.log(results) 
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
    } catch (err){
        console.log(err)
        res.json({ error: 'Error fetching data from sentiment model'})
    }
})

app.get('/api/identify', async(req, res) => {
    try {
        const text = 'Spotify has been so awesome lately, i love their new features!'
        const response = await fetch(`${url}/Jean-Baptiste/roberta-large-ner-english`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.HF_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: text })
        })
        const results = await response.json()
        console.log(results)
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
        console.log(err)
        res.json({ error: 'Error fetching data from topic extract model'})
    }
})

app.listen (port, ()=> {
    console.log(`Serving running on port ${port}`)
})