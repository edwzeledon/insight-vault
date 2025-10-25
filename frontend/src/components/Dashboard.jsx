import { memo } from 'react'
import CompanyOverview from './dashboard/CompanyOverview'
import SentimentChart from './dashboard/SentimentChart'
import StockChart from './dashboard/StockChart'
import ActivityFeed from './dashboard/ActivityFeed'

const Dashboard = memo(function Dashboard({ competitor, dateRange, onDateRangeChange, newsItems, isNewsLoading, newsError, onLoadMoreNews, hasMoreNews, isLoadingMore, stockData, isStockLoading, mediaMentions, mediaMentionsChange, avgSentiment }) {

  if (!competitor) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="text-6xl">🎯</div>
          <h2 className="text-2xl font-bold text-foreground">Select a Competitor</h2>
          <p className="text-muted-foreground">
            Choose a competitor from the sidebar to view their intelligence dashboard
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
  {/* Company Overview Header */}
  <CompanyOverview 
    competitor={competitor} 
    dateRange={dateRange} 
    onDateRangeChange={onDateRangeChange}
    mediaMentions={mediaMentions}
    mediaMentionsChange={mediaMentionsChange}
    avgSentiment={avgSentiment}
  />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SentimentChart competitor={competitor} dateRange={dateRange} />
        <StockChart 
          competitor={competitor} 
          dateRange={dateRange} 
          stockData={stockData}
          isLoading={isStockLoading}
        />
      </div>

      {/* Activity Feed - Full Width */}
      <ActivityFeed 
        competitor={competitor}
        dateRange={dateRange}
        items={newsItems}
        isLoading={isNewsLoading}
        error={newsError}
        onLoadMore={onLoadMoreNews}
        hasMore={hasMoreNews}
        isLoadingMore={isLoadingMore}
      />

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-4 border-t border-border">
        Last updated • Multiple API sources
      </footer>
    </div>
  )
})

export default Dashboard
