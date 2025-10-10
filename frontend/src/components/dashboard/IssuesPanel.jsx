import { AlertTriangle, TrendingDown, Hash } from 'lucide-react'

// Mock issues data
const mockIssues = {
  categories: [
    { name: 'Product Quality', count: 24, percentage: 40 },
    { name: 'Customer Service', count: 18, percentage: 30 },
    { name: 'Pricing', count: 12, percentage: 20 },
    { name: 'Performance', count: 6, percentage: 10 }
  ],
  trends: [
    'AI Integration',
    'Enterprise Features',
    'Mobile Experience'
  ],
  alert: {
    active: true,
    message: 'Sentiment declined 12% due to recent pricing changes',
    severity: 'high'
  }
}

export default function IssuesPanel({ competitor, dateRange }) {
  return (
    <div className="space-y-6">
      {/* Sentiment Alert */}
      {mockIssues.alert.active && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-destructive mb-1">Sentiment Alert</h4>
              <p className="text-xs text-muted-foreground">{mockIssues.alert.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Customer Issues */}
      <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingDown className="w-4 h-4" />
          Customer Issues (Last {dateRange} Days)
        </h3>

        <div className="space-y-3">
          {mockIssues.categories.map((category, index) => (
            <div key={index}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground font-medium">{category.name}</span>
                <span className="text-muted-foreground">{category.count}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Total Issues: <span className="font-semibold text-foreground">
              {mockIssues.categories.reduce((sum, cat) => sum + cat.count, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Emerging Topics */}
      <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Hash className="w-4 h-4" />
          Emerging Topics
        </h3>

        <div className="space-y-2">
          {mockIssues.trends.map((trend, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded bg-accent/50 hover:bg-accent transition-colors cursor-pointer"
            >
              <span className="text-sm text-foreground">{trend}</span>
              <span className="text-xs text-muted-foreground">
                {Math.floor(Math.random() * 50 + 20)} mentions
              </span>
            </div>
          ))}
        </div>

        <button className="w-full mt-3 text-xs text-primary hover:underline text-center">
          View all trends →
        </button>
      </div>

      {/* Quick Stats */}
      <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4">Key Metrics</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Avg. Response Time</span>
            <span className="text-sm font-semibold text-foreground">2.4h</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Resolution Rate</span>
            <span className="text-sm font-semibold text-sentiment-positive">87%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Social Mentions</span>
            <span className="text-sm font-semibold text-foreground">1,247</span>
          </div>
        </div>
      </div>
    </div>
  )
}
