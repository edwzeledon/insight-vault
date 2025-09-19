import dotenv from 'dotenv';
dotenv.config()
import fetch from 'node-fetch';
import filteredArticles from '../classfication/classifySource.js'
import { classifyHeadline } from '../hf/hfService.js';
import pool from '../../db/pool.js'

const newsurl = 'https://newsapi.org/v2/everything'

export const handleNewsFetch = async (query) => {
    //get the latest news date
    const date = getLatestNewsDate()

    //get all news with that query
    let articles = getArticles(query, date)

    //filter out irrelevent news
    articles = filteredArticles(articles)

    //classify articles 
    
    //save articles w their data to the db, display
}

const getLatestNewsDate = async () => {
    let date = null
    try {
        const results = await pool.query('')
        date = results.rows[0].date
    } catch (err) {
        throw new Error('Internal Server Error')
    }
    return date
}
const getArticles = async (query, date) => {
    const params = {
        q: query, 
        apiKey: process.env.NEWS_API_TOKEN, 
        from: date, 
        language: 'en' 
    }
    const queryParams = new URLSearchParams(params).toString()
    const response = await fetch(`${newsurl}?${queryParams}`)
    if (!response.ok) throw new Error("Error in fetching from news api")
    const results = await response.json()
    return results.articles
}

export const handleNewsClassification = async (articles) => {
    articles.map(classifyHeadline)
}