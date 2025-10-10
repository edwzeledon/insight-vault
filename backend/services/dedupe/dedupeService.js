import crypto from 'crypto'
import { DOMAIN_PREFERENCE } from '../../config/newsSources.js'

// Canonicalize URL for consistent comparison
const canonicalizeUrl = (url) => {
    if (!url) return null
    try {
        const parsed = new URL(url)
        // lowercase host, remove www
        let host = parsed.hostname.toLowerCase().replace(/^www\./, '')
        // remove tracking params
        const cleanParams = new URLSearchParams()
        for (const [key, value] of parsed.searchParams) {
            if (!key.match(/^(utm_|fbclid|ref|source|campaign)/i)) {
                cleanParams.set(key, value)
            }
        }
        // rebuild without fragment
        const path = parsed.pathname
        const query = cleanParams.toString()
        return `${host}${path}${query ? '?' + query : ''}`
    } catch (e) {
        return url.toLowerCase()
    }
}

// Normalize title for general purposes (kept for hashing compatibility)
const normalizeTitle = (title, description = '') => {
    if (!title) return ''
    let text = `${title} ${description || ''}`.toLowerCase()
    
    // Remove common outlet suffixes like "– The Verge", "| CNN", etc.
    text = text.split(/\s*[–—|]\s*/)[0]
    
    // Remove punctuation, quotes, emojis
    text = text.replace(/[^\w\s]/g, ' ')
    
    // Collapse whitespace
    text = text.replace(/\s+/g, ' ').trim()
    
    return text
}

// Stopwords and simple stemming for clustering
const STOPWORDS = new Set(['the','a','an','to','of','for','and','or','on','in','at','is','are','was','were','be','been','being','with','by','from','it','its','this','that','these','those','here','how','today','finally','s'])

const stem = (token) => {
    if (token.length <= 3) return token
    if (token.endsWith('ing')) return token.slice(0, -3)
    if (token.endsWith('ed')) return token.slice(0, -2)
    if (token.endsWith('es')) return token.slice(0, -2)
    if (token.endsWith('s')) return token.slice(0, -1)
    return token
}

// Title-only normalization for clustering with light synonym mapping
const normalizeHeadline = (title) => {
    if (!title) return ''
    let text = title.toLowerCase()
    // Remove outlet suffixes like "– The Verge" | "| CNN"
    text = text.split(/\s*[–—|]\s*/)[0]
    // Normalize common synonyms/variants
    text = text.replace(/hi[-\s]?fi/g, 'hifi')
    text = text.replace(/music/g, 'audio') // treat music≈audio for clustering
    // Remove punctuation/quotes
    text = text.replace(/[^\w\s]/g, ' ')
    // Collapse whitespace
    text = text.replace(/\s+/g, ' ').trim()
    return text
}

// Tokenize for clustering: remove stopwords and apply stemming
const tokenizeForClustering = (text) => {
    return text
        .toLowerCase()
        .split(/\s+/)
        .map(t => t.trim())
        .filter(t => t.length > 2 && !STOPWORDS.has(t))
        .map(stem)
}

// Compute Jaccard similarity between two token sets
const jaccardSimilarity = (tokens1, tokens2) => {
    const set1 = new Set(tokens1)
    const set2 = new Set(tokens2)
    
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    if (union.size === 0) return 0
    return intersection.size / union.size
}

// Compute content hash for database deduplication
export const computeContentHash = (title, description) => {
    const normalized = normalizeTitle(title, description)
    return crypto.createHash('sha256').update(normalized).digest('hex')
}

// Extract domain from URL
const extractDomain = (url) => {
    if (!url) return null
    try {
        return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
    } catch (e) {
        return null
    }
}

// Get domain preference score (higher is better)
const getDomainScore = (url) => {
    const domain = extractDomain(url)
    if (!domain) return -1
    const index = DOMAIN_PREFERENCE.indexOf(domain)
    return index >= 0 ? index : -1
}

// Compute a simple relevance score combining domain preference, content length, and recency
const computeRelevanceScore = (article, nowMs) => {
    const domainIdx = getDomainScore(article.url)
    const domainWeight = domainIdx >= 0 ? (DOMAIN_PREFERENCE.length - domainIdx) : 0 // higher is better

    const len = (article.description || '').length
    const lengthWeight = Math.min(1, len / 500) // 0..1

    const published = article.publishedAt ? new Date(article.publishedAt).getTime() : 0
    const ageHours = published ? Math.max(0, (nowMs - published) / (1000 * 60 * 60)) : 9999
    const recencyWeight = Math.max(0, 1 - ageHours / 168) // 1 when fresh, 0 after 7 days

    // Weighted sum emphasizing domain authority
    return domainWeight * 10 + lengthWeight * 2 + recencyWeight
}

// Select the best article from duplicates based on relevance score
const selectBestArticle = (articles, nowMs) => {
    if (articles.length === 1) return { best: articles[0], scores: [computeRelevanceScore(articles[0], nowMs)] }
    const scored = articles.map(a => ({ a, s: computeRelevanceScore(a, nowMs) }))
    scored.sort((x, y) => y.s - x.s)
    return { best: scored[0].a, scores: scored.map(x => x.s) }
}

// Main deduplication function with Jaccard similarity
export const dedupeArticles = (articles, jaccardThreshold = 0.75) => {
    if (!articles || articles.length === 0) return []
    
    const seenUrls = new Set()
    const clusters = [] // Each cluster contains similar articles
    
    for (const article of articles) {
        // Skip if URL already seen
        const canonUrl = canonicalizeUrl(article.url)
        if (canonUrl && seenUrls.has(canonUrl)) {
            continue
        }
        if (canonUrl) seenUrls.add(canonUrl)
        
    // Normalize and tokenize title (title-only for clustering)
    const normalized = normalizeHeadline(article.title)
    const tokens = tokenizeForClustering(normalized)
        
        if (tokens.length === 0) continue
        
        // Check similarity against existing clusters
        let foundCluster = null
        for (const cluster of clusters) {
            const clusterTokens = tokenizeForClustering(normalizeHeadline(cluster[0].title))
            const similarity = jaccardSimilarity(tokens, clusterTokens)
            
            if (similarity >= jaccardThreshold) {
                foundCluster = cluster
                break
            }
        }
        
        if (foundCluster) {
            foundCluster.push(article)
        } else {
            clusters.push([article])
        }
    }
    
    // Select best article from each cluster
    const nowMs = Date.now()
    return clusters.map(group => selectBestArticle(group, nowMs).best)
}

export default {
    dedupeArticles,
    computeContentHash,
    canonicalizeUrl,
    normalizeTitle,
    jaccardSimilarity
}

// Cluster articles and annotate with cluster_id, is_representative, and relevance_score
export const clusterArticles = (articles, jaccardThreshold) => {
    if (!articles || articles.length === 0) return []

    const seenUrls = new Set()
    const clusters = []

    for (const article of articles) {
        const canonUrl = canonicalizeUrl(article.url)
        if (canonUrl && seenUrls.has(canonUrl)) continue
        if (canonUrl) seenUrls.add(canonUrl)

        const normalized = normalizeHeadline(article.title)
        const tokens = tokenizeForClustering(normalized)
        if (tokens.length === 0) continue

        let foundCluster = null
        for (const c of clusters) {
            const rep = c.rep
            const repTokens = tokenizeForClustering(normalizeHeadline(rep.title))
            const sim = jaccardSimilarity(tokens, repTokens)
            if (sim >= jaccardThreshold) { foundCluster = c; break }
        }

        if (foundCluster) {
            foundCluster.items.push(article)
        } else {
            clusters.push({ items: [article], rep: article })
        }
    }

    const nowMs = Date.now()
    const annotated = []
    for (const c of clusters) {
        // pick best representative
        const { best } = selectBestArticle(c.items, nowMs)
        const cluster_id = computeContentHash(best.title, best.description)
        for (const item of c.items) {
            const relevance_score = computeRelevanceScore(item, nowMs)
            annotated.push({
                ...item,
                cluster_id,
                is_representative: item === best,
                relevance_score
            })
        }
    }

    return annotated
}

export { computeRelevanceScore }
