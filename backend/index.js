import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { expressjwt } from 'express-jwt';
import authRoutes from './routes/authRoutes.js'
import newsRoutes from './routes/newsRoutes.js'
import stockRoutes from './routes/stockRoutes.js'
import overviewRoutes from './routes/overviewRoutes.js'
import sentimentRoutes from './routes/sentimentRoutes.js'
import competitorRoutes from './routes/competitorRoutes.js'
import { startNewsScheduler } from './services/jobs/newsJob.js'
import { startStockScheduler } from './services/jobs/stockJob.js'

const port = 3000
const app = express()

dotenv.config()
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(expressjwt({ secret: process.env.ACCESS_TOKEN_SECRET, algorithms: ['HS256'] }).unless({
    path: [/^\/auth\/.*/]
}))
app.use(cookieParser())

//ROUTES
app.use('/auth', authRoutes)
app.use('/news', newsRoutes)
app.use('/stocks', stockRoutes)
app.use('/overview', overviewRoutes)
app.use('/sentiment', sentimentRoutes)
app.use('/competitors', competitorRoutes)

app.listen(port, () => {
    console.log(`Serving running on port ${port}`)
})

// Start background jobs
startNewsScheduler()
startStockScheduler()