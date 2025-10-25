import { useState, useEffect } from 'react'
import Sidebar from '../../../components/Sidebar'
import TopBar from '../../../components/TopBar'
import Dashboard from '../../../components/Dashboard'
import useAuthStore from '../../../stores/AuthStore'

export default function DashboardPage() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const [competitors, setCompetitors] = useState([])
  const [selectedCompetitor, setSelectedCompetitor] = useState(null)
  const [dateRange, setDateRange] = useState('30')
  const [isLoading, setIsLoading] = useState(false)
  const [newsItems, setNewsItems] = useState([])
  const [isNewsLoading, setIsNewsLoading] = useState(false)
  const [newsError, setNewsError] = useState(null)
  const [stockData, setStockData] = useState([])
  const [isStockLoading, setIsStockLoading] = useState(false)
  const [isOverviewLoading, setIsOverviewLoading] = useState(false)
  const [stockMetrics, setStockMetrics] = useState({ currentPrice: null, weekChangePercent: null })
  const [mediaMentions, setMediaMentions] = useState(0)
  const [mediaMentionsChange, setMediaMentionsChange] = useState(null)
  const [avgSentiment, setAvgSentiment] = useState(null)

  // Fetch user competitors from backend on mount
  useEffect(() => {
    if (!accessToken) return

    const getUserCompetitors = async () => {
      try {
        const response = await fetch('http://localhost:3000/getUserCompetitors', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        
        if (response.ok) {
          const results = await response.json()
          // Transform backend data to match our component structure
          const transformedCompetitors = results.organizations.map(org => ({
            id: org.org_id,
            name: org.name,
            logo: '🏢', // Default logo, can be customized later
            sentiment: Math.random(), // TODO: Replace with real sentiment from backend
            stockPrice: null, // Will be fetched from overview
            stockChange: null // Will be fetched from overview
          }))
          setCompetitors(transformedCompetitors)
          
          // Fetch overview data for each competitor to populate stock prices
          transformedCompetitors.forEach(async (competitor) => {
            try {
              const overviewResponse = await fetch(`http://localhost:3000/overview/${competitor.id}?days=7`, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`
                }
              })
              if (overviewResponse.ok) {
                const data = await overviewResponse.json()
                if (data.stock && data.stock.currentPrice !== null) {
                  setCompetitors(prev => prev.map(comp => 
                    comp.id === competitor.id 
                      ? { 
                          ...comp, 
                          stockPrice: data.stock.currentPrice || null, 
                          stockChange: data.stock.weekChangePercent || null 
                        }
                      : comp
                  ))
                }
              }
            } catch (err) {
              console.error(`Error fetching overview for ${competitor.name}:`, err)
            }
          })
        }
      } catch (err) {
        console.error('Error fetching user competitors:', err)
      }
    }
    
    getUserCompetitors()
  }, [accessToken])

  // Fetch news for selected competitor
  useEffect(() => {
    const fetchNews = async () => {
      if (!accessToken || !selectedCompetitor?.id) return
      setIsNewsLoading(true)
      setNewsError(null)
      try {
        const response = await fetch(`http://localhost:3000/news/${selectedCompetitor.id}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        if (!response.ok) {
          throw new Error(`Failed to fetch news (${response.status})`)
        }
        const rows = await response.json()
        // Transform backend rows to ActivityFeed item shape
        const transformed = (rows || []).map((row) => ({
          id: row.id,
          type: 'news',
          source: row.source,
          headline: row.headline,
          excerpt: row.description,
          timestamp: new Date(row.published_at),
          sentiment: (row.sentiment || '1').toLowerCase(),
          url: row.url || '#'
        }))
        setNewsItems(transformed)
      } catch (err) {
        console.error('Error fetching news:', err)
        setNewsError(err.message || 'Failed to load news')
        setNewsItems([])
      } finally {
        setIsNewsLoading(false)
      }
    }
    fetchNews()
  }, [accessToken, selectedCompetitor?.id])

  // Fetch comprehensive overview data for selected competitor
  useEffect(() => {
    const fetchOverview = async () => {
      if (!accessToken || !selectedCompetitor?.id) return
      setIsOverviewLoading(true)
      try {
        const response = await fetch(`http://localhost:3000/overview/${selectedCompetitor.id}?days=7`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        if (!response.ok) {
          throw new Error(`Failed to fetch overview data (${response.status})`)
        }
        const data = await response.json()
        console.log(`Fetched overview for ${selectedCompetitor.name}:`, data)
        
        // Update stock metrics
        if (data.stock) {
          setStockMetrics(data.stock)
          // Update even if weekChangePercent is null
          setSelectedCompetitor(prev => ({
            ...prev,
            stockPrice: data.stock.currentPrice || null,
            stockChange: data.stock.weekChangePercent || null
          }))
          
          // Update the competitor in the sidebar list
          setCompetitors(prev => prev.map(comp => 
            comp.id === selectedCompetitor.id 
              ? { 
                  ...comp, 
                  stockPrice: data.stock.currentPrice || null, 
                  stockChange: data.stock.weekChangePercent || null 
                }
              : comp
          ))
        }
        
        // Update media mentions
        if (data.mediaMentions) {
          setMediaMentions(data.mediaMentions.currentCount || 0)
          setMediaMentionsChange(data.mediaMentions.changePercent)
        }
        
        // Update average sentiment
        if (data.sentiment) {
          setAvgSentiment(data.sentiment.avgSentiment)
        }
      } catch (err) {
        console.error('Error fetching overview:', err)
        // Reset all overview data on error
        setStockMetrics({ currentPrice: null, weekChangePercent: null })
        setMediaMentions(0)
        setMediaMentionsChange(null)
        setAvgSentiment(null)
      } finally {
        setIsOverviewLoading(false)
      }
    }
    fetchOverview()
  }, [accessToken, selectedCompetitor?.id])

  // Fetch stock data for chart
  useEffect(() => {
    const fetchStockData = async () => {
      if (!accessToken || !selectedCompetitor?.id) return
      setIsStockLoading(true)
      try {
        const response = await fetch(`http://localhost:3000/stocks/${selectedCompetitor.id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        if (!response.ok) {
          throw new Error(`Failed to fetch stock data (${response.status})`)
        }
        const result = await response.json()
        
        // Extract data array from response object
        const stockRows = result.data || []
        
        // Transform backend stock data for chart (reverse to get oldest to newest)
        const transformed = stockRows.reverse().map((row) => ({
          date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: parseFloat(row.mid),
          fullDate: new Date(row.date).toLocaleDateString()
        }))
        
        setStockData(transformed)
      } catch (err) {
        console.error('Error fetching stock data:', err)
        setStockData([])
      } finally {
        setIsStockLoading(false)
      }
    }
    fetchStockData()
  }, [accessToken, selectedCompetitor?.id])

  // Format competitor name (capitalize first letter)
  const formatName = (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  // Add competitor via API
  const handleAddCompetitor = async (name) => {
    if (!accessToken) return
    
    setIsLoading(true)
    const formatted = { name: formatName(name) }
    
    try {
      const response = await fetch('http://localhost:3000/addcompetitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formatted)
      })
      
      const results = await response.json()
      
      if (results.error) {
        throw new Error(results.error)
      }
      
      // Add to local state if not already exists
      if (!competitors.some((comp) => comp.name === formatted.name)) {
        const newCompetitor = {
          id: results.org_id,
          name: formatted.name,
          logo: '🏢',
          sentiment: Math.random(), // TODO: Replace with real sentiment
          stockPrice: null, // Will be fetched from overview
          stockChange: null // Will be fetched from overview
        }
        setCompetitors(prev => [...prev, newCompetitor])
        
        // Fetch overview data for the new competitor
        try {
          const overviewResponse = await fetch(`http://localhost:3000/overview/${results.org_id}?days=7`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
          if (overviewResponse.ok) {
            const data = await overviewResponse.json()
            if (data.stock) {
              setCompetitors(prev => prev.map(comp => 
                comp.id === results.org_id 
                  ? { 
                      ...comp, 
                      stockPrice: data.stock.currentPrice || null, 
                      stockChange: data.stock.weekChangePercent || null 
                    }
                  : comp
              ))
              console.log(`Updated new competitor with price: $${data.stock.currentPrice} (${data.stock.weekChangePercent || 'N/A'}%)`)
            }
          }
        } catch (err) {
          console.error('Error fetching overview for new competitor:', err)
        }
      }
      
      setIsLoading(false)
    } catch (err) {
      console.error('Error adding competitor:', err)
      setIsLoading(false)
    }
  }

  // Remove competitor via API
  const handleRemoveCompetitor = async (id) => {
    if (!accessToken) return
    
    try {
      const response = await fetch(`http://localhost:3000/userCompetitors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      const results = await response.json()
      
      if (results.error) {
        throw new Error(results.error)
      }
      
      // Remove from local state
      setCompetitors(competitors.filter(c => c.id !== id))
      
      // Clear selection if removed competitor was selected
      if (selectedCompetitor?.id === id) {
        setSelectedCompetitor(null)
      }
    } catch (err) {
      console.error('Error removing competitor:', err)
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        competitors={competitors}
        selectedCompetitor={selectedCompetitor}
        onSelectCompetitor={setSelectedCompetitor}
        onAddCompetitor={handleAddCompetitor}
        onRemoveCompetitor={handleRemoveCompetitor}
        isLoading={isLoading}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto">
          <Dashboard 
            competitor={selectedCompetitor}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            newsItems={newsItems}
            isNewsLoading={isNewsLoading}
            newsError={newsError}
            stockData={stockData}
            isStockLoading={isStockLoading}
            mediaMentions={mediaMentions}
            mediaMentionsChange={mediaMentionsChange}
            avgSentiment={avgSentiment}
          />
        </main>
      </div>
    </div>
  )
}
