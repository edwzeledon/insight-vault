
const fetchLatestReviews = async (req, res) => {
    try {  
        await handleLatestReviewsFetch({id: req.params.id})
        res.status(200).json({ message: 'Successfully fetched latest reviews' })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

export default fetchLatestReviews;