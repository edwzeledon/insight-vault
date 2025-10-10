// Curated list of trusted news domains for high-quality reporting
// These sources are used to filter NewsAPI results
const TRUSTED_DOMAINS = [
    'techcrunch.com',
    'theverge.com',
    'arstechnica.com',
    'reuters.com',
    'bloomberg.com',
    'wsj.com',
    'ft.com',
    'cnbc.com',
    'fortune.com',
    'businessinsider.com',
    'forbes.com',
    'wired.com',
    'venturebeat.com',
    'engadget.com',
    'zdnet.com',
    'cnet.com',
    'axios.com',
    'theinformation.com',
    'protocol.com',
    'siliconangle.com'
]

// Domain preference ranking for tie-breaking when deduping
// Higher index = higher preference (keep this one over others)
const DOMAIN_PREFERENCE = [
    'businessinsider.com',
    'engadget.com',
    'venturebeat.com',
    'axios.com',
    'wired.com',
    'arstechnica.com',
    'theverge.com',
    'techcrunch.com',
    'cnbc.com',
    'fortune.com',
    'forbes.com',
    'wsj.com',
    'bloomberg.com',
    'reuters.com'
]

export { TRUSTED_DOMAINS, DOMAIN_PREFERENCE }
