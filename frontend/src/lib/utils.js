import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Updated to work with 0-2 sentiment scale from database
// 0 = Negative, 1 = Neutral, 2 = Positive
export function getSentimentColor(sentiment) {
  if (sentiment === null || sentiment === undefined) return 'neutral'
  if (sentiment < 0.67) return 'negative'  // 0 to 0.67 = Negative
  if (sentiment < 1.33) return 'neutral'   // 0.67 to 1.33 = Neutral
  return 'positive'                         // 1.33 to 2 = Positive
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}
