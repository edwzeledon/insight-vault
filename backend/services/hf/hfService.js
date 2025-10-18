import dotenv from 'dotenv';
dotenv.config({ path: '../../.env'})
import fetch from 'node-fetch';

const hfurl = 'https://api-inference.huggingface.co/models'

const sentimentMap = {
    'negative': 0, // negative
    'neutral': 1, // neutral
    'positive': 2 // positive
}


export const getSentiment = async (text) => {
    const response = await fetch(`${hfurl}/cardiffnlp/twitter-roberta-base-sentiment`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: text })
    })
    if (!response.ok) return null
    const results = await response.json()
    return sentimentMap[results[0][0].label]
}
