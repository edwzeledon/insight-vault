import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

// Mock sentiment data
const generateSentimentData = (days) => {
  const data = []
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sentiment: 0.5 + (Math.random() * 0.4 - 0.2),
      fullDate: date.toLocaleDateString()
    })
  }
  return data
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const sentimentValue = (payload[0].value * 10).toFixed(2)
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{payload[0].payload.fullDate}</p>
        <p className="text-sm font-semibold text-foreground">
          Sentiment: <span className="text-primary">{sentimentValue}</span>
        </p>
      </div>
    )
  }
  return null
}

export default function SentimentChart({ competitor, dateRange }) {
  const [viewBy, setViewBy] = useState('daily')
  const data = generateSentimentData(parseInt(dateRange))

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

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          {/* Sentiment zones */}
          <ReferenceLine y={0.6} stroke="hsl(var(--sentiment-positive))" strokeDasharray="3 3" strokeOpacity={0.3} />
          <ReferenceLine y={0.4} stroke="hsl(var(--sentiment-negative))" strokeDasharray="3 3" strokeOpacity={0.3} />
          
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
            dataKey="sentiment"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 3 }}
            activeDot={{ r: 5 }}
            fill="url(#sentimentGradient)"
          />
        </LineChart>
      </ResponsiveContainer>

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
