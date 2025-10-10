import { ExternalLink, Newspaper, MessageSquare, FileText } from 'lucide-react'
import { formatDate } from '../../lib/utils'

// Mock activity data
const mockActivities = [
  {
    id: 1,
    type: 'news',
    source: 'TechCrunch',
    headline: 'Announces Major AI Integration in Core Product',
    excerpt: 'The company revealed plans to integrate advanced AI capabilities across its platform, positioning itself as a leader in the AI-first movement...',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    sentiment: 'positive',
    url: '#'
  },
  {
    id: 2,
    type: 'review',
    source: 'G2 Reviews',
    headline: 'Customer Satisfaction Drops Following Recent Update',
    excerpt: 'Multiple users report frustration with the latest UI changes, citing decreased productivity and confusing navigation patterns...',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    sentiment: 'negative',
    url: '#'
  },
  {
    id: 3,
    type: 'press',
    source: 'Company Blog',
    headline: 'Partnership Announcement with CloudTech Industries',
    excerpt: 'Strategic partnership aims to expand enterprise capabilities and market reach in the Asia-Pacific region over the next 18 months...',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    sentiment: 'positive',
    url: '#'
  },
  {
    id: 4,
    type: 'news',
    source: 'Bloomberg',
    headline: 'Q2 Earnings Miss Analyst Expectations',
    excerpt: 'Revenue growth slowed to 12% year-over-year, below the projected 18%, raising concerns about market saturation in core segments...',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    sentiment: 'negative',
    url: '#'
  },
  {
    id: 5,
    type: 'discussion',
    source: 'Reddit',
    headline: 'Users Discuss Pricing Changes and Value Proposition',
    excerpt: 'Community feedback suggests mixed reactions to new pricing tiers, with enterprise customers expressing concerns about cost increases...',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    sentiment: 'neutral',
    url: '#'
  },
  {
    id: 6,
    type: 'press',
    source: 'PR Newswire',
    headline: 'Expands Development Team by 200+ Engineers',
    excerpt: 'Major hiring initiative signals aggressive growth plans and investment in product innovation for 2025 roadmap...',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    sentiment: 'positive',
    url: '#'
  }
]

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
    case 'positive':
      return 'bg-sentiment-positive-bg border-l-sentiment-positive'
    case 'negative':
      return 'bg-sentiment-negative-bg border-l-sentiment-negative'
    case 'neutral':
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

export default function ActivityFeed({ competitor, dateRange }) {
  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Latest Activity</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockActivities.map((activity) => (
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
              >
                Read more <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
