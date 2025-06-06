import dotenv from 'dotenv';
dotenv.config()

const newsurl = 'https://newsapi.org/v2/top-headlines'

async function getTopHeadlines(query) {
    const params = new URLSearchParams({ q: query, apiKey: process.env.NEWS_API_TOKEN }).toString()
    const response = await fetch(`${newsurl}?${params}`)
    return await response.json()
}