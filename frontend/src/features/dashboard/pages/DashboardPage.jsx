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
          />
        </main>
      </div>
    </div>
  )
}
