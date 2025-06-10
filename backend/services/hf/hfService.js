import dotenv from 'dotenv';
dotenv.config({ path: '../../.env'})
import fetch from 'node-fetch';
import LABELS from '../../config/labels.js'

const hfurl = 'https://api-inference.huggingface.co/models'

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
            }),
        }
    )
    if (response.ok){
        const results = await response.json()
        return results.labels[0]
    }
    return 'undefined'
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

export const summarize = async(text) => {
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