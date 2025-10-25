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
  const [mediaMentions, setMediaMentions] = useState(0)

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
            stockPrice: (Math.random() * 200 + 50).toFixed(2), // TODO: Replace with real data
            stockChange: (Math.random() * 10 - 5).toFixed(2) // TODO: Replace with real data
          }))
          setCompetitors(transformedCompetitors)
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

  // Fetch stock data for selected competitor
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
        
        // Update competitor with latest stock price
        if (transformed.length > 0) {
          const latestPrice = transformed[transformed.length - 1].price
          const oldestPrice = transformed[0].price
          const priceChange = ((latestPrice - oldestPrice) / oldestPrice * 100).toFixed(2)
          
          setCompetitors(prev => prev.map(comp => 
            comp.id === selectedCompetitor.id 
              ? { ...comp, stockPrice: latestPrice.toFixed(2), stockChange: priceChange }
              : comp
          ))
        }
      } catch (err) {
        console.error('Error fetching stock data:', err)
        setStockData([])
      } finally {
        setIsStockLoading(false)
      }
    }
    fetchStockData()
  }, [accessToken, selectedCompetitor?.id])

  // Fetch media mentions count for selected competitor
  useEffect(() => {
    const fetchMediaMentions = async () => {
      if (!accessToken || !selectedCompetitor?.id) return
      try {
        const response = await fetch(`http://localhost:3000/news/${selectedCompetitor.id}/count?days=7`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        if (!response.ok) {
          throw new Error(`Failed to fetch media mentions (${response.status})`)
        }
        const result = await response.json()
        setMediaMentions(result.count || 0)
      } catch (err) {
        console.error('Error fetching media mentions:', err)
        setMediaMentions(0)
      }
    }
    fetchMediaMentions()
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
          stockPrice: (Math.random() * 200 + 50).toFixed(2), // TODO: Replace with real data
          stockChange: (Math.random() * 10 - 5).toFixed(2) // TODO: Replace with real data
        }
        setCompetitors(prev => [...prev, newCompetitor])
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
          />
        </main>
      </div>
    </div>
  )
}
