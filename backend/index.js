import express from 'express';
import pg from 'pg';
import cors from 'cors'

const port = 3000
const app = express()

app.listen (port, ()=> {
    console.log(`Serving running on port ${port}`)
})