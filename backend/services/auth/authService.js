import dotenv from 'dotenv';
dotenv.config({ path: '../../.env'})

import pool from "../../db/pool.js";
import bcrypt from "bcryptjs";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Custom error class for user-facing errors
class UserError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UserError';
    }
}

export const handleRegister = async ({ email, password, fname }) => {
    if (email === undefined || email.length == 0
        || password === undefined || password.length == 0
        || fname === undefined || fname.length == 0
    ) {
        throw new UserError('Please fill in all required fields')
    }

    if (await isDupEmail(email)) {
        throw new UserError('User with that email already exists')
    }

    try {
        const hashedPw = await bcrypt.hash(password, 10)
        const sql = `
            INSERT INTO sift_db.users (fname, email, password)
            VALUES ($1, $2, $3)
            RETURNING id;
        `
        const values = [fname, email, hashedPw]
        const results = await pool.query(sql, values)

        const id = results.rows[0].id
        const accessToken = generateAccessToken(email, id)
        const refreshToken = generateRefreshToken(email, id)

        const addtoken = `
            UPDATE sift_db.users
            SET refresh_tokens = array_append(refresh_tokens, $1)
            WHERE id = $2;
        `
        const addTokenVals = [hashToken(refreshToken), id]
        await pool.query(addtoken, addTokenVals)
        return { accessToken, refreshToken }
    } catch (err) {
        if (err instanceof UserError) throw err;
        throw new Error('Internal Server Error')
    }
}

export const handleLogin = async ({ email, password }) => {
    try {
        if (email === undefined || email.length == 0
            || password === undefined || password.length == 0
        ) {
            throw new UserError('Please fill in all required fields')
        }

        const sql = `
            SELECT * 
            FROM sift_db.users
            WHERE email = $1;
        `
        const values = [email]
        const results = await pool.query(sql, values)

        if (!results.rowCount) {
            throw new UserError('User with this email does not exist')
        }

        const hashedPw = results.rows[0].password
        const isPwMatch = await bcrypt.compare(password, hashedPw)

        if (!isPwMatch) {
            throw new UserError('Invalid Password')
        }

        const userId = results.rows[0].id
        const accessToken = generateAccessToken(email, userId)
        const refreshToken = generateRefreshToken(email, userId)

        const addtoken = `
            UPDATE sift_db.users
            SET refresh_tokens = array_append(refresh_tokens, $1)
            WHERE id = $2;
        `
        const addTokenVals = [hashToken(refreshToken), userId]
        await pool.query(addtoken, addTokenVals)
        return { accessToken, refreshToken }
    } catch (error) {
        if (error instanceof UserError) throw error;
        throw new Error("Internal Server Error")
    }
}

export const handleLogout = async ({ refreshToken }) => {
    if (refreshToken === undefined) {
        throw new Error('Forbidden')
    }
    let decoded
    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    } catch (err) {
        throw new Error('Invalid or expired token')
    }
    let results
    try {
        const sql = `
            UPDATE sift_db.users
            SET refresh_tokens = array_remove(refresh_tokens, $1)
            WHERE id = $2
            RETURNING id;
        `
        const values = [hashToken(refreshToken), decoded.userId]
        results = await pool.query(sql, values)
    } catch (err) {
        console.log(err)
        throw new Error('Internal server error')
    }
    if (!results.rowCount) {
        throw new Error('Token not found or already removed')
    }
    return { message: 'Logout successful' }
}

export const handleRefresh = async ({ refreshToken }) => {
    if (refreshToken === undefined || refreshToken.length == 0) {
        throw new Error('Forbidden')
    }
    let decoded
    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    } catch (err) {
        throw new Error('Invalid or expired token')
    }
    try {
        const sql = `
            SELECT refresh_tokens
            FROM sift_db.users
            WHERE id = $1 AND $2 = ANY(refresh_tokens); 
        `
        const values = [decoded.userId, hashToken(refreshToken)]
        const results = await pool.query(sql, values)
        if (!results.rowCount) {
            throw new Error('Token not found or already removed')
        }
        const acctoken = generateAccessToken(decoded.email, decoded.userId)
        return { message: 'Success', accessToken: acctoken }
    } catch (err) {
        throw new Error('Internal server error', err)
    }
}

const isDupEmail = async (email) => {
    try {
        const sql = `
            SELECT *
            FROM sift_db.users
            WHERE email = $1;
        `
        const results = await pool.query(sql, [email])
        return results.rowCount
    } catch (err) {
        console.error(err)
        throw new Error('Internal Server Error')
    }
}

const generateAccessToken = (email, id) => {
    return jwt.sign({ email: email, userId: id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

const generateRefreshToken = (email, id) => {
    return jwt.sign({ email: email, userId: id }, process.env.REFRESH_TOKEN_SECRET)
}

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}
