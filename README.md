# STMockup - Stock Market Social Platform Mockup

A modern, high-fidelity mockup of a stock market social platform built with React, Vite, and Tailwind CSS. This project demonstrates complex UI patterns, gated content states, and real-time-like data visualizations.

## 🚀 Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```

## 🗺️ Page Routes & Features

The application is structured around several key routes, each demonstrating different states and layouts:

### 🏠 Home (`/home`)
The primary landing experience providing a broad market overview.
- **Live Event Stream**: Integrated video player placeholder for live market events.
- **Market Sentiment**: Fear & Greed sentiment meters.
- **Trending Carousels**: Horizontal carousels for Trending Symbols, Trending Topics, and upcoming Earnings Calls grouped by date.

### 📊 Registered Dashboard (`/registered`)
The full, authenticated user experience.
- **Interactive Feed**: Toggle between Latest and Popular posts with poll integration.
- **Stock Header**: Collapsible header for specific stocks (e.g., $RKLB) featuring real-time price data, sparklines, and comprehensive market stats.
- **Watchlist Sidebar**: A fixed left sidebar with user profile, notifications, and a real-time watchlist with mini-sparklines.
- **Community Widgets**: Prediction leaderboards, community voices, and latest news.

### 🔒 Unregistered Dashboard (`/unreg`)
A demonstration of "soft-gated" content for prospective users.
- **Gated Elements**: Uses `SoftGate` and `HardGate` components to blur or lock premium features (e.g., full community perspectives, leaderboard, and full news feed).
- **Registration CTAs**: Strategically placed calls-to-action to encourage user sign-up.

### 🆕 Experimental Layout (`/newpage`)
A prototype for an alternative dashboard structure.
- **Narrative Timeline**: A chronological view of market events and community posts.
- **Reorganized Widgets**: Focuses on "What's Happening" and community predictions in a different grid arrangement.

## 🛠️ Core Components

- **`CollapsibleStockHeader`**: A sophisticated header component for ticker-specific data.
- **`DynamicThemes`**: Content filtering system based on market themes like "Fed Decision" or "China Tariffs".
- **`LeftSidebar`**: Fixed navigation with integrated dark mode toggle and watchlist management.
- **`SentimentMeters`**: Visual tools for tracking community and market sentiment.
- **`TickerTape`**: A classic scrolling ticker for broad market indices and watchlist stocks.
- **`MessagePostBox`**: Rich text area for community members to share insights and predictions.

## 🎨 Design System

The project uses a custom design system implemented via Tailwind CSS:
- **Dark Mode**: Fully supported with persistent user preference.
- **Surface System**: Layered background colors (`bg-surface`, `bg-surface-muted`) for depth.
- **Interactive States**: Smooth transitions for hover and pressed states across all buttons and cards.

---

*Note: This is a frontend mockup. Data is currently simulated for demonstration purposes.*
