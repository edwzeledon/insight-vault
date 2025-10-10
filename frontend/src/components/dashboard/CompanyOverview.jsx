import { TrendingUp, TrendingDown, MessageSquare, PieChart, Calendar } from 'lucide-react'
import { getSentimentColor } from '../../lib/utils'

export default function CompanyOverview({ competitor, dateRange, onDateRangeChange }) {
  const sentimentColor = getSentimentColor(competitor.sentiment)
  const sentimentValue = (competitor.sentiment * 10).toFixed(2)
  const sentimentChange = 0.12 // Mock data
  
  // Mock data for additional metrics
  const mediaMentions = 247
  const mediaMentionsChange = 12
  const marketShare = 18.5
  const marketShareChange = -0.3

  const getSentimentLabel = (score) => {
    if (score >= 6) return 'Positive'
    if (score <= 4) return 'Negative'
    return 'Neutral'
  }

  return (
    <div className="space-y-4">
      {/* Company Name Header */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{competitor.logo}</div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{competitor.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">Technology • Software as a Service</p>
            </div>
          </div>

          {/* Date range selector moved here */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              <option value="7">Past 7 days</option>
              <option value="30">Past 30 days</option>
              <option value="90">Past 90 days</option>
              <option value="180">Past 6 months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Sentiment Box */}
        <div className={`bg-card rounded-lg border shadow-sm p-5 ${
          sentimentColor === 'positive' ? 'border-l-4 border-l-sentiment-positive' :
          sentimentColor === 'negative' ? 'border-l-4 border-l-sentiment-negative' :
          'border-l-4 border-l-sentiment-neutral'
        }`}>
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
            Daily Sentiment
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-foreground">{sentimentValue}</span>
            <span className={`text-sm font-semibold ${
              sentimentColor === 'positive' ? 'text-sentiment-positive' :
              sentimentColor === 'negative' ? 'text-sentiment-negative' :
              'text-sentiment-neutral'
            }`}>
              {getSentimentLabel(sentimentValue)}
            </span>
          </div>
          <div className={`text-sm flex items-center gap-1 ${
            sentimentChange > 0 ? 'text-sentiment-positive' : 'text-sentiment-negative'
          }`}>
            {sentimentChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {sentimentChange > 0 ? '+' : ''}{sentimentChange.toFixed(2)} from yesterday
          </div>
        </div>

        {/* Stock Price Box */}
        <div className="bg-card rounded-lg border border-border shadow-sm p-5">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
            Stock Price
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-foreground">${competitor.stockPrice}</span>
          </div>
          <div className={`text-sm flex items-center gap-1 ${
            competitor.stockChange > 0 ? 'text-sentiment-positive' : 'text-sentiment-negative'
          }`}>
            {competitor.stockChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {competitor.stockChange > 0 ? '+' : ''}{competitor.stockChange}% today
          </div>
        </div>

        {/* Media Mentions Box */}
        <div className="bg-card rounded-lg border border-border shadow-sm p-5">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            Media Mentions
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-foreground">{mediaMentions}</span>
            <span className="text-sm text-muted-foreground">this week</span>
          </div>
          <div className={`text-sm flex items-center gap-1 ${
            mediaMentionsChange > 0 ? 'text-sentiment-positive' : 'text-sentiment-negative'
          }`}>
            {mediaMentionsChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {mediaMentionsChange > 0 ? '+' : ''}{mediaMentionsChange}% vs last week
          </div>
        </div>

        {/* Market Share Box */}
        <div className="bg-card rounded-lg border border-border shadow-sm p-5">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2 flex items-center gap-1">
            <PieChart className="w-3 h-3" />
            Market Share
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-foreground">{marketShare}%</span>
          </div>
          <div className={`text-sm flex items-center gap-1 ${
            marketShareChange > 0 ? 'text-sentiment-positive' : 'text-sentiment-negative'
          }`}>
            {marketShareChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {marketShareChange > 0 ? '+' : ''}{marketShareChange}% this quarter
          </div>
        </div>
      </div>
    </div>
  )
}
