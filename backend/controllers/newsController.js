import { handleLatestNewsFetch } from "../services/news/newsService.js";

const fetchLatestNews = async (req, res) => {
    try {
        await handleLatestNewsFetch({id: req.params.id})
        res.status(200).json({ message: 'Successfully fetched latest news' })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

export default fetchLatestNews;
