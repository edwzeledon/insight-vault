import { handleLatestNewsFetch, handleLatestNewsGet, handleNewsCountGet } from "../services/news/newsService.js";

const fetchLatestNews = async (req, res) => {
    try {
        const id = req.params.id
        if (id === undefined || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid or missing org id ' })
        }
        await handleLatestNewsFetch({ id })
        res.status(200).json({ message: 'Successfully fetched latest news' })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

const getLatestNews = async (req, res) => {
    try {
        const id = req.params.id
        if (id === undefined || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid or missing org id ' })
        }
        // Fetch the latest news for the organization
        const news = await handleLatestNewsGet(id)
        res.status(200).json(news)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

const getNewsCount = async (req, res) => {
    try {
        const id = req.params.id
        const days = req.query.days || 7
        if (id === undefined || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid or missing org id' })
        }
        const count = await handleNewsCountGet(id, days)
        res.status(200).json({ count, days: parseInt(days) })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

export { fetchLatestNews, getLatestNews, getNewsCount };
