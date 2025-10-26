import dotenv from 'dotenv'
dotenv.config()
import fetch from 'node-fetch'
import pool from '../../db/pool.js'
import { getSentiment } from '../wink/winkService.js'
import { TRUSTED_DOMAINS } from '../../config/newsSources.js'
import { computeContentHash, clusterArticles } from '../dedupe/dedupeService.js'

const newsurl = 'https://newsapi.org/v2/everything'

const fetchHistoricalNews = async (orgName, fromDate, toDate) => {
  try {
    const params = {
      q: orgName,
      apiKey: process.env.NEWS_API_TOKEN,
      from: fromDate,
      to: toDate,
      language: 'en',
      domains: TRUSTED_DOMAINS.join(','),
      sortBy: 'publishedAt'
    }
    
    const queryParams = new URLSearchParams(params).toString()
    const response = await fetch(`${newsurl}?${queryParams}`)
    
    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`)
    }
    
    const results = await response.json()
    return results.articles || []
  } catch (error) {
    console.error(`Error fetching historical news for ${orgName}:`, error)
    throw new Error(`Failed to fetch historical news: ${error.message}`)
  }
}

const filterArticlesByOrgName = (articles, orgName) => {
  return articles.filter(article => {
    const title = (article.title || '').toLowerCase()
    const org = orgName.toLowerCase()
    return title.includes(org)
  })
}

const getArticlesSentiment = async (articles) => {
  return Promise.all(articles.map(async (article) => {
    const text = (article.title + " " + article.description).toLowerCase()
    const sentiment = await getSentiment(text)
    return { ...article, sentiment }
  }))
}

const saveArticles = async (articles, orgId) => {
  let savedCount = 0
  let skippedCount = 0
  
  await Promise.all(articles.map(async (article) => {
    const { publishedAt, sentiment, title, description, cluster_id, is_representative, relevance_score, url, source } = article

    // Compute content hash for cross-run deduplication
    const contentHash = computeContentHash(`${title} ${url || ''}`, description)

    // Check if article already exists
    const checkSql = `
      SELECT id FROM sift_db.media 
      WHERE org_id=$1 AND type_id=$2 AND content_hash=$3
      LIMIT 1;
    `
    const existing = await pool.query(checkSql, [orgId, 1, contentHash])

    // Skip if already inserted
    if (existing.rowCount > 0) {
      skippedCount++
      return
    }

    const sql = `
      INSERT INTO sift_db.media 
        (type_id, 
        org_id, 
        published_at, 
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
    `
    const values = [1, orgId, publishedAt, title, sentiment, contentHash, cluster_id || null, is_representative || false, relevance_score || null, description, source.name, url]
    await pool.query(sql, values)
    savedCount++
  }))
  
  console.log(`Saved ${savedCount} new articles, skipped ${skippedCount} duplicates for org ${orgId}`)
}

export const fetchAndSaveHistoricalNews = async (orgId, orgName) => {
  if (!orgName) {
    console.warn(`No organization name provided for org ${orgId}, skipping historical news fetch`)
    return
  }

  try {
    // Calculate date range (1 month ago to today)
    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setMonth(fromDate.getMonth() - 1)

    const from = fromDate.toISOString().split('T')[0] // YYYY-MM-DD
    const to = toDate.toISOString().split('T')[0] // YYYY-MM-DD

    // Fetch historical news
    let articles = await fetchHistoricalNews(orgName, from, to)

    // Filter articles that mention the org name in the title
    articles = filterArticlesByOrgName(articles, orgName)

    if (articles.length === 0) return

    // Cluster articles
    articles = clusterArticles(articles, 0.40)

    // Add sentiment for each article
    articles = await getArticlesSentiment(articles)

    // Save to database
    await saveArticles(articles, orgId)
  } catch (error) {
    console.error(`Error in fetchAndSaveHistoricalNews for org ${orgId}:`, error)
    // Don't throw - we don't want to fail the competitor addition if historical news fetch fails
  }
}
