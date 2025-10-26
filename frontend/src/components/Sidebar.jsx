import { useState } from 'react'
import { Plus, Search, X, AlertTriangle } from 'lucide-react'
import { cn, getSentimentColor } from '../lib/utils'

export default function Sidebar({ competitors, selectedCompetitor, onSelectCompetitor, onAddCompetitor, onRemoveCompetitor, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [newCompetitorName, setNewCompetitorName] = useState('')
  const [competitorToRemove, setCompetitorToRemove] = useState(null)

  const handleRemoveClick = (e, competitor) => {
    e.stopPropagation()
    setCompetitorToRemove(competitor)
  }

  const confirmRemove = () => {
    if (competitorToRemove) {
      onRemoveCompetitor(competitorToRemove.id)
      setCompetitorToRemove(null)
    }
  }

  const cancelRemove = () => {
    setCompetitorToRemove(null)
  }

  const handleAdd = async () => {
    if (newCompetitorName.trim()) {
      await onAddCompetitor(newCompetitorName)
      setNewCompetitorName('')
    }
  }

  const filteredCompetitors = competitors.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      {/* Confirmation Modal */}
      {competitorToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white border-2 border-border rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Remove Competitor
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to remove <span className="font-semibold text-gray-900">"{competitorToRemove.name}"</span> from your competitors list? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelRemove}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-md cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="w-60 bg-card border-r border-border flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-lg text-foreground">Competitors</h2>
        </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Add Competitor */}
      <div className="px-3 pb-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add new competitor..."
            value={newCompetitorName}
            onChange={(e) => setNewCompetitorName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleAdd()}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleAdd}
            disabled={isLoading}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Competitor List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {filteredCompetitors.map((competitor) => {
          const sentimentColor = getSentimentColor(competitor.avgSentiment)
          const isSelected = selectedCompetitor?.id === competitor.id

          return (
            <div
              key={competitor.id}
              onClick={() => onSelectCompetitor(competitor)}
              className={cn(
                "relative group w-full rounded-lg transition-all cursor-pointer",
                "hover:bg-accent hover:shadow-sm p-3",
                isSelected && "bg-accent shadow-md border-l-4 border-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{competitor.logo}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">
                    {competitor.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {competitor.stockPrice !== null ? (
                      <>
                        <span>${competitor.stockPrice}</span>
                        {competitor.stockChange !== null && (
                          <span className={
                            parseFloat(competitor.stockChange) > 0 
                              ? 'text-sentiment-positive' 
                              : parseFloat(competitor.stockChange) < 0 
                                ? 'text-sentiment-negative' 
                                : 'text-muted-foreground'
                          }>
                            {' '}({parseFloat(competitor.stockChange) > 0 ? '+' : ''}{competitor.stockChange}%)
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground/60">Loading...</span>
                    )}
                  </div>
                </div>
                
                {/* Sentiment bubble - hidden on hover */}
                <div className={cn(
                  "sentiment-bubble group-hover:opacity-0 transition-opacity",
                  sentimentColor === 'positive' && "sentiment-bubble-positive",
                  sentimentColor === 'negative' && "sentiment-bubble-negative",
                  sentimentColor === 'neutral' && "sentiment-bubble-neutral"
                )} />
                
                {/* Remove Button - Shows on hover in place of sentiment bubble */}
                <button
                  onClick={(e) => handleRemoveClick(e, competitor)}
                  className="absolute right-3 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-all cursor-pointer"
                  title="Remove competitor"
                >
                  <X className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
      </aside>
    </>
  )
}
