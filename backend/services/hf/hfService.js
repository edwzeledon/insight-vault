import dotenv from 'dotenv';
dotenv.config({ path: '../../.env'})
import fetch from 'node-fetch';
import LABELS from '../../config/labels.js'

const hfurl = 'https://api-inference.huggingface.co/models'
const sentimentMap = {
    'LABEL_0': 0, // negative
    'LABEL_1': 1, // neutral
    'LABEL_2': 2 // positive
}

export const classifyHeadline = async (text) => {
    const response = await fetch(`${hfurl}/facebook/bart-large-mnli`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: text,
                parameters: { candidate_labels: LABELS }
            })
        }
    )
    if (response.ok){
        const results = await response.json()
        return results.labels[0] 
    }
    return null;
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

export const summarize = async(text, minLength, maxLength) => {
    const response = await fetch(`${hfurl}/facebook/bart-large-cnn`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: text,
            parameters: {
                min_length: minLength,
                max_length: maxLength
            }
        })
    })
    const results = await response.json()
    return results[0].summary_text
}