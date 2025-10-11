import dotenv, { config } from 'dotenv';
dotenv.config()
import fetch from 'node-fetch';
import { classifyHeadline, getSentiment } from '../hf/hfService.js';
import pool from '../../db/pool.js'
import { TRUSTED_DOMAINS } from '../../config/newsSources.js'
import { computeContentHash, clusterArticles } from '../dedupe/dedupeService.js'

const newsurl = 'https://newsapi.org/v2/everything'

export const handleLatestNewsGet = async (id) => {
    try {
        const sql = `
            SELECT id, published_at, label, headline, sentiment, cluster_id, is_representative, relevance_score, description, source, url
            FROM sift_db.media
            WHERE org_id=$1
            ORDER BY published_at DESC
            LIMIT 6;
        `
        const results = await pool.query(sql, [id])
        return results.rows
    } catch (err) {
        throw new Error('Internal Server Error')
    }
}

export const handleLatestNewsFetch = async ({ id }) => {
    //get the latest news date given org id
    const { date, org } = await getOrgLatestNewsDate(id)

    //get all news with the query, and after the found date (from trusted sources only)
    let articles = await getArticles(org, date)

    //filter articles that mention the org name in the title
    articles = filterArticlesByOrgName(articles, org)

    //cluster articles (store-all, display-one later using is_representative)
    articles = clusterArticles(articles, 0.40)

    //add labels for each article 
    articles = await getArticleLabels(articles)

    //add sentiment for each article
    articles = await getArticlesSentiment(articles)

    //save articles w their data to the db for display
    await saveArticles(articles, id);
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
            //get the current date, get data from a 1 month ago
            const date = new Date()
            date.setMonth(date.getMonth() - 1)
            return { date: date.toISOString().split('T')[0], org: orgResults.rows[0].name }
        }
        // else, we have a latest date, and the org name
        return { date: results.rows[0].published_at, org: results.rows[0].name }
    } catch (err) {
        throw new Error('Internal Server Error')
    }
}

const getArticles = async (query, date) => {
    const params = {
        q: query,
        apiKey: process.env.NEWS_API_TOKEN,
        from: date,
        language: 'en',
        domains: TRUSTED_DOMAINS.join(',') // Only fetch from trusted sources
    }
    const queryParams = new URLSearchParams(params).toString()
    const response = await fetch(`${newsurl}?${queryParams}`)
    if (!response.ok) throw new Error("Error in fetching from news api")
    const results = await response.json()
    return results.articles || []
}

const filterArticlesByOrgName = (articles, orgName) => {
    return articles.filter(article => {
        const title = (article.title || '').toLowerCase()
        const org = orgName.toLowerCase()
        return title.includes(org)
    })
}

const getArticleLabels = async (articles) => {
    return Promise.all(articles.map(async (article) => {
        const text = (article.title + " " + article.description).toLowerCase()
        const label = await classifyHeadline(text)
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

const saveArticles = async (articles, id) => {
    // Use Promise.all to properly handle async operations
    await Promise.all(articles.map(async (article) => {
        const { publishedAt, label, sentiment, title, description, cluster_id, is_representative, relevance_score, url, source } = article

        // Compute content hash for cross-run deduplication (include URL to allow multi-outlet storage)
        const contentHash = computeContentHash(`${title} ${url || ''}`, description)

        // Check if article already exists
        const checkSql = `
            SELECT id FROM sift_db.media 
            WHERE org_id=$1 AND type_id=$2 AND content_hash=$3
            LIMIT 1;
        `
        const existing = await pool.query(checkSql, [id, 1, contentHash])

        // Skip if already inserted in a previous run
        if (existing.rowCount > 0) return

        const sql = `
            INSERT INTO sift_db.media 
                (type_id, 
                org_id, 
                published_at, 
                label, 
                headline, 
                sentiment, 
                content_hash, 
                cluster_id, 
                is_representative, 
                relevance_score, 
                description,
                source,
                url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
        `
        const values = [1, id, publishedAt, label, title, sentiment, contentHash, cluster_id || null, is_representative || false, relevance_score || null, description, source.name, url]
        await pool.query(sql, values)
    }))
}