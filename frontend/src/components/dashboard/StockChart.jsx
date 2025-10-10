import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock stock data
const generateStockData = (days, basePrice) => {
  const data = []
  let price = parseFloat(basePrice)
  
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    // Random walk with slight upward bias
    price += (Math.random() - 0.45) * 5
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: parseFloat(price.toFixed(2)),
      fullDate: date.toLocaleDateString()
    })
  }
  return data
}

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

export default function StockChart({ competitor, dateRange }) {
  const data = generateStockData(parseInt(dateRange), competitor.stockPrice)

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Stock Performance</h3>
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
            NYSE: {competitor.name.slice(0, 4).toUpperCase()}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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

      <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-muted-foreground mb-1">52 Week High</div>
          <div className="text-sm font-semibold text-foreground">
            ${(parseFloat(competitor.stockPrice) * 1.2).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">52 Week Low</div>
          <div className="text-sm font-semibold text-foreground">
            ${(parseFloat(competitor.stockPrice) * 0.7).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
          <div className="text-sm font-semibold text-foreground">$12.4B</div>
        </div>
      </div>
    </div>
  )
}
