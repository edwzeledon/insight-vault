# News Deduplication System

## Overview
The news ingestion pipeline now includes intelligent deduplication to prevent duplicate news articles from being stored. This system uses both exact matching and fuzzy similarity to catch duplicates across different outlets reporting the same story.

## How It Works

### 1. Trusted Sources Filter
Only fetches news from a curated list of 20 high-quality sources defined in `config/newsSources.js`:
- Tech outlets: TechCrunch, The Verge, Ars Technica, Wired, etc.
- Business/Finance: Bloomberg, WSJ, Reuters, Fortune, Forbes, etc.
- Focus on authoritative sources reduces noise and duplicate coverage

### 2. Multi-Layer Deduplication

#### Layer 1: URL Canonicalization
- Normalizes URLs by:
  - Lowercasing and removing `www`
  - Stripping tracking parameters (utm_*, fbclid, ref, etc.)
  - Removing URL fragments
- Maintains a Set of seen canonical URLs
- **Catches**: Exact same article shared with different tracking params

#### Layer 2: Jaccard Similarity on Titles
- Normalizes titles by:
  - Removing outlet suffixes ("– The Verge", "| CNN")
  - Stripping punctuation, emojis, quotes
  - Converting to lowercase and collapsing whitespace
- Tokenizes normalized text into words
- Computes Jaccard similarity (intersection / union of token sets)
- Groups articles with ≥75% similarity into clusters
- **Catches**: Same story with slightly different wording across outlets

#### Layer 3: Content Hash (Cross-Run)
- Computes SHA-256 hash of normalized `title + description`
- Checks database before insert to prevent re-ingestion
- **Catches**: Duplicate articles across multiple fetch runs

### 3. Smart Article Selection
When duplicates are found, keeps the "best" article based on:
1. **Domain preference**: Prefers authoritative sources (see `DOMAIN_PREFERENCE` in config)
2. **Content length**: Prefers articles with longer descriptions
3. **Publish date**: Prefers earlier/original reporting

## Configuration

### Trusted Domains (`config/newsSources.js`)
```javascript
TRUSTED_DOMAINS = [
  'techcrunch.com',
  'bloomberg.com',
  // ... 20 curated sources
]
```

### Jaccard Threshold
Default: **0.75** (75% token overlap)
- Adjustable in `newsService.js`: `dedupeArticles(articles, 0.75)`
- Lower = more aggressive deduping (may catch false positives)
- Higher = more conservative (may miss near-duplicates)

### Domain Preference Ranking
Higher-ranked domains are kept when choosing between duplicates:
```javascript
DOMAIN_PREFERENCE = [
  'reuters.com',      // Highest priority
  'bloomberg.com',
  'wsj.com',
  // ...
  'businessinsider.com' // Lowest priority
]
```

## Database Schema

### Migration Required
Run the migration to add the `content_hash` column:
```sql
-- See: db/migrations/add_content_hash.sql
ALTER TABLE sift_db.media ADD COLUMN IF NOT EXISTS content_hash TEXT;
CREATE INDEX media_content_hash_idx ON sift_db.media(org_id, type_id, content_hash);
```

## Implementation Details

### Files Created/Modified
- **`config/newsSources.js`**: Trusted domains and preference ranking
- **`services/dedupe/dedupeService.js`**: Core deduplication logic
- **`services/news/newsService.js`**: Integrated dedupe into fetch pipeline
- **`db/migrations/add_content_hash.sql`**: Database schema update

### Processing Flow
1. Fetch articles from NewsAPI (filtered by `domains` parameter)
2. **Dedupe in-memory** using URL + Jaccard similarity
3. Filter by keyword relevance
4. Enrich with labels, sentiment, summary
5. **Check content_hash** before DB insert
6. Persist unique articles only

## Performance Characteristics

### Time Complexity
- URL dedupe: O(n) with Set lookups
- Jaccard clustering: O(n²) worst case, but n is small after URL dedupe
- Content hash check: O(1) with indexed lookup

### Space Complexity
- O(n) for tracking seen URLs and clusters
- Minimal memory footprint for personal project scale

## Example Scenarios

### Scenario 1: Same Article, Different Tracking
```
Input:
- https://techcrunch.com/article?utm_source=twitter
- https://techcrunch.com/article?utm_campaign=email
Output: 1 article (dedupe by canonical URL)
```

### Scenario 2: Same Story, Different Outlets
```
Input:
- "Spotify Launches Lossless Audio Streaming" - TechCrunch
- "Spotify Introduces Hi-Fi Audio Quality for Premium Users" - The Verge
- "Spotify rolls out lossless streaming" - Engadget
Jaccard similarity: ~0.80
Output: 1 article (dedupe by Jaccard, keeps highest-ranked domain)
```

### Scenario 3: Re-fetch Protection
```
Run 1: Ingests "Company X announces layoffs" (hash: abc123)
Run 2: Same article appears in API response
Output: Skipped (content_hash exists in DB)
```

## Tuning Recommendations

### If Too Many Duplicates Slip Through
- Lower Jaccard threshold: `dedupeArticles(articles, 0.65)`
- Add more outlet suffixes to title normalization
- Increase domain preference list

### If Losing Unique Articles
- Raise Jaccard threshold: `dedupeArticles(articles, 0.85)`
- Check for overly aggressive title normalization
- Review TRUSTED_DOMAINS list (may be too narrow)

## Monitoring

Add logging to track dedupe effectiveness:
```javascript
console.log(`Fetched: ${rawCount}, After dedupe: ${dedupedCount}, Removed: ${rawCount - dedupedCount}`)
```

## Future Enhancements
- [ ] Semantic similarity using embeddings (for better fuzzy matching)
- [ ] Time-decay for content_hash (auto-clean old hashes)
- [ ] Domain reputation scoring (weighted by quality metrics)
- [ ] Redis cache for recent content_hash lookups (reduce DB queries)
