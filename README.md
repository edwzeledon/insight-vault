# InsightVault 🎯

> **Competitive Intelligence Platform** - Monitor your competitors' activities in real-time with executive-focused dashboards and AI-powered insights.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://reactjs.org/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)

---

## 🌟 Overview

InsightVault is a modern competitive intelligence platform designed for executives and product teams. Track competitor sentiment, stock performance, media mentions, market share, and real-time activity feeds—all in one calm, powerful interface.

Built with the philosophy: **"One interaction = One clear insight"**

### Key Capabilities

- 🔐 **Secure Authentication** - JWT-based auth with refresh tokens
- 📊 **Executive Dashboard** - Clean, scannable metrics without clutter
- 🎯 **Competitor Management** - Add, track, and remove competitors with real-time sync
- 📈 **Sentiment Analysis** - AI-powered sentiment tracking (coming soon)
- 💹 **Stock Monitoring** - Real-time stock price tracking (coming soon)
- 📰 **Activity Feed** - Latest news, social media, and updates
- 🎨 **Modern UI** - Built with Tailwind CSS + shadcn/ui design system

---

## ✨ Features

### Authentication & Authorization
- ✅ User registration and login
- ✅ JWT access tokens with HTTP-only refresh tokens
- ✅ Automatic token refresh on app mount
- ✅ Protected routes and API endpoints
- ✅ Secure logout with cookie clearing

### Competitor Management
- ✅ Fetch user's tracked competitors from database
- ✅ Add new competitors with API integration
- ✅ Remove competitors with confirmation modal
- ✅ Search and filter competitors
- ✅ Real-time sync with backend
- ✅ Duplicate prevention
- 🔄 Custom competitor logos (coming soon)

### Dashboard Analytics
- ✅ Company overview with key metrics
- ✅ Daily sentiment score with trend indicators
- ✅ Stock price with daily change percentage
- ✅ Media mentions tracking (weekly)
- ✅ Market share percentage
- ✅ Date range filtering (7, 30, 90, 180 days)
- 🔄 Real-time sentiment data integration (in progress)
- 🔄 Real-time stock data integration (in progress)

### Data Visualization
- ✅ Sentiment trend charts (Recharts)
- ✅ Stock performance area charts
- ✅ Color-coded sentiment indicators (red/yellow/green)
- ✅ Responsive grid layouts
- ✅ Interactive tooltips and hover states

### Activity Feed
- ✅ Multi-source activity tracking (news, social, reports)
- ✅ Sentiment overlay on activity cards
- ✅ 2-column responsive grid
- ✅ Time-ago formatting
- ✅ External link navigation
- 🔄 Real-time updates via WebSocket (coming soon)

### User Experience
- ✅ Loading states with spinners
- ✅ Error handling with fallbacks
- ✅ Smooth animations and transitions
- ✅ Custom confirmation modals
- ✅ Toast notifications (planned)
- ✅ Dark mode support (infrastructure ready)

---

## 🏗️ Architecture

```
insight-vault/
├── backend/                 # Node.js + Express API
│   ├── controllers/        # Route handlers
│   ├── services/           # Business logic
│   ├── db/                 # Database connection
│   └── config/             # Configuration files
│
│
└── frontend/          # React app (Tailwind + shadcn)
    └── src/
        ├── features/
        │   ├── auth/       # Login/Register pages
        │   └── dashboard/  # Main dashboard
        ├── components/
        │   ├── Sidebar.jsx          # Competitor list
        │   ├── TopBar.jsx           # Navigation bar
        │   ├── Dashboard.jsx        # Main layout
        │   └── dashboard/           # Dashboard components
        │       ├── CompanyOverview.jsx
        │       ├── SentimentChart.jsx
        │       ├── StockChart.jsx
        │       └── ActivityFeed.jsx
        ├── stores/         # Zustand auth store
        └── lib/            # Utility functions
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.1.1 + Vite 7.1.9
- **Routing**: React Router DOM 6.x
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4.x + @tailwindcss/postcss
- **UI Components**: Radix UI primitives (Select, Avatar, Dialog, Dropdown)
- **Charts**: Recharts 2.x
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: PostgreSQL (assumed)
- **Authentication**: JWT (jsonwebtoken)
- **API Style**: RESTful

### Design System
- **Color Scheme**: HSL-based with CSS variables
- **Sentiment Colors**: 
  - Positive: `hsl(142 76% 36%)` - Green
  - Negative: `hsl(0 84.2% 60.2%)` - Red
  - Neutral: `hsl(43 96% 56%)` - Yellow
- **Primary Color**: `hsl(221.2 83.2% 53.3%)` - Blue
- **Border Radius**: 0.5rem default

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/edwzeledon/insight-vault.git
   cd insight-vault
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file with your configuration
   # DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, etc.
   
   npm start
   # Backend runs on http://localhost:3000
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

4. **Open your browser**
   ```
   Navigate to http://localhost:5173
   ```

### Default Ports

| Service        | Port  | URL                        |
|---------------|-------|----------------------------|
| Backend API   | 3000  | http://localhost:3000      |
| Frontend      | 5173  | http://localhost:5173      |

---

## 📁 Project Structure

### Key Files

```
frontend/src/
├── App.jsx                          # Route configuration + auth check
├── main.jsx                         # App entry point with BrowserRouter
├── index.css                        # Global styles + design tokens
│
├── features/
│   ├── auth/pages/
│   │   ├── Login.jsx               # Login form with API integration
│   │   └── Register.jsx            # Registration form
│   └── dashboard/pages/
│       └── DashboardPage.jsx       # Main dashboard container + API logic
│
├── components/
│   ├── Sidebar.jsx                 # Competitor list with add/remove
│   ├── TopBar.jsx                  # Top navigation with logout
│   ├── Dashboard.jsx               # Dashboard layout wrapper
│   └── dashboard/
│       ├── CompanyOverview.jsx     # Metrics cards (sentiment, stock, etc.)
│       ├── SentimentChart.jsx      # Line chart with trend analysis
│       ├── StockChart.jsx          # Area chart for stock performance
│       └── ActivityFeed.jsx        # Latest activity cards
│
├── stores/
│   └── AuthStore.jsx               # Zustand auth state (accessToken)
│
└── lib/
    └── utils.js                     # Helper functions (cn, formatters)
```

---

## 📡 API Documentation

### Authentication Endpoints

#### `POST /auth/register`
Register a new user.

**Request Body:**
```json
{
  "fname": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `POST /auth/login`
Login existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `POST /auth/refresh`
Refresh access token using HTTP-only cookie.

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `DELETE /auth/logout`
Logout user and clear cookies.

**Response:**
```json
{
  "success": true
}
```

---

### Competitor Management Endpoints

#### `GET /getUserCompetitors`
Fetch all competitors for authenticated user.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "organizations": [
    {
      "org_id": 123,
      "name": "TechCorp Inc."
    },
    {
      "org_id": 456,
      "name": "InnovateSoft"
    }
  ]
}
```

#### `POST /addcompetitor`
Add a new competitor to track.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "CloudVentures"
}
```

**Response:**
```json
{
  "org_id": 789,
  "name": "CloudVentures"
}
```

#### `DELETE /userCompetitors/:id`
Remove a competitor from tracking.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true
}
```

---


## 🔧 Configuration

### Environment Variables

**Backend** (`.env`):
```env
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=insight_vault
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development
```

**Frontend** (`.env`):
```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 👥 Authors

- **Edwin Zeledon** - [@edwzeledon](https://github.com/edwzeledon)
