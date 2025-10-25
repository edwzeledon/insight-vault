import { useRef, memo, useMemo } from 'react'
import { ExternalLink, Newspaper, MessageSquare, FileText, ChevronDown } from 'lucide-react'

const getSourceIcon = (type) => {
  switch (type) {
    case 'news':
      return <Newspaper className="w-4 h-4" />
    case 'review':
      return <MessageSquare className="w-4 h-4" />
    case 'press':
      return <FileText className="w-4 h-4" />
    case 'discussion':
      return <MessageSquare className="w-4 h-4" />
    default:
      return <Newspaper className="w-4 h-4" />
  }
}

const getSentimentStyles = (sentiment) => {
  switch (sentiment) {
    case '2':
      return 'bg-sentiment-positive-bg border-l-sentiment-positive'
    case '0':
      return 'bg-sentiment-negative-bg border-l-sentiment-negative'
    case '1':
      return 'bg-sentiment-neutral-bg border-l-sentiment-neutral'
    default:
      return 'bg-muted border-l-border'
  }
}

const getSentimentLabel = (sentiment) => {
  switch (sentiment) {
    case '2':
      return 'Positive'
    case '0':
      return 'Negative'
    case '1':
      return 'Neutral'
    default:
      return 'Neutral'
  }
}

const getSentimentColor = (sentiment) => {
  switch (sentiment) {
    case '2':
      return 'hsl(var(--sentiment-positive))'
    case '0':
      return 'hsl(var(--sentiment-negative))'
    case '1':
      return 'hsl(var(--sentiment-neutral))'
    default:
      return 'hsl(var(--sentiment-neutral))'
  }
}

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000)
  
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600)
    return `${hours}h ago`
  }
  const days = Math.floor(seconds / 86400)
  return `${days}d ago`
}

// Memoized activity card component to prevent re-renders
const ActivityCard = memo(({ activity }) => {
  // Memoize the time ago calculation so it doesn't change on every render
  const timeAgo = useMemo(() => getTimeAgo(activity.timestamp), [activity.timestamp])
  
  return (
    <div
      className={`border-l-4 rounded-lg p-4 transition-all cursor-pointer hover:shadow-md animate-fade-in-up ${getSentimentStyles(activity.sentiment)}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          {getSourceIcon(activity.type)}
          <span className="text-xs font-medium">{activity.source}</span>
        </div>
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
      </div>

      {/* Headline */}
      <h4 className="font-semibold text-sm text-foreground mb-2 line-clamp-2">
        {activity.headline}
      </h4>

      {/* Excerpt */}
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {activity.excerpt}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium" style={{
          color: getSentimentColor(activity.sentiment)
        }}>
          {getSentimentLabel(activity.sentiment)}
        </div>
        <a
          href={activity.url}
          className="text-xs text-primary hover:underline flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
          target="_blank" rel="noopener noreferrer"
        >
          Read more <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
})

// Memoized news grid component to prevent re-rendering existing items
const NewsGrid = memo(({ items }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  )
})

function ActivityFeed({ competitor, dateRange, items = [], isLoading = false, error = null, onLoadMore, hasMore = true, isLoadingMore = false }) {
  const loadMoreButtonRef = useRef(null)

  const handleLoadMore = () => {
    // Save the current scroll position before loading more
    const currentScrollY = window.scrollY
    
    // Call the load more function
    onLoadMore()
    
    // After a brief delay (to allow React to render), restore scroll position
    setTimeout(() => {
      window.scrollTo(0, currentScrollY)
    }, 0)
  }


  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Latest Activity</h3>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3 mb-4">
          {error}
        </div>
      )}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border-l-4 rounded-lg p-4 bg-muted/50 h-28" />
          ))}
        </div>
      )}
      {!isLoading && !error && items.length === 0 && (
        <div className="text-sm text-muted-foreground">No recent activity found for this company.</div>
      )}
      
      {!isLoading && !error && items.length > 0 && (
        <>
          <NewsGrid items={items} />
          
          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-6" ref={loadMoreButtonRef}>
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="group px-6 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer transition-all duration-200 ease-in-out flex items-center gap-2 font-medium"
              >
                {isLoadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-1" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ActivityFeed
