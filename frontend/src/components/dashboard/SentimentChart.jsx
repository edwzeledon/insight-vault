import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

// Normalize sentiment from 0-2 scale to 0-1 scale for chart display
const normalizeSentiment = (value) => {
  if (value === null || value === undefined) return null
  return value / 2 // Convert 0-2 to 0-1
}

// Convert sentiment back to 0-10 scale for display
const sentimentToDisplayValue = (value) => {
  if (value === null || value === undefined) return null
  return (value * 5).toFixed(2) // 0-2 scale * 5 = 0-10 display scale
}

// Get sentiment label
const getSentimentLabel = (value) => {
  if (value === null || value === undefined) return 'No Data'
  if (value < 0.67) return 'Negative' // < 1.33 on 0-2 scale
  if (value < 1.33) return 'Neutral'  // 1.33-2.66 on 0-2 scale
  return 'Positive' // > 1.33 on 0-2 scale
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const originalSentiment = payload[0].payload.sentiment // 0-2 scale
    const displayValue = sentimentToDisplayValue(originalSentiment)
    const label = getSentimentLabel(originalSentiment)
    const articleCount = payload[0].payload.articleCount || 0
    
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{payload[0].payload.fullDate}</p>
        <p className="text-sm font-semibold text-foreground">
          Sentiment: <span className="text-primary">{displayValue}</span> ({label})
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {articleCount} article{articleCount !== 1 ? 's' : ''}
        </p>
      </div>
    )
  }
  return null
}

export default function SentimentChart({ competitor, dateRange, sentimentData = [], isLoading = false }) {
  const [viewBy, setViewBy] = useState('daily')
  
  // Normalize sentiment data for chart (0-2 scale to 0-1 scale)
  const normalizedData = sentimentData.map(item => ({
    ...item,
    normalizedSentiment: normalizeSentiment(item.sentiment)
  }))

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Sentiment Trends</h3>
        <select
          value={viewBy}
          onChange={(e) => setViewBy(e.target.value)}
          className="px-3 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-muted-foreground">Loading sentiment data...</div>
        </div>
      ) : normalizedData.length === 0 ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">No sentiment data available</p>
            <p className="text-xs text-muted-foreground">Data will appear once news articles are analyzed</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={normalizedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            {/* Sentiment zones - adjusted for normalized 0-1 scale */}
            <ReferenceLine y={0.67} stroke="hsl(var(--sentiment-positive))" strokeDasharray="3 3" strokeOpacity={0.3} />
            <ReferenceLine y={0.33} stroke="hsl(var(--sentiment-negative))" strokeDasharray="3 3" strokeOpacity={0.3} />
            
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              stroke="hsl(var(--border))"
            />
            <YAxis 
              domain={[0, 1]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              stroke="hsl(var(--border))"
              tickFormatter={(value) => (value * 10).toFixed(1)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="normalizedSentiment"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 3 }}
              activeDot={{ r: 5 }}
              fill="url(#sentimentGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-sentiment-positive rounded-sm" />
          <span>Positive (&gt;6.0)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-sentiment-neutral rounded-sm" />
          <span>Neutral (4.0-6.0)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-sentiment-negative rounded-sm" />
          <span>Negative (&lt;4.0)</span>
        </div>
      </div>
    </div>
  )
}
