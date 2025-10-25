import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{payload[0].payload.fullDate}</p>
        <p className="text-sm font-semibold text-foreground">
          Price: <span className="text-primary">${payload[0].value.toFixed(2)}</span>
        </p>
      </div>
    )
  }
  return null
}

export default function StockChart({ competitor, dateRange, stockData = [], isLoading = false }) {
  // Calculate stats from real data
  const calculateStats = () => {
    if (!stockData || stockData.length === 0) {
      return {
        weekHigh: 0,
        weekLow: 0,
        currentPrice: parseFloat(competitor?.stockPrice || 0)
      }
    }
    
    const prices = stockData.map(d => d.price)
    return {
      weekHigh: Math.max(...prices),
      weekLow: Math.min(...prices),
      currentPrice: prices[prices.length - 1] || parseFloat(competitor?.stockPrice || 0)
    }
  }

  const stats = calculateStats()

  // Get period label based on date range
  const getPeriodLabel = () => {
    const days = parseInt(dateRange)
    if (days === 7) return 'Week'
    if (days === 30) return 'Month'
    if (days === 90) return 'Quarter'
    return 'Period'
  }

  const periodLabel = getPeriodLabel()

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Stock Performance</h3>
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
            {competitor?.name ? `${competitor.name.slice(0, 4).toUpperCase()}` : 'N/A'}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading stock data...</div>
        </div>
      ) : stockData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-sm text-muted-foreground">No stock data available</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={stockData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              stroke="hsl(var(--border))"
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              stroke="hsl(var(--border))"
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#stockGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-muted-foreground mb-1">{periodLabel} High</div>
          <div className="text-sm font-semibold text-foreground">
            ${stats.weekHigh.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">{periodLabel} Low</div>
          <div className="text-sm font-semibold text-foreground">
            ${stats.weekLow.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Current Price</div>
          <div className="text-sm font-semibold text-foreground">
            ${stats.currentPrice.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}
