# Executive Competitor Intelligence Dashboard

A calm, powerful dashboard for executives to monitor competitor intelligence with one-glance insights.

## Design Philosophy

**One interaction = One clear insight**

Executives shouldn't navigate multiple tabs or decipher dense data. Each visual cluster answers a single question:
- "How is the market reacting?"
- "What's their stock trend?"
- "What's their latest move?"

## Features

### 🎯 Core Principles
- **Whitespace Dominance** → Calm cognitive environment
- **Minimal Color Variety** → Color only signals meaning
- **Consistent Rhythm** → Low eye travel, higher comprehension
- **Semantic Framing** → Every metric answers an executive question

### 📊 Components

#### A. Sidebar (Competitor Management)
- Search/filter competitors
- Quick add with inline input
- Color-coded sentiment bubbles (🟢 positive, 🟡 neutral, 🔴 negative)
- Selected competitor highlighted with blue accent bar

#### B. Top Navigation Bar
- Platform branding
- Date range filter (7/30/90/180 days)
- User avatar menu

#### C. Main Dashboard
1. **Company Overview Header** - Daily sentiment + stock summary
2. **Sentiment Graph** - Historical sentiment trends with zones
3. **Stock Value Graph** - Blue gradient area chart
4. **Latest Activity Feed** - 2-column cards with sentiment overlays
5. **Issues & Alerts Panel** - Customer issues + emerging topics

## Tech Stack

- React 18 + Vite
- Tailwind CSS 3
- shadcn/ui (Radix UI primitives)
- Recharts for visualizations
- Lucide React icons

## Quick Start

```bash
npm install
npm run dev
```

Access at: `http://localhost:5174`

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx
│   ├── TopBar.jsx
│   ├── Dashboard.jsx
│   └── dashboard/
│       ├── CompanyOverview.jsx
│       ├── SentimentChart.jsx
│       ├── StockChart.jsx
│       ├── ActivityFeed.jsx
│       └── IssuesPanel.jsx
├── lib/utils.js
└── index.css
```

## Design Tokens

```css
--primary: 221.2 83.2% 53.3%         /* Blue */
--sentiment-positive: 142 76% 36%    /* Green */
--sentiment-negative: 0 84.2% 60.2%  /* Red */
--sentiment-neutral: 43 96% 56%      /* Yellow */
```

---

**Built for executives who need strategic intelligence, not information overload.**
