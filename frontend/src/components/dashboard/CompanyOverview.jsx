import { TrendingUp, TrendingDown, MessageSquare, Activity, Calendar } from 'lucide-react'
import { getSentimentColor } from '../../lib/utils'

export default function CompanyOverview({ competitor, dateRange, onDateRangeChange, mediaMentions = 0, mediaMentionsChange = null, avgSentiment = null, dailySentiment = null }) {
  // Calculate daily sentiment values (convert from 0-2 scale to 0-10 display scale)
  const todaySentimentScore = dailySentiment && dailySentiment.todaySentiment !== null && dailySentiment.todaySentiment !== undefined
    ? (parseFloat(dailySentiment.todaySentiment) * 5).toFixed(2) 
    : null
  
  const dailySentimentChange = dailySentiment && dailySentiment.change !== null && dailySentiment.change !== undefined
    ? parseFloat(dailySentiment.change).toFixed(4)
    : null
  
  // For color, use the raw 0-2 scale value
  const dailySentimentColor = dailySentiment && dailySentiment.todaySentiment !== null && dailySentiment.todaySentiment !== undefined
    ? (dailySentiment.todaySentiment < 0.67 ? 'negative' : dailySentiment.todaySentiment < 1.33 ? 'neutral' : 'positive') 
    : 'neutral'
  
  // Calculate average sentiment score and label (convert from 0-2 scale to 0-10 display scale)
  const avgSentimentScore = avgSentiment !== null ? (parseFloat(avgSentiment) * 5).toFixed(2) : null
  
  // For color, use the raw 0-2 scale value
  const avgSentimentColor = avgSentiment !== null ? 
    (avgSentiment < 0.67 ? 'negative' : avgSentiment < 1.33 ? 'neutral' : 'positive') : 
    'neutral'

  const getSentimentLabel = (score) => {
    // score is on 0-10 display scale
    if (score >= 6.65) return 'Positive'  // 1.33 * 5 = 6.65
    if (score <= 3.35) return 'Negative'  // 0.67 * 5 = 3.35
    return 'Neutral'
  }

  // Get period label based on date range
  const getPeriodLabel = () => {
    const days = parseInt(dateRange)
    if (days === 7) return 'week'
    if (days === 30) return 'month'
    if (days === 90) return '3 months'
    return 'period'
  }

  // Get comparison label for trends
  const getComparisonLabel = () => {
    const days = parseInt(dateRange)
    if (days === 7) return 'vs last week'
    if (days === 30) return 'vs last month'
    if (days === 90) return 'vs last 3 months'
    return 'vs previous period'
  }

  const periodLabel = getPeriodLabel()
  const comparisonLabel = getComparisonLabel()

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
              <option value="90">Past 3 months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Sentiment Box */}
        <div className={`bg-card rounded-lg border shadow-sm p-5 ${
          dailySentimentColor === 'positive' ? 'border-l-4 border-l-sentiment-positive' :
          dailySentimentColor === 'negative' ? 'border-l-4 border-l-sentiment-negative' :
          'border-l-4 border-l-sentiment-neutral'
        }`}>
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
            Daily Sentiment
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            {todaySentimentScore !== null ? (
              <>
                <span className="text-3xl font-bold text-foreground">{todaySentimentScore}</span>
                <span className={`text-sm font-semibold ${
                  dailySentimentColor === 'positive' ? 'text-sentiment-positive' :
                  dailySentimentColor === 'negative' ? 'text-sentiment-negative' :
                  'text-sentiment-neutral'
                }`}>
                  {getSentimentLabel(todaySentimentScore)}
                </span>
              </>
            ) : (
              <span className="text-xl text-muted-foreground">No data</span>
            )}
          </div>
          <div className={`text-sm flex items-center gap-1 ${
            dailySentimentChange !== null && parseFloat(dailySentimentChange) > 0 ? 'text-sentiment-positive' : 
            dailySentimentChange !== null && parseFloat(dailySentimentChange) < 0 ? 'text-sentiment-negative' : 
            'text-muted-foreground'
          }`}>
            {dailySentimentChange !== null && parseFloat(dailySentimentChange) !== 0 ? (
              <>
                {parseFloat(dailySentimentChange) > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {parseFloat(dailySentimentChange) > 0 ? '+' : ''}{(parseFloat(dailySentimentChange) * 5).toFixed(2)} from yesterday
              </>
            ) : dailySentiment && dailySentiment.hasDataToday === false ? (
              <>No new data today</>
            ) : (
              <>Unchanged from yesterday</>
            )}
          </div>
        </div>

        {/* Average Sentiment Box */}
        <div className="bg-card rounded-lg border border-border shadow-sm p-5">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Avg Sentiment
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            {avgSentimentScore !== null ? (
              <>
                <span className="text-3xl font-bold text-foreground">{avgSentimentScore}</span>
                <span className={`text-sm font-semibold ${
                  avgSentimentColor === 'positive' ? 'text-sentiment-positive' :
                  avgSentimentColor === 'negative' ? 'text-sentiment-negative' :
                  'text-sentiment-neutral'
                }`}>
                  {getSentimentLabel(avgSentimentScore)}
                </span>
              </>
            ) : (
              <span className="text-xl text-muted-foreground">No data</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Past {dateRange} days average
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
            <span className="text-sm text-muted-foreground">this {periodLabel}</span>
          </div>
          <div className={`text-sm flex items-center gap-1 ${
            mediaMentionsChange !== null && parseFloat(mediaMentionsChange) > 0 ? 'text-sentiment-positive' : 
            mediaMentionsChange !== null && parseFloat(mediaMentionsChange) < 0 ? 'text-sentiment-negative' : 
            'text-muted-foreground'
          }`}>
            {mediaMentionsChange !== null && parseFloat(mediaMentionsChange) < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            {mediaMentionsChange !== null ? (
              <>{parseFloat(mediaMentionsChange) > 0 ? '+' : ''}{mediaMentionsChange}% {comparisonLabel}</>
            ) : (
              <>+0% {comparisonLabel}</>
            )}
          </div>
        </div>

        {/* Stock Price Box */}
        <div className="bg-card rounded-lg border border-border shadow-sm p-5">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
            Stock Price
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-foreground">
              ${competitor.stockPrice ? parseFloat(competitor.stockPrice).toFixed(2) : '0.00'}
            </span>
          </div>
          <div className={`text-sm flex items-center gap-1 ${
            competitor.stockChange !== null && parseFloat(competitor.stockChange) > 0 ? 'text-sentiment-positive' : 
            competitor.stockChange !== null && parseFloat(competitor.stockChange) < 0 ? 'text-sentiment-negative' : 
            'text-muted-foreground'
          }`}>
            {competitor.stockChange !== null && parseFloat(competitor.stockChange) < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            {competitor.stockChange !== null ? (
              <>{parseFloat(competitor.stockChange) > 0 ? '+' : ''}{competitor.stockChange}% this {periodLabel}</>
            ) : (
              <>+0% this {periodLabel}</>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
