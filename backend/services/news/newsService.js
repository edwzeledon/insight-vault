import dotenv, { config } from 'dotenv';
dotenv.config()
import fetch from 'node-fetch';
import { filteredArticles } from '../classfication/classifySource.js'
import { classifyHeadline, getSentiment, summarize } from '../hf/hfService.js';
import pool from '../../db/pool.js'

const newsurl = 'https://newsapi.org/v2/everything'
const minLength = 5
const maxLength = 12

export const handleLatestNewsFetch = async ({ id }) => {
    //get the latest news date given org id
    const { date, org } = await getOrgLatestNewsDate(id)

    //get all news with the query, and after the found date
    let articles = await getArticles(org, date)

    //filter out irrelevent news
    articles = filteredArticles(articles)

    //add labels for each article 
    articles = await getArticleLabels(articles)

    //add sentiment for each article
    articles = await getArticlesSentiment(articles)

    //add headline for each article
    articles = await getArticlesHeadline(articles)

    //save articles w their data to the db for display
    saveArticles(articles, id);
}

const getOrgLatestNewsDate = async (id) => {
    try {
        const sql = `
            SELECT published_at, name
            FROM sift_db.media
            LEFT JOIN sift_db.organizations
                ON media.org_id = organizations.id
            WHERE org_id=$1
            ORDER BY published_at DESC
            LIMIT 1;
        `
        const results = await pool.query(sql, [id])
        if (!results.rowCount) {
            const orgSql = `SELECT name FROM sift_db.organizations WHERE id=$1;`
            const orgResults = await pool.query(orgSql, [id])
            //get the current date, get data from a 6 months ago
            const date = new Date()
            date.setMonth(date.getMonth() - 6)
            return { date: date.toISOString().split('T')[0], org: orgResults.rows[0].name }
        }
        // else, we have a latest date, and the org name
        return { data: results.rows[0].date, org: results.rows[0].name }
    } catch (err) {
        throw new Error('Internal Server Error')
    }
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

const getArticleLabels = async (articles) => {
    return Promise.all(articles.map((article) => {
        const text = (article.title + " " + article.description).toLowerCase()
        const label = classifyHeadline(text)
        return { ...article, label }
    }))
}

const getArticlesSentiment = async (articles) => {
    return Promise.all(articles.map(async (article) => {
        const text = (article.title + " " + article.description).toLowerCase()
        const sentiment = await getSentiment(text)
        return { ...article, sentiment }
    }))
}

const getArticlesHeadline = async (articles) => {
    return Promise.all(articles.map(async (article) => {
        const text = (article.title + " " + article.description).toLowerCase()
        const headline = await summarize(text, minLength, maxLength)
        return { ...article, headline }
    }))
}

const saveArticles = async (articles, id) => {
    articles.forEach(async (article) => {
        const { publishedAt, label, headline, sentiment } = article

        const sql = `
            INSERT INTO sift_db.media (type_id, org_id, published_at, label, headline, sentiment)
            VALUES ($1, $2, $3, $4, $5, $6);
        `
        const values = [1, id, publishedAt, label, headline, sentiment]
        await pool.query(sql, values)
    })
}