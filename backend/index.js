import express from 'express';
import pg from 'pg';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv'

dotenv.config()

const port = 3000
const app = express()

app.listen (port, ()=> {
    console.log(`Serving running on port ${port}`)
})