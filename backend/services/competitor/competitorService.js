import pool from '../../db/pool.js'
import { fetchAndSaveHistoricalData } from '../stock/historicalStockService.js'
import { fetchAndSaveHistoricalNews } from '../news/historicalNewsService.js'

/**
 * Add a new competitor organization for a user
 * Creates org if it doesn't exist, fetches historical data, and links to user
 */
export const handleAddCompetitor = async (orgName, userId) => {
    if (!orgName || orgName.length === 0) {
        throw new Error('Please fill in required field')
    }
    if (!userId || userId.length === 0) {
        throw new Error('Invalid Token: user id missing')
    }

    // Check if organization already exists
    const checkOrgDup = `
        SELECT * 
        FROM sift_db.organizations
        WHERE name ILIKE $1;
    `
    const dupOrgResults = await pool.query(checkOrgDup, [orgName])

    let orgId
    if (!dupOrgResults.rowCount) {
        // Insert new org, get their company symbol
        const orgResults = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${orgName}`)
        const orgData = await orgResults.json()
        const orgSymbol = orgData.quotes.length ? orgData.quotes[0].symbol : null
    
        const insertOrg = `
            INSERT INTO sift_db.organizations (name, symbol)
            VALUES ($1, $2)
            RETURNING *;
        `
        const values = [orgName, orgSymbol]
        const results = await pool.query(insertOrg, values)
        orgId = results.rows[0].id
        
        // Fetch historical stock data asynchronously (don't wait for it)
        if (orgSymbol) {
            fetchAndSaveHistoricalData(orgId, orgSymbol).catch(err => {
                console.error(`Failed to fetch historical stock data for ${orgSymbol}:`, err)
            })
        }
        
        // Fetch historical news data asynchronously (don't wait for it)
        fetchAndSaveHistoricalNews(orgId, orgName).catch(err => {
            console.error(`Failed to fetch historical news for ${orgName}:`, err)
        })
    } else {
        orgId = dupOrgResults.rows[0].id
    }

    // Connect user id to org
    const addRelation = `
        INSERT INTO sift_db.user_competitors (user_id, org_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, org_id) DO NOTHING;
    `
    const values = [userId, orgId]
    await pool.query(addRelation, values)
    
    return { orgId, message: 'Successfully added new competitor' }
}

/**
 * Get all competitors for a user
 */
export const handleGetUserCompetitors = async (userId) => {
    if (!userId) {
        throw new Error('Invalid Token: user id missing')
    }

    const sql = `
        SELECT name, org_id
        FROM sift_db.user_competitors
        LEFT JOIN sift_db.organizations
            ON user_competitors.org_id = organizations.id
        WHERE user_id = $1;
    `
    const results = await pool.query(sql, [userId])
    
    return results.rows
}

/**
 * Remove a competitor from a user's list
 */
export const handleRemoveCompetitor = async (orgId, userId) => {
    if (!userId) {
        throw new Error('Invalid Token: user id missing')
    }
    if (!orgId || isNaN(orgId)) {
        throw new Error('Invalid or missing org id')
    }

    const sql = `
        DELETE FROM sift_db.user_competitors
        WHERE user_id = $1 AND org_id = $2;
    `
    const values = [userId, orgId]
    await pool.query(sql, values)
    
    return { message: 'Successfully removed competitor' }
}
