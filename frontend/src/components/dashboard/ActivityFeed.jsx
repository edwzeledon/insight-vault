import { ExternalLink, Newspaper, MessageSquare, FileText } from 'lucide-react'

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

export default function ActivityFeed({ competitor, dateRange, items = [], isLoading = false, error = null }) {


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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((activity) => (
          <div
            key={activity.id}
            className={`border-l-4 rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${getSentimentStyles(activity.sentiment)}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                {getSourceIcon(activity.type)}
                <span className="text-xs font-medium">{activity.source}</span>
              </div>
              <span className="text-xs text-muted-foreground">{getTimeAgo(activity.timestamp)}</span>
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
              <div className="text-xs font-medium capitalize" style={{
                color: activity.sentiment === 'positive' ? 'hsl(var(--sentiment-positive))' :
                       activity.sentiment === 'negative' ? 'hsl(var(--sentiment-negative))' :
                       'hsl(var(--sentiment-neutral))'
              }}>
                {activity.sentiment}
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
        ))}
        </div>
      )}
    </div>
  )
}
